import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { SignInDto } from '../auth/dto/signin.dto';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UsersTitlesDto } from './dto/users-titles.dto';

@Injectable()
export class UserService extends TypeOrmCrudService<User> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  static async encryptPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  }

  async createUser(createUserDTO: CreateUserDTO): Promise<void> {
    await this.userRepository.insert(createUserDTO);
  }

  async getUser(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: { lawyer: true, customer: true, notificationFilters: true },
    });
  }

  async updateUser(
    id: number,
    updateQuery: QueryDeepPartialEntity<User>,
  ): Promise<void> {
    const clearUpdateQuery = Object.entries(updateQuery).reduce(
      (acc, [key, value]) => (value ? { ...acc, [key]: value } : acc),
      {},
    );

    if (Object.keys(clearUpdateQuery).length === 0) return;

    await this.userRepository.update(id, clearUpdateQuery);
  }

  async getUserWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where(`user.email = :email`, { email })
      .leftJoinAndSelect('user.lawyer', 'lawyer')
      .leftJoinAndSelect('user.customer', 'customer')
      .addSelect('user.password')
      .getOne();
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: { lawyer: true, customer: true },
    });
  }

  async getUserByAuth(authUser: SignInDto): Promise<User | null> {
    return this.getUserByEmail(authUser.email);
  }

  async matchExistingUser(
    email: string,
    where: { [p: string]: any } = {},
  ): Promise<boolean> {
    const user = await this.findOne({ where: { email, ...where } });
    return !!user;
  }

  async updatePassword(id: number, password: string): Promise<void> {
    const hashedPassword = await UserService.encryptPassword(password);
    await this.userRepository.update(id, { password: hashedPassword });
  }

  async getUsersTitles(getUsersTitlesBody: {
    usersIdentities: string[];
  }): Promise<UsersTitlesDto[]> {
    return this.userRepository.find({
      where: {
        twilioIdentitySid: In(getUsersTitlesBody.usersIdentities),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photo: true,
        email: true,
        twilioIdentitySid: true,
      },
    });
  }
}
