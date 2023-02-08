import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult, In } from 'typeorm';
import { AddSharedLinkDTO } from './dto/add-shared-link.dto';
import { SharedLink } from './shared-link.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ConsultationService } from '../consultation/consultation.service';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import GetSharedLinkDTO from './dto/get-shared-link.dto';
import { Consultation } from '../consultation/consultation.entity';
import { JwtSignatureDTO } from '../auth/dto/jwt-signature.dto';

@Injectable()
export class SharedLinkService extends TypeOrmCrudService<SharedLink> {
  constructor(
    @InjectRepository(SharedLink)
    private sharedLinkRepository: Repository<SharedLink>,
    private consultationService: ConsultationService,
    private userService: UserService,
  ) {
    super(sharedLinkRepository);
  }

  async addSharedLink(
    addSharedLinkDTO: AddSharedLinkDTO,
    authUser: JwtSignatureDTO,
  ): Promise<GetSharedLinkDTO> {
    const { consultationId, conversationUserId, link } = addSharedLinkDTO;

    let sharedLink;

    const user = await this.checkIfUser(authUser.email);
    if (consultationId) {
      const consultation = await this.checkIfConsultationExists(
        +consultationId,
      );
      this.checkIfUserBelongsToConsultation(consultation, user);

      sharedLink = this.sharedLinkRepository.create({
        consultation,
        link,
        user,
      });
    }

    if (conversationUserId) {
      const conversationUser = await this.userService.getUser(
        conversationUserId,
      );

      if (!conversationUser) {
        throw new BadRequestException('INVALID_CONVERSATION_USER_PROVIDED');
      }

      sharedLink = this.sharedLinkRepository.create({
        conversationUser,
        link,
        user,
      });
    }

    if (!sharedLink) {
      throw new BadRequestException('INVALID_LINK_DTO_PROVIDED');
    }

    return this.getSharedLink(
      await this.sharedLinkRepository.manager.save(sharedLink),
      authUser.id,
    );
  }

  async updateSharedLink(
    id: number,
    link: string,
    authUser: JwtSignatureDTO,
  ): Promise<GetSharedLinkDTO> {
    const sharedLink = await this.checkIfSharedLinkExists(id);
    const user = await this.checkIfUser(authUser.email);
    this.checkIfUserBelongsToSharedLink(sharedLink, user);

    sharedLink.link = link;

    await this.sharedLinkRepository.manager.save(sharedLink);

    return this.getSharedLink(sharedLink, authUser.id);
  }

  async removeSharedLink(
    id: number,
    authUser: JwtSignatureDTO,
  ): Promise<GetSharedLinkDTO> {
    const sharedLink = await this.checkIfSharedLinkExists(id);
    const user = await this.checkIfUser(authUser.email);
    this.checkIfUserBelongsToSharedLink(sharedLink, user);

    await this.sharedLinkRepository.delete(sharedLink.id);

    return this.getSharedLink(sharedLink, authUser.id);
  }

  async removeAllSharedLink(
    authUser: JwtSignatureDTO,
    consultationId?: number,
    conversationUserId?: number,
  ): Promise<DeleteResult> {
    const user = await this.checkIfUser(authUser.email);

    if (consultationId) {
      const consultation = await this.checkIfConsultationExists(consultationId);
      this.checkIfUserBelongsToConsultation(consultation, user);
      return await this.sharedLinkRepository.delete({
        consultation: { id: consultationId },
        user: { id: user.id },
      });
    }

    if (conversationUserId) {
      return await this.sharedLinkRepository.delete({
        conversationUser: { id: conversationUserId },
        user: { id: user.id },
      });
    }
  }

  async getConsultationSharedLinks(
    id: number,
    authUser: JwtSignatureDTO,
  ): Promise<GetSharedLinkDTO[]> {
    const consultation = await this.checkIfConsultationExists(id);
    const user = await this.checkIfUser(authUser.email);
    this.checkIfUserBelongsToConsultation(consultation, user);

    return (
      await this.sharedLinkRepository.find({
        where: { consultation: { id } },
        relations: { user: true, consultation: true },
      })
    ).map((sharedLinkRaw) => this.getSharedLink(sharedLinkRaw, user.id));
  }

  async getConversationSharedLinks(
    id: number,
    userId: number,
  ): Promise<GetSharedLinkDTO[]> {
    return (
      await this.sharedLinkRepository.find({
        where: { conversationUser: In([id, userId]) },
        relations: { user: true, conversationUser: true },
      })
    ).map((sharedLinkRaw) => this.getSharedLink(sharedLinkRaw, userId));
  }

  async checkIfConsultationExists(id: number): Promise<Consultation> {
    const consultation = await this.consultationService.getConsultation(id);
    if (!consultation)
      throw new BadRequestException('Consultation is not exists');
    return consultation;
  }

  checkIfUserBelongsToConsultation(
    consultation: Consultation,
    user: User,
  ): void {
    const role = user.customer || user.lawyer;
    if (!role)
      throw new BadRequestException('User must be a customer or a lawyer');

    const isBelongsTo = [
      consultation.customer.id,
      consultation.lawyer.id,
    ].includes(role.id);
    if (!isBelongsTo)
      throw new BadRequestException("User isn't belongs to consultation");
  }

  checkIfUserBelongsToSharedLink(sharedLink: SharedLink, user: User): void {
    const isBelongsTo = sharedLink.user.id === user.id;
    if (!isBelongsTo) throw new BadRequestException('User cannot to remove');
  }

  async checkIfSharedLinkExists(id: number): Promise<SharedLink> {
    const sharedLink = await this.sharedLinkRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!sharedLink) throw new NotFoundException('Shared link is not exists');
    return sharedLink;
  }

  async checkIfUser(email: string): Promise<User> {
    const user = await this.userService.getUserByEmail(email);
    if (!user) throw new BadRequestException('User is not exists');
    return user;
  }

  getSharedLink(sharedLink: SharedLink, userId: number): GetSharedLinkDTO {
    console.log('sharedLink, userId', sharedLink.user.id, userId);

    return {
      id: sharedLink.id,
      link: sharedLink.link,
      consultationId: sharedLink.consultation?.id,
      conversationUserId: sharedLink.conversationUser?.id,
      belongsToMe: sharedLink.user.id === userId,
    };
  }
}
