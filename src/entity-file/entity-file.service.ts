import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityFile } from './entity-file.entity';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class EntityFileService {
  constructor(
    @InjectRepository(EntityFile)
    private entityFileRepository: Repository<EntityFile>,
  ) {}

  async uploadFile({ buffer, originalname }: Express.Multer.File) {
    const s3 = new S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.AWS_S3_KEY_SECRET,
    });
    const uploadResult = await s3
      .upload({
        Bucket: process.env.AWS_S3_BUCKET,
        Body: buffer,
        Key: `${uuid()}-${originalname}`,
      })
      .promise();

    return uploadResult.Location;
  }

  async uploadFiles(
    files: Array<Express.Multer.File>,
  ): Promise<{ uploaded: string[]; errored: string[] }> {
    const results = await Promise.allSettled(
      files.map((file) => this.uploadFile(file)),
    );
    return results.reduce(
      (results, result) => {
        if (result.status === 'fulfilled') results.uploaded.push(result.value);
        else results.errored.push(result.reason);
        return results;
      },
      { uploaded: [], errored: [] },
    );
  }

  async removeFiles(
    bucket: string,
    keys: string[],
  ): Promise<{
    removed: Record<string, any>[];
    errored: Record<string, any>[];
  }> {
    const s3 = new S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.AWS_S3_KEY_SECRET,
    });

    const { Deleted, Errors } = await s3
      .deleteObjects({
        Bucket: bucket,
        Delete: { Objects: keys.map((key) => ({ Key: key })) },
      })
      .promise();

    return { removed: Deleted, errored: Errors };
  }
}
