import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Geolocation } from './geolocation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lawyer } from '../lawyer/entities/lawyer.entity';

@Injectable()
export class GeolocationService extends TypeOrmCrudService<Geolocation> {
  constructor(
    @InjectRepository(Geolocation)
    private geolocationRepository: Repository<Geolocation>,
  ) {
    super(geolocationRepository);
  }

  async updateGeolocationOrCreate(
    lawyer: Lawyer,
    geolocation: { lat: number; lng: number },
  ): Promise<Geolocation> {
    const geolocationRecord = await this.geolocationRepository.findOne({
      where: { lawyer: { id: lawyer.id } },
    });

    if (!geolocationRecord) {
      const newGeolocation = await this.geolocationRepository.create();
      newGeolocation.longitude = geolocation.lng;
      newGeolocation.latitude = geolocation.lat;
      newGeolocation.lawyer = lawyer;
      return this.geolocationRepository.save(newGeolocation);
    }

    await this.geolocationRepository.update(
      { lawyer: { id: lawyer.id } },
      { latitude: geolocation.lat, longitude: geolocation.lng },
    );
  }
}
