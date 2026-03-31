import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import {
  MOCK_STOCKS,
  STOCK_UPDATE_INTERVAL_MS,
} from '../constants/stock.constant';
import type { StockData } from '../types/stock.type';

@Injectable()
export class StockService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StockService.name);

  private readonly prices = new Map<string, StockData>();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  // Callback ที่ gateway จะ set เพื่อรับ price updates
  private onPriceUpdate: ((symbol: string, data: StockData) => void) | null =
    null;

  // ===== Lifecycle =====

  onModuleInit(): void {
    this.initializePrices();
    this.startPriceGenerator();
    this.logger.log(
      `Stock price generator started (${STOCK_UPDATE_INTERVAL_MS}ms interval)`,
    );
  }

  onModuleDestroy(): void {
    this.stopPriceGenerator();
    this.logger.log('Stock price generator stopped');
  }

  // ===== Public API =====

  /**
   * Gateway เรียกเพื่อ register callback สำหรับ broadcast price updates
   */
  setOnPriceUpdate(callback: (symbol: string, data: StockData) => void): void {
    this.onPriceUpdate = callback;
  }

  /**
   * ดึง snapshot ราคาปัจจุบันของ symbols ที่ขอ
   */
  getSnapshot(symbols: string[]): StockData[] {
    return symbols
      .map((s) => this.prices.get(s))
      .filter((data): data is StockData => data !== undefined);
  }

  /**
   * ดึง symbols ทั้งหมดที่มี
   */
  getAllSymbols(): string[] {
    return Array.from(this.prices.keys());
  }

  /**
   * ตรวจว่า symbol มีอยู่จริงไหม
   */
  isValidSymbol(symbol: string): boolean {
    return this.prices.has(symbol);
  }

  /**
   * คืน room name สำหรับ Socket.io room (stock:AAPL)
   */
  getStockRoom(symbol: string): string {
    return `stock:${symbol}`;
  }

  // ===== Price Generator =====

  private initializePrices(): void {
    for (const stock of MOCK_STOCKS) {
      this.prices.set(stock.symbol, {
        symbol: stock.symbol,
        name: stock.name,
        price: stock.basePrice,
        previousPrice: stock.basePrice,
        change: 0,
        changePercent: 0,
        high: stock.basePrice,
        low: stock.basePrice,
        timestamp: new Date(),
      });
    }
  }

  private startPriceGenerator(): void {
    this.intervalId = setInterval(() => {
      this.updateAllPrices();
    }, STOCK_UPDATE_INTERVAL_MS);
  }

  private stopPriceGenerator(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Random walk algorithm — เปลี่ยนราคาทุก stock
   * สูตร: newPrice = price * (1 + randomChange * volatility)
   */
  private updateAllPrices(): void {
    for (const stock of MOCK_STOCKS) {
      const current = this.prices.get(stock.symbol);
      if (!current) continue;

      const randomChange = (Math.random() - 0.5) * 2; // -1 to 1
      const priceChange = current.price * randomChange * stock.volatility;
      const newPrice = Math.max(1, current.price + priceChange); // ห้ามต่ำกว่า 1

      const roundedPrice = Math.round(newPrice * 100) / 100;
      const change = roundedPrice - current.previousPrice;
      const changePercent =
        current.previousPrice > 0 ? (change / current.previousPrice) * 100 : 0;

      const updated: StockData = {
        symbol: stock.symbol,
        name: stock.name,
        price: roundedPrice,
        previousPrice: current.price,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        high: Math.max(current.high, roundedPrice),
        low: Math.min(current.low, roundedPrice),
        timestamp: new Date(),
      };

      this.prices.set(stock.symbol, updated);

      // Notify gateway เพื่อ broadcast ไปยัง subscribed clients
      this.onPriceUpdate?.(stock.symbol, updated);
    }
  }
}
