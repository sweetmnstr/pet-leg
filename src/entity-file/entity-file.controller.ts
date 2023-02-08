import {
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EntityFileService } from './entity-file.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ParseUserFilesPipe } from '../user/pipes/parse-user-files.pipe';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';

@Controller('entity-file')
export class EntityFileController {
  constructor(public service: EntityFileService) {}

  @Post('upload-files')
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(FilesInterceptor('files', 5))
  @HttpCode(200)
  async uploadFiles(
    @UploadedFiles(ParseUserFilesPipe)
    files: Array<Express.Multer.File>,
  ) {
    return this.service.uploadFiles(files);
  }

  @Post('remove-files')
  @UseGuards(ApiKeyGuard)
  @HttpCode(200)
  async removeFiles(
    @Body() removeFiles: { bucket: string; keys: string[] },
  ): Promise<{
    removed: Record<string, any>[];
    errored: Record<string, any>[];
  }> {
    return this.service.removeFiles(removeFiles.bucket, removeFiles.keys);
  }
}
