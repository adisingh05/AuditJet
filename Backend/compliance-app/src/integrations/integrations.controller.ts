import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Delete,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IntegrationsService } from './integrations.service';
import type { IntegrationType } from './integration.entity';
import type { Response } from 'express';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @Get()
  getIntegrations(@Req() req: any) {
    return this.integrationsService.getIntegrations(req.user.id);
  }

  @Get('github/auth-url')
  getGithubAuthUrl(@Req() req: any) {
    const url = this.integrationsService.getGithubAuthUrl(req.user.id);
    return { url };
  }

  @Get('github/callback')
  async githubCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    await this.integrationsService.handleGithubCallback(code, state);
    return res.redirect(
      `${process.env.FRONTEND_URL}/dashboard/integrations?connected=github`,
    );
  }

  @Post('github/sync')
  syncGithub(@Req() req: any) {
    return this.integrationsService.collectGithubEvidence(req.user.id);
  }

  @Delete(':type')
  disconnect(@Req() req: any, @Param('type') type: IntegrationType) {
    return this.integrationsService.disconnectIntegration(req.user.id, type);
  }
}
