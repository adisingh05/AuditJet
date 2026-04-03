import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { FrameworkType } from './compliance.entity';

@ApiTags('compliance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('compliance')
export class ComplianceController {
  constructor(private svc: ComplianceService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get compliance dashboard stats' })
  getDashboard() {
    return this.svc.getDashboardStats();
  }

  @Post('frameworks')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Create framework (SOC2, ISO27001, GDPR etc.)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: [
            'SOC2',
            'ISO27001',
            'GDPR',
            'HIPAA',
            'PCI_DSS',
            'NIST',
            'CUSTOM',
          ],
          example: 'SOC2',
        },
      },
    },
  })
  createFramework(@Body() body: { type: FrameworkType; [key: string]: any }) {
    const { type, ...customData } = body;
    return this.svc.createFramework(type, customData);
  }

  @Get('frameworks')
  @ApiOperation({ summary: 'List all frameworks' })
  getFrameworks() {
    return this.svc.getAllFrameworks();
  }

  @Get('frameworks/:id')
  @ApiOperation({ summary: 'Get framework with controls and stats' })
  getFramework(@Param('id') id: string) {
    return this.svc.getFrameworkById(id);
  }

  @Get('controls')
  @ApiOperation({ summary: 'Get controls, optionally filtered by framework' })
  getControls(@Query('frameworkId') frameworkId?: string) {
    return this.svc.getControls(frameworkId);
  }

  @Patch('controls/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Update control status/evidence/notes' })
  updateControl(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateControl(id, body);
  }

  @Post('risks')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Create a risk' })
  createRisk(@Body() body: any) {
    return this.svc.createRisk(body);
  }

  @Get('risks')
  @ApiOperation({ summary: 'Get risks with optional filters' })
  getRisks(
    @Query('frameworkId') frameworkId?: string,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
  ) {
    return this.svc.getRisks({ frameworkId, severity, status });
  }

  @Patch('risks/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Update risk' })
  updateRisk(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateRisk(id, body);
  }
}
