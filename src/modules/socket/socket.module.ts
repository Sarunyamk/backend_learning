import { Module } from '@nestjs/common';

import { ChatGateway } from './gateways/chat.gateway';
import { ChatService } from './services/chat.service';

@Module({
  providers: [ChatGateway, ChatService],
})
export class SocketModule {}
