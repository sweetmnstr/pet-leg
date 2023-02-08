import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityFile } from './entity-file.entity';
import { EntityFileService } from './entity-file.service';
import { EntityFileController } from './entity-file.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EntityFile])],
  controllers: [EntityFileController],
  providers: [EntityFileService],
  exports: [EntityFileService],
})
export class EntityFileModule {}
