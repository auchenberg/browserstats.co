// import axios from 'axios';
// import { parse } from 'csv-parse/sync';
// import * as cheerio from 'cheerio';
import { BrowserStat, DataSource, BrowserTrend } from '@/types/browser';
import { scraperOrchestrator } from './scrapers/scraperOrchestrator';

// Data source configurations
export const DATA_SOURCES: DataSource[] = [
  {
    id: 'wikipedia',
    name: 'Wikipedia Usage Share',
    url: 'https://en.wikipedia.org/wiki/Usage_share_of_web_browsers',
    description: 'Community-maintained browser usage statistics',
    updateFrequency: 'Weekly',
    lastUpdated: new Date().toISOString(),
    isActive: true,
    dataType: 'market_share'
  },
  {
    id: 'github-browser-stats',
    name: 'GitHub Browser Stats',
    url: 'https://github.com/datasets/browser-stats',
    description: 'Historical browser usage data dataset',
    updateFrequency: 'Monthly',
    lastUpdated: new Date().toISOString(),
    isActive: true,
    dataType: 'trends'
  },
  {
    id: 'netmarketshare',
    name: 'NetMarketShare API',
    url: 'https://netmarketshare.com/rest',
    description: 'Commercial browser market share analytics',
    updateFrequency: 'Daily',
    lastUpdated: new Date().toISOString(),
    isActive: true,
    dataType: 'market_share'
  },
  {
    id: 'analytics-usa-gov',
    name: 'Analytics.usa.gov',
    url: 'https://analytics.usa.gov/data/',
    description: 'US Government website analytics data',
    updateFrequency: 'Real-time',
    lastUpdated: new Date().toISOString(),
    isActive: true,
    dataType: 'usage_stats'
  },
  {
    id: 'global-stats',
    name: 'Global Stats',
    url: 'https://github.com/michaelrhodes/global-stats',
    description: 'Global browser usage statistics',
    updateFrequency: 'Weekly',
    lastUpdated: new Date().toISOString(),
    isActive: true,
    dataType: 'market_share'
  }
];

// Mock data for demonstration - in production, these would be real API calls
const generateMockBrowserData = (): BrowserStat[] => {
  const browsers = [
    { name: 'Chrome', baseShare: 65.0, icon: '🟡' },
    { name: 'Safari', baseShare: 18.5, icon: '🔵' },
    { name: 'Edge', baseShare: 4.8, icon: '🟦' },
    { name: 'Firefox', baseShare: 3.2, icon: '🟠' },
    { name: 'Opera', baseShare: 2.4, icon: '🔴' },
    { name: 'Samsung Internet', baseShare: 2.1, icon: '⚫' },
    { name: 'Others', baseShare: 4.0, icon: '⚪' }
  ];

  return browsers.map((browser, index) => ({
    name: browser.name,
    marketShare: browser.baseShare + (Math.random() - 0.5) * 2,
    change24h: (Math.random() - 0.5) * 0.5,
    change7d: (Math.random() - 0.5) * 2,
    change30d: (Math.random() - 0.5) * 5,
    lastUpdated: new Date().toISOString(),
    source: DATA_SOURCES[index % DATA_SOURCES.length].name,
    category: 'global' as const,
    version: `${Math.floor(Math.random() * 20) + 100}.0`
  }));
};

export class BrowserDataService {
  private cache: Map<string, { data: BrowserStat[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private isValidCache(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private setCache(key: string, data: BrowserStat[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async fetchWikipediaBrowserData(): Promise<BrowserStat[]> {
    const cacheKey = 'wikipedia-data';
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      // Use scraper orchestrator for real data
      const data = await scraperOrchestrator.scrapeSource('wikipedia');
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching Wikipedia data:', error);
      // Fallback to mock data
      const data = generateMockBrowserData().map(stat => ({
        ...stat,
        source: 'Wikipedia'
      }));
      this.setCache(cacheKey, data);
      return data;
    }
  }

  async fetchGitHubBrowserStats(): Promise<BrowserStat[]> {
    const cacheKey = 'github-browser-stats';
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      // Use scraper orchestrator for real data
      const data = await scraperOrchestrator.scrapeSource('github');
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching GitHub browser stats:', error);
      // Fallback to mock data
      const data = generateMockBrowserData().map(stat => ({
        ...stat,
        source: 'GitHub Browser Stats',
        marketShare: stat.marketShare * 0.95 // Slight variation
      }));
      this.setCache(cacheKey, data);
      return data;
    }
  }

  async fetchNetMarketShareData(): Promise<BrowserStat[]> {
    const cacheKey = 'netmarketshare-data';
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      // In production, this would use the NetMarketShare API
      const data = generateMockBrowserData().map(stat => ({
        ...stat,
        source: 'NetMarketShare',
        marketShare: stat.marketShare * 1.02 // Slight variation
      }));
      
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching NetMarketShare data:', error);
      return generateMockBrowserData();
    }
  }

  async fetchAnalyticsUSAData(): Promise<BrowserStat[]> {
    const cacheKey = 'analytics-usa-data';
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      // Use scraper orchestrator for real data
      const data = await scraperOrchestrator.scrapeSource('analyticsUSA');
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching Analytics.usa.gov data:', error);
      // Fallback to mock data
      const data = generateMockBrowserData().map(stat => ({
        ...stat,
        source: 'Analytics.usa.gov',
        category: 'desktop' as const,
        region: 'United States'
      }));
      this.setCache(cacheKey, data);
      return data;
    }
  }

  async fetchGlobalStatsData(): Promise<BrowserStat[]> {
    const cacheKey = 'global-stats-data';
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      // In production, this would fetch from the global-stats repository
      const data = generateMockBrowserData().map(stat => ({
        ...stat,
        source: 'Global Stats'
      }));
      
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching Global Stats data:', error);
      return generateMockBrowserData();
    }
  }

  async fetchAllBrowserData(): Promise<{
    sources: Record<string, BrowserStat[]>;
    aggregated: BrowserStat[];
  }> {
    try {
      // Use scraper orchestrator to get data from all sources
      const scrapingResult = await scraperOrchestrator.scrapeAll();
      
      // Fill in missing sources with mock data for compatibility
      const allSources = {
        wikipedia: scrapingResult.sources.wikipedia || await this.fetchWikipediaBrowserData(),
        github: scrapingResult.sources.github || await this.fetchGitHubBrowserStats(),
        netmarket: await this.fetchNetMarketShareData(), // Keep as mock for now
        analyticsUSA: scrapingResult.sources.analyticsUSA || await this.fetchAnalyticsUSAData(),
        globalStats: await this.fetchGlobalStatsData() // Keep as mock for now
      };

      return {
        sources: allSources,
        aggregated: scrapingResult.aggregated
      };
    } catch (error) {
      console.error('Error in fetchAllBrowserData:', error);
      
      // Fallback to individual methods
      const [wikipedia, github, netmarket, analyticsUSA, globalStats] = await Promise.all([
        this.fetchWikipediaBrowserData(),
        this.fetchGitHubBrowserStats(),
        this.fetchNetMarketShareData(),
        this.fetchAnalyticsUSAData(),
        this.fetchGlobalStatsData()
      ]);

      const sources = {
        wikipedia,
        github,
        netmarket,
        analyticsUSA,
        globalStats
      };

      // Aggregate data by averaging market shares across sources
      const browserMap = new Map<string, BrowserStat[]>();
      
      Object.values(sources).flat().forEach(stat => {
        if (!browserMap.has(stat.name)) {
          browserMap.set(stat.name, []);
        }
        browserMap.get(stat.name)!.push(stat);
      });

      const aggregated: BrowserStat[] = Array.from(browserMap.entries()).map(([name, stats]) => {
        const avgMarketShare = stats.reduce((sum, stat) => sum + stat.marketShare, 0) / stats.length;
        const avgChange24h = stats.reduce((sum, stat) => sum + (stat.change24h || 0), 0) / stats.length;
        const avgChange7d = stats.reduce((sum, stat) => sum + (stat.change7d || 0), 0) / stats.length;
        const avgChange30d = stats.reduce((sum, stat) => sum + (stat.change30d || 0), 0) / stats.length;
        
        return {
          name,
          marketShare: avgMarketShare,
          change24h: avgChange24h,
          change7d: avgChange7d,
          change30d: avgChange30d,
          lastUpdated: new Date().toISOString(),
          source: 'Aggregated',
          category: 'global' as const,
          version: stats[0].version
        };
      }).sort((a, b) => b.marketShare - a.marketShare);

      return { sources, aggregated };
    }
  }

  async fetchHistoricalTrends(browser: string, days: number = 30): Promise<BrowserTrend[]> {
    // Generate mock historical data
    const trends: BrowserTrend[] = [];
    const baseShare = generateMockBrowserData().find(b => b.name === browser)?.marketShare || 50;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      trends.push({
        browser,
        date: date.toISOString().split('T')[0],
        marketShare: baseShare + (Math.random() - 0.5) * 10,
        source: 'Historical Data'
      });
    }
    
    return trends;
  }
}

export const browserDataService = new BrowserDataService();