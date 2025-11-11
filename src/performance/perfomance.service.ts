import { Injectable } from '@nestjs/common';
import defaults from '../imports/auth.imports';

@Injectable()
export class PerfomanceService {
  constructor() {}

  async test() {
    console.log(defaults.AuthDto);
  }
}
