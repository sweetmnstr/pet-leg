import {
  IsNumber,
  IsString,
  IsBoolean,
  IsJSON,
  IsArray,
  IsOptional,
  IsObject,
} from 'class-validator';
import { Languages } from '../enums/languages.enum';
import { Resume } from '../types/resume.type';
import { ApiProperty } from '@nestjsx/crud/lib/crud';

export class LawyerProfileDto {
  @IsNumber()
  id: number;

  @ApiProperty()
  userId?: number;

  @IsString()
  introVideo: string;

  @IsString()
  firstName: string;

  @IsString()
  email?: string;

  @IsString()
  phone?: string;

  @IsArray()
  specialization?: string[];

  @IsString()
  lastName: string;

  @IsString()
  title: string;

  @IsString()
  legalAreas: string;

  @IsString()
  language: Languages;

  @IsString()
  country: string;

  @IsString()
  city: string;

  @IsString()
  description: string;

  @IsNumber()
  experienceTime: number;

  @IsString()
  profileImage: string;

  @IsBoolean()
  isVerified: boolean;

  @IsNumber()
  consultationsCount: number;

  @IsJSON()
  resume: Resume;

  @IsNumber()
  totalReviews: number;

  @IsNumber()
  averageGrade: number;

  @IsString()
  introVideoThumbnail: string;

  @IsObject()
  @IsOptional()
  geolocation?: Record<string, any>;
}
