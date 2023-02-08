import { Injectable, NotFoundException } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Customer } from './customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';
import { User } from '../user/user.entity';
import { UpdateCustomerProfileDTO } from './dto/update-customer-profile.dto';
import { GetCustomerProfileDTO } from './dto/get-customer-profile.dto';
import { UserService } from '../user/user.service';
import { Consultation } from '../consultation/consultation.entity';
import { CreateCustomerDTO } from './dto/create-customer.dto';
import { GetConsultationQueryDTO } from '../consultation/dto/get-consultation-query.dto';
import { ConsultationService } from '../consultation/consultation.service';
import { AuthService } from '../auth/auth.service';
import { ScheduleService } from '../schedule/schedule.service';

@Injectable()
export class CustomerService extends TypeOrmCrudService<Customer> {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private userService: UserService,
    private dataSource: DataSource,
    private readonly consultationService: ConsultationService,
    private readonly scheduleService: ScheduleService,
  ) {
    super(customerRepository);
  }

  async isCustomerExists(id: number): Promise<boolean> {
    return !!(await this.customerRepository.findOne({ where: { id } }));
  }

  async isEmailAlreadyTaken(id: number, email: string): Promise<boolean> {
    return await this.userService.matchExistingUser(email, {
      customer: {
        id: Not(id),
      },
    });
  }

  async findCustomer(id: number): Promise<Customer | null> {
    return await this.customerRepository.findOne({
      where: { id },
      relations: {
        user: true,
      },
    });
  }

  async findCustomerByUserEmail(email: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({
      where: { user: { email } },
      relations: {
        user: true,
      },
    });
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerProfileDTO,
  ): Promise<void> {
    const { firstName, lastName, email, phone, password, timezone, photo } =
      updateCustomerDto;
    const customer = await this.findCustomer(id);
    const { user } = customer;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    if (password) user.password = await AuthService.encryptPassword(password);
    if (timezone) user.timezone = timezone;
    if (photo) user.photo = photo;
    this.dataSource.getRepository(User).save(user);
    await this.customerRepository.save(customer);
  }

  async getCustomerProfile(id: number): Promise<GetCustomerProfileDTO> {
    const customer = await this.findCustomer(id);
    const { firstName, lastName, email, timezone, photo } = customer.user;
    return {
      id,
      firstName,
      lastName,
      email,
      timezone,
      photo,
      bindedSocials: {},
    };
  }
  async createCustomer(
    createCustomerDTO: CreateCustomerDTO,
  ): Promise<Customer> {
    const insertResult = await this.customerRepository.insert(
      createCustomerDTO,
    );

    const [customer] = insertResult.raw;

    return customer;
  }

  async getCustomerConsultationsList(
    id: number,
    filter: GetConsultationQueryDTO,
  ): Promise<any> {
    const customer = await this.findCustomer(id);
    if (!customer) throw new NotFoundException('Customer not found');

    const [consultations, total] =
      await this.consultationService.getManyAndCountBy(
        'customer',
        id,
        filter,
        false,
      );

    return {
      total,
      consultations: consultations.map((consultation) =>
        this.toCustomerConsultationDTO(consultation, customer.user.timezone),
      ),
    };
  }

  toCustomerConsultationDTO(consultation: Consultation, timezone: string) {
    return {
      id: consultation.id,
      lawyer: {
        id: consultation.lawyer.id,
        title: consultation.lawyer.title,
        fullName: `${consultation.lawyer.user.firstName} ${consultation.lawyer.user.lastName}`,
        profileImage: consultation.lawyer.profileImage,
      },
      status: consultation.status,
      grade: consultation.feedback?.grade || 0,
      conversationId: consultation.conversationId || null,
      timeslots: consultation.timeslots.map((timeslot) =>
        this.scheduleService.toLawyerTimeslot(
          timeslot,
          timeslot.date,
          timezone,
        ),
      ),
    };
  }
}
