import { Module } from '@nestjs/common';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqCategory } from './entities/faq-category.entity';
import { Question } from './entities/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FaqCategory, Question])],
  controllers: [FaqController],
  providers: [FaqService],
})
export class FaqModule {}
