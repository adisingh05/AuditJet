import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiProcessor } from './ai.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'ai-tasks' })],
  providers: [AiService, AiProcessor],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
