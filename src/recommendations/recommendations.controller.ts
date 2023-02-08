import { Controller, Get, HttpCode } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get('get-recommendations')
  @HttpCode(200)
  async getRecommendations() {
    return this.recommendationsService.getRecommendations();
  }

  @Get('get-popular-searches')
  @HttpCode(200)
  async getPopularSearches() {
    return this.recommendationsService.getPopularSearches();
  }

  @Get('get-lawyers-links')
  @HttpCode(200)
  async getLawyersLinks() {
    return this.recommendationsService.getLawyersLinks();
  }
}
