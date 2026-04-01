import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { ServerOptions } from 'socket.io';

import { TypeConfigService } from './type-config.service';

export class SocketIoAdapter extends IoAdapter {
  private readonly origins: string[];

  constructor(app: INestApplication) {
    super(app);
    const configService = app.get(TypeConfigService);
    this.origins = configService.get('ALLOWED_ORIGINS').split(',');
  }

  override createIOServer(
    port: number,
    options?: Partial<ServerOptions>,
  ): unknown {
    return super.createIOServer(port, {
      ...options,
      cors: {
        origin: this.origins,
        credentials: true,
      },
    }) as unknown;
  }
}
