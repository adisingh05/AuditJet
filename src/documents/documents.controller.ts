import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private svc: DocumentsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a document to S3' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Request() req,
  ) {
    return this.svc.upload(file, { ...body, uploadedById: req.user.id });
  }

  @Get()
  @ApiOperation({ summary: 'List documents' })
  findAll(
    @Query('frameworkId') frameworkId?: string,
    @Query('controlId') controlId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    return this.svc.findAll({ frameworkId, controlId, category, status });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Document statistics' })
  getStats() {
    return this.svc.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  findOne(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get signed S3 download URL' })
  getDownloadUrl(@Param('id') id: string) {
    return this.svc.getSignedDownloadUrl(id);
  }

  @Patch(':id/approve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Approve document' })
  approve(@Param('id') id: string, @Request() req) {
    return this.svc.approve(id, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Delete document' })
  remove(@Param('id') id: string) {
    return this.svc.delete(id);
  }
}
