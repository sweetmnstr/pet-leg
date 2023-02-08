import { Module, forwardRef } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './customer.entity';
import { UserModule } from '../user/user.module';
import { ConsultationModule } from '../consultation/consultation.module';
import { ScheduleModule } from '../schedule/schedule.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    UserModule,
    forwardRef(() => ConsultationModule),
    ScheduleModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
