import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private config: ConfigService,
    @InjectQueue('ai-tasks') private aiQueue: Queue,
  ) {
    this.openai = new OpenAI({
      apiKey: config.get('OPENAI_API_KEY'),
    });
  }

  async analyzeControl(control: {
    name: string;
    description: string;
    status: string;
    notes?: string;
  }) {
    const prompt = `You are a compliance expert. Analyze this compliance control and provide actionable recommendations:

Control: ${control.name}
Description: ${control.description}
Current Status: ${control.status}
Notes: ${control.notes || 'None'}

Provide a JSON response with:
{
  "riskLevel": "low|medium|high|critical",
  "gaps": ["list of identified gaps"],
  "recommendations": ["list of specific recommendations"],
  "implementationSteps": ["step-by-step implementation guide"],
  "estimatedEffort": "days/weeks to implement",
  "priority": 1-10
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content ?? '{}');
  }

  async analyzeRisk(risk: {
    title: string;
    description: string;
    category: string;
    likelihood: number;
    impact: number;
  }) {
    const prompt = `You are a risk management expert. Analyze this compliance risk:

Risk: ${risk.title}
Description: ${risk.description}
Category: ${risk.category}
Likelihood (1-5): ${risk.likelihood}
Impact (1-5): ${risk.impact}

Provide a JSON response with:
{
  "riskScore": number,
  "riskRating": "low|medium|high|critical",
  "mitigationStrategies": ["specific strategies"],
  "regulatoryImplications": ["relevant regulations affected"],
  "immediateActions": ["actions to take now"],
  "longTermActions": ["long-term mitigation plan"],
  "relatedControls": ["suggested control frameworks"]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content ?? '{}');
  }

  async generateComplianceReport(frameworkData: {
    name: string;
    type: string;
    controls: any[];
    risks: any[];
    score: number;
  }) {
    const prompt = `You are a compliance officer generating an executive summary report.

Framework: ${frameworkData.name} (${frameworkData.type})
Overall Compliance Score: ${frameworkData.score}%
Total Controls: ${frameworkData.controls.length}
Implemented: ${frameworkData.controls.filter((c) => c.status === 'implemented').length}
Open Risks: ${frameworkData.risks.filter((r) => r.status === 'open').length}
Critical Risks: ${frameworkData.risks.filter((r) => r.severity === 'critical').length}

Generate a professional executive summary JSON:
{
  "executiveSummary": "2-3 paragraph summary",
  "keyFindings": ["top 5 findings"],
  "criticalIssues": ["issues requiring immediate attention"],
  "achievements": ["areas of strong compliance"],
  "roadmap": ["next 90-day action items"],
  "overallRating": "non-compliant|partial|compliant|fully-compliant"
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content ?? '{}');
  }

  async chatWithCompliance(message: string, context?: string) {
    const systemPrompt = `You are an expert AI compliance assistant 
specializing in SOC 2, ISO 27001, GDPR, HIPAA, and other regulatory frameworks.
You help organizations understand compliance requirements, identify gaps, 
and implement controls.
${context ? `Context: ${context}` : ''}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    });

    return { response: response.choices[0].message.content ?? '' };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scheduleMonitoring() {
    await this.aiQueue.add(
      'daily-compliance-check',
      {},
      {
        attempts: 3,
        backoff: 5000,
      },
    );
  }

  async queueControlAnalysis(controlId: string) {
    return this.aiQueue.add(
      'analyze-control',
      { controlId },
      {
        attempts: 3,
        delay: 1000,
      },
    );
  }

  async queueRiskAnalysis(riskId: string) {
    return this.aiQueue.add(
      'analyze-risk',
      { riskId },
      {
        attempts: 3,
        delay: 1000,
      },
    );
  }
}
