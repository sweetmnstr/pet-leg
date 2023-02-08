import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Recommendations } from './recommendations.entity';
import { RecommendationTypes } from './recommendations.enum';

@Injectable()
export class RecommendationsService extends TypeOrmCrudService<Recommendations> {
  constructor(
    @InjectRepository(Recommendations)
    private recommendationsRepository: Repository<Recommendations>,
  ) {
    super(recommendationsRepository);
  }

  private mapRecommendations(recommendations, type) {
    const locales = ['en', 'uk'];
    return recommendations.map((recommendation) => {
      const recommendationLocales = {};
      locales.forEach((locale) => {
        const language = {};
        recommendation.values.forEach((recommendationValue) => {
          language[recommendationValue] =
            recommendation.locales[recommendationValue][locale];
        });
        recommendationLocales[locale] = language;
      });

      return {
        type,
        recommendationLocales,
      };
    });
  }

  private reduceRecommendations(recommendations) {
    const locales = ['en', 'uk'];
    const categories = [];
    return recommendations.reduce((acc, recommendation) => {
      const category = acc.find(
        (category) => category.category === recommendation.category,
      );

      const recommendationLocales = {};
      locales.forEach((locale) => {
        const language = {};
        recommendation.values.forEach((recommendationValue) => {
          language[recommendationValue] =
            recommendation.locales[recommendationValue][locale];
        });
        recommendationLocales[locale] = language;
      });

      if (!!category) {
        category.recommendations.push(recommendationLocales);
      } else {
        const newCategory = recommendation.category;

        acc.push({
          category: newCategory,
          recommendations: [recommendationLocales],
        });
      }
      return categories;
    }, categories);
  }

  async getRecommendations() {
    const recommendations = await this.recommendationsRepository.find({
      select: ['locales', 'values'],
      where: { type: RecommendationTypes.Recommendations },
    });

    return this.mapRecommendations(
      recommendations,
      RecommendationTypes.Recommendations,
    );
  }

  async getPopularSearches() {
    const recommendations = await this.recommendationsRepository.find({
      select: ['locales', 'values'],
      where: { type: RecommendationTypes.PopularSearch },
    });

    return this.mapRecommendations(
      recommendations,
      RecommendationTypes.PopularSearch,
    );
  }

  async getLawyersLinks() {
    const recommendations = await this.recommendationsRepository.find({
      select: ['locales', 'values', 'category'],
      where: { type: RecommendationTypes.LawyersLinks },
    });

    return this.reduceRecommendations(recommendations);
  }
}
