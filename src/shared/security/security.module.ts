import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HASH_SERVICE } from './interfaces/hash.interface';
import { APP_JWT_SERVICE } from './interfaces/jwt.interface';
import { BcryptService } from './services/bcrypt.service';
import { AppJwtService } from './services/jwt.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [
    { provide: HASH_SERVICE, useClass: BcryptService },
    { provide: APP_JWT_SERVICE, useClass: AppJwtService },
  ],
  exports: [HASH_SERVICE, APP_JWT_SERVICE],
})
export class SecurityModule {}
