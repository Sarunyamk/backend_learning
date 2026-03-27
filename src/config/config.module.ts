import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validate } from './env.validation';
import { TypeConfigService } from './type-config.service';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      validate,
    }),
  ],
  providers: [TypeConfigService],
  exports: [NestConfigModule, TypeConfigService],
})
export class ConfigModule {}
