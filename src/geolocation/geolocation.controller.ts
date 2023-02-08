import { Controller } from '@nestjs/common';
import { GeolocationService } from './geolocation.service';

@Controller('geolocation')
export class GeolocationController {
  constructor(public service: GeolocationService) {}
}
