import { Module } from '@nestjs/common';
import { SharedLinkService } from './shared-link.service';
import { SharedLinkController } from './shared-link.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedLink } from './shared-link.entity';
import { ConsultationModule } from '../consultation/consultation.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SharedLink]),
    ConsultationModule,
    UserModule,
  ],
  providers: [SharedLinkService],
  controllers: [SharedLinkController],
})
export class SharedLinkModule {}
