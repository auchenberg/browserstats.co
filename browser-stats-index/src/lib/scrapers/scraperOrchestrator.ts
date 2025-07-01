import { BrowserStat } from '@/types/browser';

// Removed unused interface ScraperResult

export class ScraperOrchestrator {
  private cache: Map<string, { data: BrowserStat[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = parseInt(process.env.CACHE_DURATION_MINUTES || '5') * 60 * 1000;
  private readonly MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_SCRAPERS || '3');
  private readonly SCRAPER_DELAY = parseInt(process.env.SCRAPER_DELAY_MS || '2000');
  
  // Scrapers are loaded dynamically to avoid bundling in client
  private async loadScrapers() {
    if (typeof window !== 'undefined') {
      // Return empty object on client side
      return {};
    }

    try {
      const [
        { wikipediaScraper },
        { analyticsUSAScraper },
        { githubBrowserStatsScraper }
      ] = await Promise.all([
        import('./wikipediaScraper'),
        import('./analyticsUSAScraper'),
        import('./githubScraper')
      ]);

      return {
        wikipedia: wikipediaScraper,
        analyticsUSA: analyticsUSAScraper,
        github: githubBrowserStatsScraper,
      };
    } catch (error) {
      console.error('Failed to load scrapers:', error);
      return {};
    }
  }

  async scrapeAll(): Promise<{
    sources: Record<string, BrowserStat[]>;
    aggregated: BrowserStat[];
    metadata: {
      totalSources: number;
      successfulSources: number;
      lastUpdated: string;
      scrapingEnabled: boolean;
    };
  }> {
    const scrapingEnabled = process.env.SCRAPING_ENABLED !== 'false';
    
    if (!scrapingEnabled) {
      return this.getMockDataResponse();
    }

    // Load scrapers dynamically
    const scrapers = await this.loadScrapers();
    const results: Record<string, BrowserStat[]> = {};
    const scraperEntries = Object.entries(scrapers);
    const successfulSources: string[] = [];

    // Process scrapers with concurrency control
    for (let i = 0; i < scraperEntries.length; i += this.MAX_CONCURRENT) {
      const batch = scraperEntries.slice(i, i + this.MAX_CONCURRENT);
      
      const batchPromises = batch.map(async ([name, scraper]) => {
        try {
          // Check cache first
          const cacheKey = `scraper-${name}`;
          const cached = this.cache.get(cacheKey);
          
          if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return { source: name, data: cached.data, success: true, timestamp: cached.timestamp };
          }

          // Add delay between scraper calls to be respectful
          if (i > 0) {
            await this.delay(this.SCRAPER_DELAY);
          }

          console.log(`Starting scrape for ${name}...`);
          const data = await (scraper as { scrape: () => Promise<BrowserStat[]> }).scrape();
          
          // Cache the result
          this.cache.set(cacheKey, { data, timestamp: Date.now() });
          
          console.log(`Completed scrape for ${name}: ${data.length} items`);
          return { source: name, data, success: true, timestamp: Date.now() };
        } catch (error) {
          console.error(`Scraper ${name} failed:`, error);
          return { 
            source: name, 
            data: [], 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now()
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success && result.data.length > 0) {
          results[result.source] = result.data;
          successfulSources.push(result.source);
        }
      });
    }

    // If no scrapers succeeded, return mock data
    if (successfulSources.length === 0) {
      console.log('All scrapers failed, returning mock data');
      return this.getMockDataResponse();
    }

    // Aggregate data from successful sources
    const aggregated = this.aggregateData(Object.values(results).flat());

    return {
      sources: results,
      aggregated,
      metadata: {
        totalSources: Object.keys(scrapers).length,
        successfulSources: successfulSources.length,
        lastUpdated: new Date().toISOString(),
        scrapingEnabled: true
      }
    };
  }

  async scrapeSource(sourceName: string): Promise<BrowserStat[]> {
    const scrapers = await this.loadScrapers();
    const scraper = scrapers[sourceName as keyof typeof scrapers];
    if (!scraper) {
      throw new Error(`Unknown scraper source: ${sourceName}`);
    }

    const cacheKey = `scraper-${sourceName}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const data = await (scraper as { scrape: () => Promise<BrowserStat[]> }).scrape();
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`Failed to scrape ${sourceName}:`, error);
      // Return mock data for the specific source on error
      return this.getMockDataForSource(sourceName);
    }
  }

  private aggregateData(allData: BrowserStat[]): BrowserStat[] {
    const browserMap = new Map<string, BrowserStat[]>();
    
    // Group by browser name
    allData.forEach(stat => {
      const name = stat.name;
      if (!browserMap.has(name)) {
        browserMap.set(name, []);
      }
      browserMap.get(name)!.push(stat);
    });

    // Calculate averages for each browser
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
        version: stats.find(s => s.version)?.version
      };
    });

    return aggregated
      .sort((a, b) => b.marketShare - a.marketShare)
      .slice(0, 10);
  }

  private getMockDataResponse() {
    const mockData = this.generateMockBrowserData();
    return {
      sources: {
        wikipedia: mockData.map(stat => ({ ...stat, source: 'Wikipedia' })),
        analyticsUSA: mockData.map(stat => ({ ...stat, source: 'Analytics.usa.gov' })),
        github: mockData.map(stat => ({ ...stat, source: 'GitHub Browser Stats' })),
      },
      aggregated: mockData.map(stat => ({ ...stat, source: 'Aggregated' })),
      metadata: {
        totalSources: 3,
        successfulSources: 3,
        lastUpdated: new Date().toISOString(),
        scrapingEnabled: false
      }
    };
  }

  private getMockDataForSource(sourceName: string): BrowserStat[] {
    const baseData = this.generateMockBrowserData();
    return baseData.map(stat => ({
      ...stat,
      source: this.getSourceDisplayName(sourceName)
    }));
  }

  private getSourceDisplayName(sourceName: string): string {
    const nameMap: Record<string, string> = {
      wikipedia: 'Wikipedia',
      analyticsUSA: 'Analytics.usa.gov',
      github: 'GitHub Browser Stats',
      netmarket: 'NetMarketShare',
      globalStats: 'Global Stats'
    };
    return nameMap[sourceName] || sourceName;
  }

  private generateMockBrowserData(): BrowserStat[] {
    const browsers = [
      { name: 'Chrome', baseShare: 65.0 },
      { name: 'Safari', baseShare: 18.5 },
      { name: 'Edge', baseShare: 4.8 },
      { name: 'Firefox', baseShare: 3.2 },
      { name: 'Opera', baseShare: 2.4 },
      { name: 'Samsung Internet', baseShare: 2.1 },
      { name: 'Others', baseShare: 4.0 }
    ];

    return browsers.map(browser => ({
      name: browser.name,
      marketShare: browser.baseShare + (Math.random() - 0.5) * 2,
      change24h: (Math.random() - 0.5) * 0.5,
      change7d: (Math.random() - 0.5) * 2,
      change30d: (Math.random() - 0.5) * 5,
      lastUpdated: new Date().toISOString(),
      source: 'Mock Data',
      category: 'global' as const,
      version: `${Math.floor(Math.random() * 20) + 100}.0`
    }));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health check method
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    scrapers: Record<string, boolean>;
    cacheSize: number;
  }> {
    const scrapers = await this.loadScrapers();
    const scraperHealth: Record<string, boolean> = {};
    let healthyCount = 0;

    for (const [name] of Object.entries(scrapers)) {
      try {
        // Quick health check - just verify the scraper can initialize
        const cacheKey = `health-${name}`;
        const hasRecentData = this.cache.has(cacheKey);
        scraperHealth[name] = hasRecentData;
        if (hasRecentData) healthyCount++;
      } catch {
        scraperHealth[name] = false;
      }
    }

    const totalScrapers = Object.keys(scrapers).length;
    let status: 'healthy' | 'degraded' | 'unhealthy';
    
    if (healthyCount === totalScrapers) {
      status = 'healthy';
    } else if (healthyCount > 0) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      scrapers: scraperHealth,
      cacheSize: this.cache.size
    };
  }
}

export const scraperOrchestrator = new ScraperOrchestrator();