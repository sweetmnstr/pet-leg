import {
  Controller,
  Body,
  Get,
  Request,
  HttpCode,
  NotFoundException,
  BadRequestException,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { UpdateCustomerProfileDTO } from './dto/update-customer-profile.dto';
import { GetCustomerProfileDTO } from './dto/get-customer-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoles } from '../user/enums/user-roles.enum';
import { GetConsultationQueryDTO } from '../consultation/dto/get-consultation-query.dto';

@Controller('customer')
export class CustomerController {
  constructor(public service: CustomerService) {}

  @Get('get-customer-profile')
  @Roles(UserRoles.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getCustomerProfile(@Request() req): Promise<GetCustomerProfileDTO> {
    const customerExists = await this.service.isCustomerExists(
      +req.user.customerId,
    );
    if (!customerExists) throw new NotFoundException('Customer not found');

    return await this.service.getCustomerProfile(+req.user.customerId);
  }

  @Patch('update-customer-profile')
  @Roles(UserRoles.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  async updateCustomerProfile(
    @Request() req,
    @Body() updateCustomerDto: UpdateCustomerProfileDTO,
  ) {
    const { customerId } = req.user;
    const customerExists = await this.service.isCustomerExists(+customerId);
    if (!customerExists) throw new NotFoundException('Customer not found');
    const isEmailAlreadyTaken = await this.service.isEmailAlreadyTaken(
      +customerId,
      updateCustomerDto?.email || '',
    );
    if (isEmailAlreadyTaken)
      throw new BadRequestException('Email is already taken');

    await this.service.update(+customerId, updateCustomerDto);
  }

  @Get('get-customer-consultations-list')
  @Roles(UserRoles.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  async getCustomerConsultationsList(
    @Request() req,
    @Query() query: GetConsultationQueryDTO,
  ) {
    return await this.service.getCustomerConsultationsList(
      +req.user.customerId,
      query,
    );
  }
}
