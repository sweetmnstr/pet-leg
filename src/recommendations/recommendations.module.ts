import { Module } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendations } from './recommendations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recommendations])],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
