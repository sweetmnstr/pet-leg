import { Module } from '@nestjs/common';
import { NotificationFiltersController } from './notification-filters.controller';
import { NotificationFiltersService } from './notification-filters.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationFilters } from './notification-filters.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationFilters]), UserModule],
  controllers: [NotificationFiltersController],
  providers: [NotificationFiltersService],
  exports: [NotificationFiltersService],
})
export class NotificationFiltersModule {}
