import { IsUrl } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { LegalAreas } from '../enums/legalAreas.enum';
import { Specializations } from '../enums/specializations.enum';
import { ResumeItem } from '../types/resume.type';

export class UpdateLawyerSettingsDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty()
  @IsOptional()
  @IsUrl(undefined)
  profileImage?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(LegalAreas)
  legalAreas?: LegalAreas;

  @ApiProperty()
  @IsOptional()
  specialization?: Specializations[];

  @ApiProperty()
  @IsOptional()
  education?: ResumeItem[];

  @ApiProperty()
  @IsOptional()
  workExperience?: ResumeItem[];

  @ApiProperty()
  @IsOptional()
  geolocation?: { lat: number; lng: number };

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  experienceTime?: number;

  @ApiProperty()
  @IsOptional()
  certifications?: ResumeItem[];

  @ApiProperty()
  @IsOptional()
  country?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty()
  @IsOptional()
  @IsUrl(undefined)
  introVideo?: string;

  @ApiProperty()
  @IsOptional()
  @IsUrl(undefined)
  introVideoThumbnail?: string;
}
