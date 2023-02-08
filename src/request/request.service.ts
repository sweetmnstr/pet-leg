import { BadRequestException, Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Request } from './request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestTypes } from './enum/request-types.enum';
import { GetUserRequestsDto } from './dto/get-user-requests.dto';
import { UserService } from '../user/user.service';
import { RequestStatusesEnum } from './enum/request-statuses.enum';
import { CreateAskQuestionRequestDto } from './dto/create-ask-question-request.dto';

@Injectable()
export class RequestService extends TypeOrmCrudService<Request> {
  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    private userService: UserService,
  ) {
    super(requestRepository);
  }

  async getUserRequests(
    userId: number,
    getUserRequests: GetUserRequestsDto,
  ): Promise<Request[]> {
    const { status, type } = getUserRequests;

    return this.requestRepository.find({
      where: { requester: userId, status, type },
    });
  }

  async getUserRegistrationRequest(userId: number): Promise<Request> {
    return this.requestRepository.findOne({
      where: {
        requester: userId,
        type: RequestTypes.REGISTRATION_REQUEST,
      },
    });
  }

  async createAskQuestionRequest(
    createRequest: CreateAskQuestionRequestDto,
  ): Promise<Request> {
    const insertionResult = await this.requestRepository.insert({
      ...createRequest,
      status: RequestStatusesEnum.PENDING,
    });

    const [request] = insertionResult.raw;

    return request;
  }

  async createRequest(
    userId: number,
    createRequest: CreateRequestDto,
  ): Promise<Request> {
    const user = await this.userService.getUser(userId);

    if (!user) {
      throw new BadRequestException('INVALID_USER');
    }

    if (createRequest.type === RequestTypes.REGISTRATION_REQUEST) {
      const registrationRequest = await this.getUserRegistrationRequest(userId);

      if (registrationRequest) {
        throw new BadRequestException('USER_HAS_PENDING_REGISTRATION_REQUEST');
      }
    }

    const insertionResult = await this.requestRepository.insert({
      ...createRequest,
      requester: userId,
      status: RequestStatusesEnum.PENDING,
    });

    const [request] = insertionResult.raw;

    return request;
  }
}
