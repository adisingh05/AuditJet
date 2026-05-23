import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  Integration,
  IntegrationType,
  IntegrationStatus,
} from './integration.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    @InjectRepository(Integration)
    private integrationRepo: Repository<Integration>,
    private httpService: HttpService,
    private config: ConfigService,
  ) {}

  // ─── GitHub OAuth ───────────────────────────────────────
  getGithubAuthUrl(organizationId: string): string {
    const clientId = this.config.get('GITHUB_CLIENT_ID');
    const redirectUri = this.config.get('GITHUB_REDIRECT_URI');
    const state = Buffer.from(organizationId).toString('base64');
    const scope = 'read:org,repo,read:user,audit_log';
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
  }

  async handleGithubCallback(
    code: string,
    state: string,
  ): Promise<Integration> {
    const organizationId = Buffer.from(state, 'base64').toString('utf-8');
    const clientId = this.config.get('GITHUB_CLIENT_ID');
    const clientSecret = this.config.get('GITHUB_CLIENT_SECRET');

    // Exchange code for token
    const tokenRes = await firstValueFrom(
      this.httpService.post(
        'https://github.com/login/oauth/access_token',
        { client_id: clientId, client_secret: clientSecret, code },
        { headers: { Accept: 'application/json' } },
      ),
    );

    const { access_token } = tokenRes.data;

    // Get GitHub org info
    const userRes = await firstValueFrom(
      this.httpService.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${access_token}` },
      }),
    );

    // Save or update integration
    let integration = await this.integrationRepo.findOne({
      where: { organizationId, type: IntegrationType.GITHUB },
    });

    if (!integration) {
      integration = this.integrationRepo.create({
        organizationId,
        type: IntegrationType.GITHUB,
      });
    }

    integration.accessToken = access_token;
    integration.status = IntegrationStatus.CONNECTED;
    integration.metadata = {
      githubUsername: userRes.data.login,
      githubId: userRes.data.id,
      avatarUrl: userRes.data.avatar_url,
    };

    return this.integrationRepo.save(integration);
  }

  // ─── Collect GitHub Evidence ─────────────────────────────
  async collectGithubEvidence(organizationId: string): Promise<any> {
    const integration = await this.integrationRepo.findOne({
      where: {
        organizationId,
        type: IntegrationType.GITHUB,
        status: IntegrationStatus.CONNECTED,
      },
    });

    if (!integration) throw new Error('GitHub not connected');

    const headers = { Authorization: `Bearer ${integration.accessToken}` };
    const evidence: any = {
      collectedAt: new Date(),
      type: 'github',
      controls: {},
    };

    try {
      // 1. Get repositories
      const reposRes = await firstValueFrom(
        this.httpService.get('https://api.github.com/user/repos?per_page=100', {
          headers,
        }),
      );
      evidence.repositories = reposRes.data.length;

      // 2. Check branch protection (CC8.1 - Change Management)
      const branchProtection: Array<{ repo: string; protected: boolean; requiresReview?: boolean }> = [];
      for (const repo of reposRes.data.slice(0, 10)) {
        try {
          const bpRes = await firstValueFrom(
            this.httpService.get(
              `https://api.github.com/repos/${repo.full_name}/branches/${repo.default_branch}/protection`,
              { headers },
            ),
          );
          branchProtection.push({
            repo: repo.name,
            protected: true,
            requiresReview:
              bpRes.data.required_pull_request_reviews
                ?.required_approving_review_count > 0,
          });
        } catch {
          branchProtection.push({ repo: repo.name, protected: false });
        }
      }
      evidence.controls['CC8.1'] = {
        name: 'Change Management',
        status: branchProtection.every((b) => b.protected)
          ? 'implemented'
          : 'in_progress',
        evidence: branchProtection,
        score: Math.round(
          (branchProtection.filter((b) => b.protected).length /
            branchProtection.length) *
            100,
        ),
      };

      // 3. Check PR review requirements (SOC2 CC6.1)
      const prReviews = branchProtection.filter((b) => b.requiresReview).length;
      evidence.controls['CC6.1'] = {
        name: 'Logical Access Controls',
        status: prReviews > 0 ? 'implemented' : 'not_started',
        evidence: {
          reposWithPRReviews: prReviews,
          totalRepos: branchProtection.length,
        },
        score: Math.round(
          (prReviews / Math.max(branchProtection.length, 1)) * 100,
        ),
      };

      // 4. Get org members (Access Control)
      try {
        const { login } = integration.metadata as any;
        const membersRes = await firstValueFrom(
          this.httpService.get(`https://api.github.com/orgs/${login}/members`, {
            headers,
          }),
        );
        evidence.controls['CC6.2'] = {
          name: 'Access Provisioning',
          status: 'implemented',
          evidence: { totalMembers: membersRes.data.length },
          score: 100,
        };
      } catch {
        /* Personal account, skip org members */
      }

      // 5. Recent commits (Audit Trail - CC7.1)
      const recentActivity: Array<{ repo: string; recentCommits: number; lastCommit?: string | null }> = [];
      for (const repo of reposRes.data.slice(0, 5)) {
        const commitsRes = await firstValueFrom(
          this.httpService.get(
            `https://api.github.com/repos/${repo.full_name}/commits?per_page=5`,
            { headers },
          ),
        );
        recentActivity.push({
          repo: repo.name,
          recentCommits: commitsRes.data.length,
          lastCommit: commitsRes.data[0]?.commit?.author?.date,
        });
      }
      evidence.controls['CC7.1'] = {
        name: 'System Operations & Monitoring',
        status: 'implemented',
        evidence: recentActivity,
        score: 100,
      };

      // Update last sync
      integration.lastSyncAt = new Date();
      integration.status = IntegrationStatus.CONNECTED;
      await this.integrationRepo.save(integration);

      return evidence;
    } catch (error: any) {
      integration.status = IntegrationStatus.ERROR;
      integration.errorMessage =
        error?.message ?? (typeof error === 'string' ? error : JSON.stringify(error));
      await this.integrationRepo.save(integration);
      throw error;
    }
  }

  async getIntegrations(organizationId: string): Promise<Integration[]> {
    return this.integrationRepo.find({ where: { organizationId } });
  }

  async disconnectIntegration(
    organizationId: string,
    type: IntegrationType,
  ): Promise<void> {
    await this.integrationRepo.update(
      { organizationId, type },
      {
        status: IntegrationStatus.DISCONNECTED,
        accessToken: '',
        refreshToken: '',
      },
    );
  }
}
