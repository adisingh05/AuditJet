import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';

@Processor('ai-tasks')
export class AiProcessor {
  private readonly logger = new Logger(AiProcessor.name);

  @Process('daily-compliance-check')
  async handleDailyCheck(job: Job) {
    this.logger.log('Running daily AI compliance monitoring...');
    return { status: 'completed', timestamp: new Date() };
  }

  @Process('analyze-control')
  async handleAnalyzeControl(job: Job<{ controlId: string }>) {
    this.logger.log(`Analyzing control: ${job.data.controlId}`);
    return { status: 'queued', controlId: job.data.controlId };
  }

  @Process('analyze-risk')
  async handleAnalyzeRisk(job: Job<{ riskId: string }>) {
    this.logger.log(`Analyzing risk: ${job.data.riskId}`);
    return { status: 'queued', riskId: job.data.riskId };
  }
}
