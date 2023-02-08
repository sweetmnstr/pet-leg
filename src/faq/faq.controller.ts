import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { GetFAQDTO } from './dto/get-faq.dto';
import { FaqCategory } from './entities/faq-category.entity';
import { Question } from './entities/question.entity';
import { FaqService } from './faq.service';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get('get-faq')
  @HttpCode(200)
  getFaq(@Query() getFAQDTO: GetFAQDTO): Promise<Question[]> {
    return this.faqService.getFAQ(getFAQDTO);
  }
}
