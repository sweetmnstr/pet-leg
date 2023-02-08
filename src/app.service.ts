import { Injectable } from '@nestjs/common';
import * as pjson from '../package.json';

@Injectable()
export class AppService {
  getApplicationTitle(): string {
    return `${pjson.name} (v${pjson.version})`;
  }
}
