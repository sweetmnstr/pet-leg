import { Module, forwardRef } from '@nestjs/common';
import { FavoriteController } from './favorite.controller';
import { FavoriteService } from './favorite.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './favorite.entity';
import { CustomerModule } from '../customer/customer.module';
import { LawyerModule } from '../lawyer/lawyer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Favorite]),
    forwardRef(() => CustomerModule),
    forwardRef(() => LawyerModule),
  ],
  controllers: [FavoriteController],
  providers: [FavoriteService],
  exports: [FavoriteService],
})
export class FavoriteModule {}
