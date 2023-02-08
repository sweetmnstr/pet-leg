import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
  NotFoundException,
  Body,
  Put,
  HttpCode,
  UseGuards,
  Param,
  Req,
} from '@nestjs/common';
import { LawyerProfileDto } from './dto/lawyer-profile.dto';
import { LawyerService } from './lawyer.service';
import { LawyerFiltersService } from './lawyer-filters.service';
import { UpdateVisibillityDto } from './dto/update-visibillity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoles } from '../user/enums/user-roles.enum';
import { GetLawyersListFiltersDto } from './dto/get-lawyers-list-filters.dto';
import { Geolocation } from '../geolocation/geolocation.entity';
import { EditReportInfoDTO } from './dto/edit-report-info.dto';
import { AddReportInfoDTO } from './dto/add-report-Info.dto';
import { Report } from './entities/report.entity';
import { GetConsultationQueryDTO } from '../consultation/dto/get-consultation-query.dto';
import { JwtSignatureDTO } from '../auth/dto/jwt-signature.dto';
import { GetPostsQueryDTO } from './dto/get-posts.dto';
import { CreatePostDTO } from './dto/create-post.dto';
import { UpdatePostDTO } from './dto/update-post.dto';
import { Countries } from './enums/countries.enum';
import { UpdateLawyerSettingsDTO } from './dto/update-lawyer-settings.dto';
import { LegalAreas } from './enums/legalAreas.enum';
import { Request } from 'express-serve-static-core';

@Controller('lawyer')
export class LawyerController {
  constructor(
    public service: LawyerService,
    private readonly lawyerFiltersService: LawyerFiltersService,
  ) {}

  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('get-lawyer-settings')
  async getLawyerSettings(
    @Req() req: Express.Request,
  ): Promise<LawyerProfileDto> {
    const { lawyerId } = req.user as JwtSignatureDTO;

    const lawyerExists = await this.service.isLawyerExists(+lawyerId);
    if (!lawyerExists) throw new NotFoundException('Lawyer not found');

    const lawyer = await this.service.getLawyer(+lawyerId, {
      geolocation: true,
    });

    return this.service.getLawyerSettings(lawyer);
  }

  @Get('get-lawyer-profile')
  async getLawyerProfile(
    @Query('lawyerId') lawyerId: string,
  ): Promise<LawyerProfileDto> {
    const lawyerExists = await this.service.isLawyerExists(+lawyerId);
    if (!lawyerExists) throw new NotFoundException('Lawyer not found');

    const lawyer = await this.service.getLawyer(+lawyerId);

    return this.service.getLawyerProfile(lawyer);
  }

  @Get('get-lawyer-profile-online')
  getLawyerProfileOnline(): Promise<LawyerProfileDto[]> {
    return this.service.getLawyersProfilesOniline();
  }

  @Get('get-recommended-lawyers')
  @Roles(UserRoles.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  getRecommendedLawyers(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('legalArea') legalArea: LegalAreas,
  ): Promise<LawyerProfileDto[]> {
    return this.service.getRecommendedLawyers(legalArea, limit);
  }

  @Get('get-lawyers-list')
  async getLawyersList(
    @Query('filters') filters: string,
    @Query('lawyersForPage', ParseIntPipe) lawyersForPage: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('sortBy') sortBy?: string,
    @Query('search') search?: string,
  ): Promise<{
    lawyersList: LawyerProfileDto[];
    total: number;
    page: number;
    lawyersForPage: number;
  }> {
    try {
      const { lawyersList, total } = await this.service.getLawyersList({
        filters,
        search,
        sortBy,
        lawyersForPage,
        page,
      });

      return { lawyersList, total, page, lawyersForPage };
    } catch (err) {
      throw new NotFoundException(err.message);
    }
  }

  @Put('update-lawyer-feedbacks-visibility')
  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  async updateLawyerFeedbacksVisibility(
    @Req() req: Express.Request,
    @Body() { hideFeedbacks }: UpdateVisibillityDto,
  ): Promise<{ hideFeedbacks: boolean }> {
    const lawyer = req.user as JwtSignatureDTO;

    const lawyerExists = !!(await this.service.getLawyer(+lawyer.lawyerId));
    if (!lawyerExists) throw new NotFoundException('Lawyer not found');

    return this.service.updateFeedbacksVisibility(
      +lawyer.lawyerId,
      hideFeedbacks,
    );
  }

  @Get('get-lawyers-list-filters')
  async getLawyersListFilters(): Promise<{
    filters: GetLawyersListFiltersDto[];
  }> {
    return { filters: await this.lawyerFiltersService.getLawyersListFilters() };
  }

  @Get('get-lawyer-geolocation/:lawyerId')
  async getLawyerGeolocation(
    @Param('lawyerId') lawyerId: string,
  ): Promise<Geolocation> {
    return await this.service.getLawyerGeolocation(+lawyerId);
  }

  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(201)
  @Post('add-report-info/:consultationId')
  async addReportInfo(
    @Param('consultationId') consultationId: string,
    @Body() addReportInfoDTO: AddReportInfoDTO,
  ): Promise<Report> {
    return this.service.addReportInfo(+consultationId, addReportInfoDTO);
  }

  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  @Patch('edit-report-info/:consultationId')
  async editReportInfo(
    @Param('consultationId') consultationId: string,
    @Body() editReportInfoDTO: EditReportInfoDTO,
  ): Promise<void> {
    await this.service.editReportInfo(+consultationId, editReportInfoDTO);
  }

  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  @Delete('delete-report-info/:consultationId')
  async deleteReportInfo(
    @Param('consultationId') consultationId: string,
  ): Promise<void> {
    await this.service.deleteReportInfo(+consultationId);
  }

  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  @Get('get-report-info/:consultationId')
  async getReportInfo(
    @Param('consultationId') consultationId: string,
  ): Promise<Report> {
    return this.service.getReportInfo(+consultationId);
  }

  @Get('get-lawyer-cases-list')
  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  async getLawyerCasesList(
    @Req() req: Express.Request,
    @Query() query: GetConsultationQueryDTO,
  ): Promise<any> {
    const { lawyerId } = req.user as JwtSignatureDTO;

    return await this.service.getLawyerCasesList(+lawyerId, query);
  }

  @Get('get-lawyer-cases-events')
  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  async getLawyerCasesEvents(
    @Req() req: Express.Request,
    @Query() query: GetConsultationQueryDTO,
  ): Promise<any> {
    const { lawyerId } = req.user as JwtSignatureDTO;

    return await this.service.getLawyerCasesEvents(+lawyerId, query);
  }

  @Patch('update-lawyer-settings')
  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  async updateLawyerSettings(
    @Req() req: Express.Request,
    @Body() updateLawyerSettingsDTO: UpdateLawyerSettingsDTO,
  ): Promise<LawyerProfileDto> {
    const { lawyerId } = req.user as JwtSignatureDTO;

    return this.service.updateLawyerSettings(
      +lawyerId,
      updateLawyerSettingsDTO,
    );
  }

  @Get('get-posts/:lawyerId')
  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  async getPosts(
    @Param('lawyerId') lawyerId: string,
    @Query() query: GetPostsQueryDTO,
  ) {
    return this.service.getPosts(+lawyerId, query);
  }

  @Post('generate-report')
  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  async generateReport(
    @Req() req: Request,
    @Body() getConsultationsFilters: GetConsultationQueryDTO,
  ): Promise<Buffer> {
    const user = req.user as JwtSignatureDTO;

    return this.service.generateReport(+user.lawyerId, getConsultationsFilters);
  }

  @Get('get-post')
  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  async getPost(
    @Query('postId') postId: string,
    @Query('lawyerId') lawyerId: string,
  ) {
    return this.service.getPost(+lawyerId, +postId);
  }

  @Post('create-post')
  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(201)
  async createPost(@Body() body: CreatePostDTO) {
    return this.service.createPost(body);
  }

  @Patch('update-post')
  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(204)
  async updatePost(@Body() body: UpdatePostDTO) {
    await this.service.updatePost(body);
  }

  @Delete('delete-post')
  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(204)
  async deletePost(
    @Query('postId') postId: string,
    @Query('lawyerId') lawyerId: string,
  ) {
    await this.service.deletePost(+lawyerId, +postId);
  }

  @Get('get-lawyers-by-geolocation')
  @HttpCode(200)
  getLawyersByGeolocation(
    @Query('filters') filters: string,
    @Query('country') country: Countries,
    @Query('city') city: string,
    @Query('sortBy') sortBy: string,
  ) {
    return this.service.getLawyersByGeolocation({
      country,
      city,
      filters,
      sortBy,
    });
  }

  @Get('get-cities-by-country')
  @HttpCode(200)
  getCitiesByCountry(@Query('country') country: Countries): Promise<string[]> {
    return this.service.getCitiesByCountry(country);
  }
}
