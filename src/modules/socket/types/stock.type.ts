// ===== Stock Config (for mock data) =====
export type StockConfig = {
  symbol: string;
  name: string;
  basePrice: number;
  volatility: number;
};

// ===== Stock Data (real-time update) =====
export type StockData = {
  symbol: string;
  name: string;
  price: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  timestamp: Date;
};

// ===== Client → Server Payloads =====
export type SubscribePayload = {
  symbols: string[];
};

export type UnsubscribePayload = {
  symbols: string[];
};
