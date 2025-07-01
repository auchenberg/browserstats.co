export interface BrowserStat {
  name: string;
  version?: string;
  marketShare: number;
  change24h?: number;
  change7d?: number;
  change30d?: number;
  lastUpdated: string;
  source: string;
  category: 'desktop' | 'mobile' | 'tablet' | 'global';
  region?: string;
}

export interface DataSource {
  id: string;
  name: string;
  url: string;
  description: string;
  updateFrequency: string;
  lastUpdated: string;
  isActive: boolean;
  dataType: 'market_share' | 'usage_stats' | 'trends';
}

export interface BrowserTrend {
  browser: string;
  date: string;
  marketShare: number;
  source: string;
}

export interface TopBrowsers {
  daily: BrowserStat[];
  weekly: BrowserStat[];
  monthly: BrowserStat[];
}

export interface BrowserCategory {
  name: string;
  browsers: BrowserStat[];
  totalMarketShare: number;
  change: number;
}

export interface GeographicData {
  region: string;
  country?: string;
  browsers: BrowserStat[];
}

export interface HistoricalData {
  browser: string;
  timeline: {
    date: string;
    marketShare: number;
    rank: number;
  }[];
}

export interface BrowserFeature {
  name: string;
  description: string;
  supportedBrowsers: string[];
  adoptionRate: number;
}

export interface MarketAnalytics {
  totalUsers: number;
  growthRate: number;
  volatility: number;
  dominanceIndex: number;
  diversityIndex: number;
}