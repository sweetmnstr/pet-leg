import { Injectable, BadRequestException } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { NotificationFilters } from './notification-filters.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserNotificationFiltersDTO } from './dto/update-user-notification-filters.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class NotificationFiltersService extends TypeOrmCrudService<NotificationFilters> {
  constructor(
    @InjectRepository(NotificationFilters)
    private notificationFiltersRepository: Repository<NotificationFilters>,
    private userService: UserService,
  ) {
    super(notificationFiltersRepository);
  }

  async getUserNotificationFilters(userId: number) {
    const user = await this.userService.getUser(userId);
    if (!user) throw new BadRequestException('INVALID_USER_ID');

    return this.notificationFiltersRepository.findOne({
      where: { id: user.notificationFilters.id },
    });
  }

  async updateUserNotificationFilters(
    userId: number,
    updateNotificationFiltersDTO: UpdateUserNotificationFiltersDTO,
  ) {
    const notificationFilters = await this.getUserNotificationFilters(userId);
    return this.notificationFiltersRepository.update(
      notificationFilters.id,
      updateNotificationFiltersDTO,
    );
  }

  async createUserNotificationFilters(): Promise<NotificationFilters> {
    const insertResult = await this.notificationFiltersRepository.insert({});

    const [notificationFilters] = insertResult.raw;

    return notificationFilters;
  }
}
