import type { StockConfig } from '../types/stock.type';

// ===== Stock Update Config =====
export const STOCK_UPDATE_INTERVAL_MS = 2000;
export const STOCK_MAX_HISTORY = 50;

// ===== Mock Stocks =====
export const MOCK_STOCKS: readonly StockConfig[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    basePrice: 178.5,
    volatility: 0.02,
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    basePrice: 141.8,
    volatility: 0.018,
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    basePrice: 378.9,
    volatility: 0.015,
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    basePrice: 178.2,
    volatility: 0.022,
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    basePrice: 248.5,
    volatility: 0.035,
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    basePrice: 875.3,
    volatility: 0.03,
  },
] as const;
