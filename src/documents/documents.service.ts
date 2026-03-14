import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import { Document, DocumentStatus } from './document.entity';

@Injectable()
export class DocumentsService {
  private s3: S3Client;
  private bucket: string;

  constructor(
    @InjectRepository(Document) private docRepo: Repository<Document>,
    private config: ConfigService,
  ) {
    this.s3 = new S3Client({
      region: config.get('AWS_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: config.get('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY', ''),
      },
    });
    this.bucket = config.get('AWS_S3_BUCKET', 'compliance-docs');
  }

  async upload(
    file: Express.Multer.File,
    metadata: {
      name: string;
      description?: string;
      category?: any;
      frameworkId?: string;
      controlId?: string;
      tags?: string[];
      uploadedById: string;
    },
  ): Promise<Document> {
    const key = `documents/${uuid()}/${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: { uploadedBy: metadata.uploadedById },
      }),
    );

    const s3Url = `https://${this.bucket}.s3.amazonaws.com/${key}`;
    const doc = this.docRepo.create({
      ...metadata,
      s3Key: key,
      s3Url,
      mimeType: file.mimetype,
      fileSize: file.size,
    });
    return this.docRepo.save(doc);
  }

  async getSignedDownloadUrl(id: string): Promise<string> {
    const doc = await this.findById(id);
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: doc.s3Key,
    });
    return getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  async findAll(filters?: {
    frameworkId?: string;
    controlId?: string;
    category?: string;
    status?: string;
  }) {
    const query = this.docRepo.createQueryBuilder('doc');
    if (filters?.frameworkId)
      query.andWhere('doc.frameworkId = :fid', { fid: filters.frameworkId });
    if (filters?.controlId)
      query.andWhere('doc.controlId = :cid', { cid: filters.controlId });
    if (filters?.category)
      query.andWhere('doc.category = :cat', { cat: filters.category });
    if (filters?.status)
      query.andWhere('doc.status = :status', { status: filters.status });
    return query.orderBy('doc.createdAt', 'DESC').getMany();
  }

  async findById(id: string): Promise<Document> {
    const doc = await this.docRepo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async approve(id: string, approverId: string): Promise<Document> {
    await this.docRepo.update(id, {
      status: DocumentStatus.APPROVED,
      approvedById: approverId,
      approvedAt: new Date(),
    });
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const doc = await this.findById(id);
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: doc.s3Key }),
    );
    await this.docRepo.remove(doc);
  }

  async getStats() {
    const total = await this.docRepo.count();
    const byCategory = await this.docRepo
      .createQueryBuilder('d')
      .select('d.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('d.category')
      .getRawMany();
    const byStatus = await this.docRepo
      .createQueryBuilder('d')
      .select('d.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('d.status')
      .getRawMany();
    return { total, byCategory, byStatus };
  }
}
