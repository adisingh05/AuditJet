import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportingController {
  constructor(private svc: ReportingService) {}

  @Post('pdf')
  @ApiOperation({ summary: 'Generate compliance PDF report' })
  async generatePdf(@Body() body: any, @Res() res: Response) {
    const pdf = await this.svc.generateCompliancePdf({
      ...body,
      reportDate: new Date(),
    });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="compliance-report-${Date.now()}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.end(pdf);
  }

  @Get('trend/:frameworkId')
  @ApiOperation({ summary: 'Get compliance score trend over time' })
  getTrend(
    @Param('frameworkId') frameworkId: string,
    @Query('days') days?: number,
  ) {
    return this.svc.getComplianceTrend(frameworkId, days ? +days : 90);
  }
}
