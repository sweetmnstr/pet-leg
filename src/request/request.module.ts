import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from './request.entity';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Request]), UserModule],
  controllers: [RequestController],
  providers: [RequestService],
})
export class RequestModule {}
