import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Feedback } from './feedback.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateFeedbackDTO } from './dto/create-feedback.dto';
import { CustomerService } from '../customer/customer.service';
import { LawyerService } from '../lawyer/lawyer.service';
import { LawyerFeedbackParamsDto } from './dto/lawyer-feedback-params.dto';
import { GetFeedbackDTO } from './dto/get-feedback.dto';
import { GetLawyerFeedbackDto } from './dto/get-lawyer-feedbacks.dto';

@Injectable()
export class FeedbackService extends TypeOrmCrudService<Feedback> {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @Inject(forwardRef(() => CustomerService))
    private customerService: CustomerService,
    @Inject(forwardRef(() => LawyerService))
    private lawyerService: LawyerService,
  ) {
    super(feedbackRepository);
  }

  async isCustomerExists(customerId: number): Promise<boolean> {
    return this.customerService.isCustomerExists(customerId);
  }

  async isLawyerExists(lawyerId: number): Promise<boolean> {
    return !!(await this.lawyerService.getLawyer(lawyerId));
  }

  async getLawyerFeedbacks(
    lawyerId: number,
    params: LawyerFeedbackParamsDto,
  ): Promise<GetLawyerFeedbackDto> {
    const { page, limit } = params;
    const options: FindManyOptions<Feedback> = {
      relations: {
        customer: {
          user: true,
        },
      },
      where: { lawyer: { id: lawyerId } },
      take: limit || 500,
      skip: limit && page ? limit * (page - 1) : 0,
    };
    const [reviews, total] = await this.feedbackRepository.findAndCount(
      options,
    );
    const averageGrade = Math.ceil(
      reviews.reduce((acc, review) => acc + review.grade, 0) / reviews.length,
    );
    return {
      averageGrade,
      total,
      grades: await this.getLawyerGrades(lawyerId),
      reviews: reviews.map((feedback) => this.toFeedbackData(feedback)),
    };
  }

  async getLawyerGrades(lawyerId: number): Promise<{ [p: string]: number }> {
    const select = `
      COUNT(CASE WHEN grade > 0.5 AND grade < 1.5 THEN 1 ELSE NULL END) AS one,
      COUNT(CASE WHEN grade >= 1.5 AND grade < 2.5 THEN 1 ELSE NULL END) AS two,
      COUNT(CASE WHEN grade >= 2.5 AND grade < 3.5 THEN 1 ELSE NULL END) AS three,
      COUNT(CASE WHEN grade >= 3.5 AND grade < 4.5 THEN 1 ELSE NULL END) AS four,
      COUNT(CASE WHEN grade >= 4.5 AND grade <= 5 THEN 1 ELSE NULL END) AS five
    `;
    const raw = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select(select)
      .where('feedback.lawyerId = :lawyerId', { lawyerId })
      .getRawOne();

    return Object.keys(raw).reduce((grades, col) => {
      grades[`${col}Stars`] = +raw[col];
      return grades;
    }, {});
  }

  async create(createFeedbackDto: CreateFeedbackDTO): Promise<GetFeedbackDTO> {
    const customer = await this.customerService.findCustomer(
      createFeedbackDto.customerId,
    );
    if (!customer) throw new BadRequestException('Customer is not exists');

    const lawyer = await this.lawyerService.getLawyer(
      createFeedbackDto.lawyerId,
    );
    if (!lawyer) throw new BadRequestException('Lawyer is not exists');

    const item = this.feedbackRepository.create({
      ...createFeedbackDto,
      customer,
      lawyer,
    });
    return this.toFeedbackData(await this.feedbackRepository.save(item));
  }

  toFeedbackData(feedback: Feedback): GetFeedbackDTO {
    const { id, customer, grade, review, createdAt } = feedback;
    return {
      id,
      fullName: `${customer.user.firstName} ${customer.user.lastName}`,
      avatar: '',
      grade,
      review,
      createdAt,
    };
  }
}
