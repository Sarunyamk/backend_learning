import { Module } from '@nestjs/common';

import { ChatGateway } from './gateways/chat.gateway';
import { QuizGateway } from './gateways/quiz.gateway';
import { StockGateway } from './gateways/stock.gateway';
import { ChatService } from './services/chat.service';
import { QuizService } from './services/quiz.service';
import { StockService } from './services/stock.service';

@Module({
  providers: [
    ChatGateway,
    ChatService,
    StockGateway,
    StockService,
    QuizGateway,
    QuizService,
  ],
})
export class SocketModule {}
