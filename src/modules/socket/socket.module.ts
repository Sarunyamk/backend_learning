import { Module } from '@nestjs/common';

import { ChatGateway } from './gateways/chat.gateway';
import { StockGateway } from './gateways/stock.gateway';
import { ChatService } from './services/chat.service';
import { StockService } from './services/stock.service';

@Module({
  providers: [ChatGateway, ChatService, StockGateway, StockService],
})
export class SocketModule {}
