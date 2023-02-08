import { Module } from '@nestjs/common';
import { GeolocationController } from './geolocation.controller';
import { GeolocationService } from './geolocation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Geolocation } from './geolocation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Geolocation])],
  controllers: [GeolocationController],
  providers: [GeolocationService],
  exports: [GeolocationService],
})
export class GeolocationModule {}
