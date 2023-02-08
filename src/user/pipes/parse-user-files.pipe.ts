import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseUserFilesPipe implements PipeTransform {
  transform(files: Express.Multer.File[]): Express.Multer.File[] {
    const $1MB = 1000000;
    if (files && Array.isArray(files)) {
      for (const file of files) {
        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.mimetype))
          throw new BadRequestException('Only image file expected');
        if (file.size > 10 * $1MB)
          throw new BadRequestException(
            'Image shoud be less or equal than 10MB',
          );
      }
    }
    return files;
  }
}
