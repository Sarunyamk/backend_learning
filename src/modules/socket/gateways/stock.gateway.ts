import { Logger, OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { STOCK_EVENT } from '../constants/socket-event.constant';
import { SOCKET_NAMESPACE } from '../constants/socket-namespace.constant';
import { StockService } from '../services/stock.service';
import type { SubscribePayload, UnsubscribePayload } from '../types/stock.type';

@WebSocketGateway({ namespace: SOCKET_NAMESPACE.STOCK })
export class StockGateway implements OnModuleInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(StockGateway.name);

  constructor(private readonly stockService: StockService) {}

  // ===== Lifecycle =====

  onModuleInit(): void {
    // Register callback — service เรียกทุกครั้งที่ราคาเปลี่ยน
    this.stockService.setOnPriceUpdate((symbol, data) => {
      const room = this.stockService.getStockRoom(symbol);
      this.server.to(room).emit(STOCK_EVENT.UPDATE, data);
    });
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Stock client disconnected: ${client.id}`);
    // Socket.io rooms จัดการ cleanup อัตโนมัติเมื่อ disconnect
  }

  // ===== Event Handlers =====

  @SubscribeMessage(STOCK_EVENT.SUBSCRIBE)
  handleSubscribe(
    @MessageBody() payload: SubscribePayload,
    @ConnectedSocket() client: Socket,
  ): void {
    const { symbols } = payload;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      client.emit(STOCK_EVENT.ERROR, { message: 'symbols array is required' });
      return;
    }

    // Validate + join rooms
    const validSymbols: string[] = [];
    for (const symbol of symbols) {
      if (!this.stockService.isValidSymbol(symbol)) {
        client.emit(STOCK_EVENT.ERROR, {
          message: `Invalid symbol: ${symbol}`,
        });
        continue;
      }
      const room = this.stockService.getStockRoom(symbol);
      void client.join(room);
      validSymbols.push(symbol);
    }

    if (validSymbols.length === 0) return;

    this.logger.log(
      `Client ${client.id} subscribed to: ${validSymbols.join(', ')}`,
    );

    // ส่ง snapshot ราคาปัจจุบันทันที
    const snapshot = this.stockService.getSnapshot(validSymbols);
    client.emit(STOCK_EVENT.SNAPSHOT, snapshot);
  }

  @SubscribeMessage(STOCK_EVENT.UNSUBSCRIBE)
  handleUnsubscribe(
    @MessageBody() payload: UnsubscribePayload,
    @ConnectedSocket() client: Socket,
  ): void {
    const { symbols } = payload;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      client.emit(STOCK_EVENT.ERROR, { message: 'symbols array is required' });
      return;
    }

    for (const symbol of symbols) {
      const room = this.stockService.getStockRoom(symbol);
      void client.leave(room);
    }

    this.logger.log(
      `Client ${client.id} unsubscribed from: ${symbols.join(', ')}`,
    );
  }
}
