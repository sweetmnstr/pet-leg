import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Like, Repository } from 'typeorm';
import { GetFAQDTO } from './dto/get-faq.dto';
import { FaqCategory } from './entities/faq-category.entity';
import { Question } from './entities/question.entity';

@Injectable()
export class FaqService extends TypeOrmCrudService<FaqCategory> {
  constructor(
    @InjectRepository(FaqCategory)
    private faqCategoryRepository: Repository<FaqCategory>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {
    super(faqCategoryRepository);
  }

  async getFAQ(getFAQDTO: GetFAQDTO): Promise<Question[]> {
    const categories: any = [];
    const { question, country, type } = getFAQDTO;

    const query = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.category', 'category')
      .where('category.type = :type', { type });

    if (question) {
      query.andWhere('question.question like :question', {
        question: `%${question}%`,
      });
    }
    if (country) {
      query.andWhere('question.country = :country', { country });
    }
    const questions = await query.getMany();
    return questions.reduce((acc, question) => {
      const category = acc.filter(
        (category) => category.name === question.category.name,
      )[0];
      if (!!category) {
        delete question.category;
        category.questions.push(question);
      } else {
        const newCategory = question.category;

        delete newCategory.id;
        delete question.category;

        acc.push({ ...newCategory, questions: [question] });
      }
      return categories;
    }, categories);
  }
}
