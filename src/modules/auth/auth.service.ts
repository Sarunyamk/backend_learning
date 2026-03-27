import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import {
  type IHashService,
  HASH_SERVICE,
} from 'src/shared/security/interfaces/hash.interface';
import {
  type IAppJwtService,
  APP_JWT_SERVICE,
} from 'src/shared/security/interfaces/jwt.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(HASH_SERVICE) private readonly hashService: IHashService,
    @Inject(APP_JWT_SERVICE) private readonly jwtService: IAppJwtService,
  ) {}
}
