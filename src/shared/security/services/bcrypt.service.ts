import { Injectable } from '@nestjs/common';
import { TypeConfigService } from 'src/config/type-config.service';
import { IHashService } from '../interfaces/hash.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService implements IHashService {
  private readonly saltRounds: number;

  constructor(typeConfigService: TypeConfigService) {
    this.saltRounds = typeConfigService.get('SALT_ROUNDS');
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
