import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigsService {
  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  getConfig(key: string): string {
    return this.configService.get(key) ?? '';
  }
}
