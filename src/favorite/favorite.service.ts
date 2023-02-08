import {
  Injectable,
  Inject,
  forwardRef,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { DataSource, Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { CustomerService } from '../customer/customer.service';
import { GetFavoriteParams } from './dto/get-favorite-params.dto';
import { Feedback } from '../feedback/feedback.entity';
import { FavoriteDTO } from './dto/favorite.dto';
import { GetCustomerFavoritesDTO } from './dto/get-customer-favorites.dto';
import { SignInDto } from '../auth/dto/signin.dto';
import { LawyerService } from '../lawyer/lawyer.service';
import { IsLawyersInFavoritesDTO } from './dto/is-lawyers-in-favorites.dto';
import { GetAddedFavoriteDTO } from './dto/get-added-favourite.dto';

@Injectable()
export class FavoriteService extends TypeOrmCrudService<Favorite> {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @Inject(forwardRef(() => CustomerService))
    private customerService: CustomerService,
    @Inject(forwardRef(() => LawyerService))
    private lawyerService: LawyerService,
    private dataSource: DataSource,
  ) {
    super(favoriteRepository);
  }

  async isCustomerExists(customerId: number): Promise<boolean> {
    return await this.customerService.isCustomerExists(customerId);
  }

  async findCustomerByUserEmail(authUser: SignInDto) {
    return this.customerService.findCustomerByUserEmail(authUser.email);
  }

  async isLawyerInFavourites(
    customerId: number,
    lawyerId: number,
  ): Promise<boolean> {
    const favorite = await this.dataSource
      .getRepository(Favorite)
      .createQueryBuilder('favorite')
      .where('favorite."lawyerId" = :lawyerId', { lawyerId })
      .andWhere('favorite."customerId" = :customerId', {
        customerId,
      })
      .getOne();
    return !!favorite;
  }

  async isLawyersInFavorites(
    customerId: number,
    lawyersIds: string[],
  ): Promise<IsLawyersInFavoritesDTO[]> {
    const response = [];
    for await (const lawyerId of lawyersIds) {
      const isInFavorites = await this.isLawyerInFavourites(
        customerId,
        +lawyerId,
      );
      response.push({
        lawyerId,
        isInFavorites,
      });
    }

    return response;
  }

  async getFavorites(
    customerId: number,
    params: GetFavoriteParams,
  ): Promise<GetCustomerFavoritesDTO> {
    const { page, limit } = params;
    const query = this.favoriteRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.lawyer', 'lawyer')
      .leftJoinAndSelect('lawyer.user', 'user')
      .leftJoinAndSelect('favorite.customer', 'customer')
      .leftJoin(
        (qb) =>
          qb.select('f.lawyerId').from(Feedback, 'f').groupBy('f.lawyerId'),
        'f',
        'f."lawyerId" = lawyer.id',
      )
      .skip(limit * (page - 1))
      .take(limit);
    const [favorites, total] = await query
      .where(`favorite.customerId = :customerId`, { customerId })
      .getManyAndCount();
    const mapedFavorites = favorites.map((favorite) => {
      const { lawyer } = favorite;
      return this.lawyerService.getLawyerProfile(lawyer);
    });

    return {
      total,
      favorites: await Promise.all(mapedFavorites),
    };
  }

  async addLawyerToFavorites(
    customerId: number,
    lawyerId: number,
  ): Promise<GetAddedFavoriteDTO> {
    if (await this.isLawyerInFavourites(customerId, lawyerId))
      throw new BadRequestException('Lawyer is already in favourites');
    const customer = await this.customerService.findCustomer(customerId);
    const lawyer = await this.lawyerService.getLawyer(lawyerId);

    await this.favoriteRepository.insert({
      customer,
      lawyer,
    });
    return {
      lawyer: await this.lawyerService.getLawyerProfile(lawyer),
      customer: await this.customerService.getCustomerProfile(customerId),
    };
  }

  async removeLawyerFromFavorites(
    customerId: number,
    lawyerId: number,
  ): Promise<void> {
    if (!(await this.isLawyerInFavourites(customerId, lawyerId)))
      throw new BadRequestException('Lawyer is not in favourites');
    const customer = await this.customerService.findCustomer(customerId);
    const lawyer = await this.lawyerService.getLawyer(lawyerId);

    await this.favoriteRepository.remove({
      customer,
      lawyer,
    });
  }

  toFavoriteLawyerData(favorite: Favorite): FavoriteDTO {
    const { lawyer } = favorite;
    return {
      id: lawyer.id,
      fullName: `${lawyer.user.firstName} ${lawyer.user.lastName}`,
      avatar: '',
      country: lawyer.country,
      city: lawyer.city,
      legalArea: lawyer.legalAreas,
      verified: false,
      online: false,
      solvedIssues: 0,
      description: lawyer.description,
      yearsOfExperience: lawyer.experienceTime,
    };
  }
}
