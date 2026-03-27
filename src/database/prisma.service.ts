import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { TypeConfigService } from 'src/config/type-config.service';
import { PrismaClient } from './generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly typeConfigService: TypeConfigService) {
    const adapter = new PrismaPg({
      connectionString: typeConfigService.get('DATABASE_URL'),
    });
    super({ adapter });
  }
}
