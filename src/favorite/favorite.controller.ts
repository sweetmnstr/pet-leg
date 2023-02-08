import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Query,
  Body,
  NotFoundException,
  UseGuards,
  Req,
  Post,
  Delete,
  Request,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { GetCustomerFavoritesDTO } from './dto/get-customer-favorites.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRoles } from '../user/enums/user-roles.enum';
import { LawyerService } from '../lawyer/lawyer.service';
import { SignInDto } from '../auth/dto/signin.dto';
import { IsLawyersInFavoritesDTO } from './dto/is-lawyers-in-favorites.dto';
import { AddLawyerToFavoritesDTO } from './dto/add-lawyer-to-favorites';
import { GetAddedFavoriteDTO } from './dto/get-added-favourite.dto';
import { RemoveLawyerFromFavoritesDTO } from './dto/remove-lawyer-from-favorites';

@Controller('favorite')
export class FavoriteController {
  constructor(
    public service: FavoriteService,
    private lawyerService: LawyerService,
  ) {}

  @Get('get-favorites/:customerId')
  @Roles(UserRoles.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  async getFavorites(
    @Param('customerId') customerId: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
  ): Promise<GetCustomerFavoritesDTO> {
    const customerExists = await this.service.isCustomerExists(+customerId);
    if (!customerExists) throw new NotFoundException('Customer not found');

    return await this.service.getFavorites(+customerId, { limit, page });
  }

  @Get('is-lawyer-in-favorites/:lawyerId')
  @Roles(UserRoles.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  async isLawyerInFavourites(
    @Param('lawyerId') lawyerId: string,
    @Req() req: Express.Request,
  ): Promise<boolean> {
    const lawyerExists = await this.lawyerService.isLawyerExists(+lawyerId);
    if (!lawyerExists) throw new NotFoundException('Lawyer not found');
    const customer = await this.service.findCustomerByUserEmail(
      req.user as SignInDto,
    );
    if (!customer) throw new NotFoundException('Customer not found');

    return await this.service.isLawyerInFavourites(customer.id, +lawyerId);
  }

  @Get('is-lawyers-in-favorites')
  @Roles(UserRoles.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  async isLawyersInFavorites(
    @Query('lawyersIds') lawyersIds: string[],
    @Req() req: Express.Request,
  ): Promise<IsLawyersInFavoritesDTO[]> {
    for (const lawyerId of lawyersIds) {
      const lawyerExists = await this.lawyerService.isLawyerExists(+lawyerId);
      if (!lawyerExists)
        throw new NotFoundException(`Lawyer with id ${lawyerId} not found`);
    }

    const customer = await this.service.findCustomerByUserEmail(
      req.user as SignInDto,
    );
    if (!customer) throw new NotFoundException('Customer not found');

    return this.service.isLawyersInFavorites(customer.id, lawyersIds);
  }

  @Post('add-lawyer-to-favorites')
  @Roles(UserRoles.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(201)
  async addLawyerToFavourites(
    @Request() req,
    @Body() addLawyerToFavorites: AddLawyerToFavoritesDTO,
  ): Promise<GetAddedFavoriteDTO> {
    const { customerId } = req.user;
    const { lawyerId } = addLawyerToFavorites;
    const customerExists = await this.service.isCustomerExists(+customerId);
    if (!customerExists) throw new NotFoundException('Customer not found');

    const lawyerExists = await this.lawyerService.isLawyerExists(+lawyerId);
    if (!lawyerExists) throw new NotFoundException('Lawyer not found');

    return await this.service.addLawyerToFavorites(+customerId, +lawyerId);
  }

  @Delete('remove-lawyer-from-favorites')
  @Roles(UserRoles.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(204)
  async removeLawyerFromFavourites(
    @Request() req,
    @Body() removeLawyerFromFavorites: RemoveLawyerFromFavoritesDTO,
  ): Promise<void> {
    const { customerId } = req.user;
    const { lawyerId } = removeLawyerFromFavorites;
    const customerExists = await this.service.isCustomerExists(+customerId);
    if (!customerExists) throw new NotFoundException('Customer not found');

    const lawyerExists = await this.lawyerService.isLawyerExists(+lawyerId);
    if (!lawyerExists) throw new NotFoundException('Lawyer not found');

    return await this.service.removeLawyerFromFavorites(+customerId, +lawyerId);
  }
}
