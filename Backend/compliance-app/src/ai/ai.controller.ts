import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private svc: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI compliance assistant' })
  chat(@Body() body: { message: string; context?: string }) {
    return this.svc.chatWithCompliance(body.message, body.context);
  }

  @Post('analyze-control')
  @ApiOperation({ summary: 'AI analysis of a compliance control' })
  analyzeControl(@Body() body: any) {
    return this.svc.analyzeControl(body);
  }

  @Post('analyze-risk')
  @ApiOperation({ summary: 'AI analysis of a compliance risk' })
  analyzeRisk(@Body() body: any) {
    return this.svc.analyzeRisk(body);
  }

  @Post('generate-report')
  @ApiOperation({ summary: 'Generate AI compliance report summary' })
  generateReport(@Body() body: any) {
    return this.svc.generateComplianceReport(body);
  }
}
