export type RealReturnMode = 'try' | 'usd' | 'tufe';

export type RealReturnPoint = {
  t: number;
  try: number;
  usd: number;
  tufe: number;
};

export type RealReturnSummary = {
  principal: number;
  stockEnd: number;
  depositEnd: number;
  goldProxyEnd: number;
  realLossPctVsTufe: number;
  stockReturnPct: number;
  tufeReturnPct: number;
  label: string;
};

export type HealthRadarAxis = {
  key: 'profit' | 'leverage' | 'growth' | 'valuation' | 'momentum';
  label: string;
  score: number;
};

export type PeerRow = {
  symbol: string;
  displaySymbol: string;
  name: string;
  pe: number | null;
  pb: number | null;
  yearReturn: number | null;
  dividendYield: number | null;
  isFocus: boolean;
};

export type DividendSimYear = {
  year: string;
  yieldPct: number;
  perShareTry: number;
};

export type TargetGauge = {
  price: number;
  low: number | null;
  mean: number | null;
  high: number | null;
  upsidePct: number | null;
};

export type TechLevels = {
  price: number;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  rsi14: number | null;
  fib382: number | null;
  fib500: number | null;
  fib618: number | null;
  summary: string;
};

export type SymbolAnalysisBundle = {
  symbol: string;
  displaySymbol: string;
  name: string;
  currency: string;
  price: number;
  changePercent: number;
  realReturn: {
    points: RealReturnPoint[];
    summary: RealReturnSummary;
  };
  healthRadar: HealthRadarAxis[];
  peers: PeerRow[];
  sectorTr: string;
  dividend: {
    trailingYieldPct: number | null;
    annualRateTry: number | null;
    years: DividendSimYear[];
  };
  target: TargetGauge;
  levels: TechLevels;
  generatedAt: string;
  sourceNote: string;
};
