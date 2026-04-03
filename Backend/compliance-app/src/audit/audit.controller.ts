import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { AuditAction } from './audit.entity';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private svc: AuditService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get audit logs with filters' })
  findAll(
    @Query('userId') userId?: string,
    @Query('resource') resource?: string,
    @Query('action') action?: AuditAction,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.svc.findAll({
      userId,
      resource,
      action,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: page ? +page : 1,
      limit: limit ? +limit : 50,
    });
  }

  @Get('summary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get activity summary for last N days' })
  getSummary(@Query('days') days = 30) {
    return this.svc.getActivitySummary(+days);
  }
}
