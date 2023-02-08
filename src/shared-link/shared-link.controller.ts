import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AddSharedLinkDTO } from './dto/add-shared-link.dto';
import { SharedLinkService } from './shared-link.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoles } from '../user/enums/user-roles.enum';
import GetSharedLinkDTO from './dto/get-shared-link.dto';
import { UpdateSharedLinkDTO } from './dto/update-shared-link.dto';
import { RemoveAllSharedLinkDTO } from './dto/remove-all-shared-link.dto';
import { JwtSignatureDTO } from '../auth/dto/jwt-signature.dto';

@Controller('shared-link')
export class SharedLinkController {
  constructor(private readonly service: SharedLinkService) {}

  @Post('add-shared-link')
  @Roles(UserRoles.Customer, UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(201)
  async addSharedLink(
    @Body() addSharedLinkDTO: AddSharedLinkDTO,
    @Req() req: Express.Request,
  ): Promise<GetSharedLinkDTO> {
    return await this.service.addSharedLink(
      addSharedLinkDTO,
      req.user as JwtSignatureDTO,
    );
  }

  @Put('update-shared-link/:linkId')
  @Roles(UserRoles.Customer, UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  async updateSharedLink(
    @Param('linkId') linkId: string,
    @Body() { link }: UpdateSharedLinkDTO,
    @Req() req: Express.Request,
  ): Promise<GetSharedLinkDTO> {
    return this.service.updateSharedLink(
      +linkId,
      link,
      req.user as JwtSignatureDTO,
    );
  }

  @Post('remove-shared-link')
  @Roles(UserRoles.Customer, UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  async removeSharedLink(
    @Body() deleteLink: { linkId: number },
    @Req() req: Express.Request,
  ): Promise<GetSharedLinkDTO> {
    return this.service.removeSharedLink(
      deleteLink.linkId,
      req.user as JwtSignatureDTO,
    );
  }

  @Delete('remove-all-shared-link')
  @Roles(UserRoles.Customer, UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(204)
  async removeAllSharedLink(
    @Body() { consultationId, conversationUserId }: RemoveAllSharedLinkDTO,
    @Req() req: Express.Request,
  ): Promise<void> {
    await this.service.removeAllSharedLink(
      req.user as JwtSignatureDTO,
      +consultationId,
      +conversationUserId,
    );
  }

  @Get('consultation-shared-links/:consultationId')
  @Roles(UserRoles.Customer, UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async consultationSharedLinks(
    @Param('consultationId') consultationId: string,
    @Req() req: Express.Request,
  ): Promise<GetSharedLinkDTO[]> {
    return await this.service.getConsultationSharedLinks(
      +consultationId,
      req.user as JwtSignatureDTO,
    );
  }

  @Get('conversation-shared-links/:conversationUserId')
  @Roles(UserRoles.Customer, UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async conversationSharedLinks(
    @Param('conversationUserId') conversationUserId: string,
    @Req() req: Express.Request,
  ): Promise<GetSharedLinkDTO[]> {
    const user = req.user as JwtSignatureDTO;
    return await this.service.getConversationSharedLinks(
      +conversationUserId,
      user.id,
    );
  }
}
