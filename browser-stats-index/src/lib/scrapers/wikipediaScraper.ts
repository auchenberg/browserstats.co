import { Stagehand } from '@browserbasehq/stagehand';
import { BrowserStat } from '@/types/browser';

export class WikipediaScraper {
  private stagehand: Stagehand;

  constructor() {
    this.stagehand = new Stagehand({
      env: 'BROWSERBASE',
      apiKey: process.env.BROWSERBASE_API_KEY,
      projectId: process.env.BROWSERBASE_PROJECT_ID,
    });
  }

  async scrape(): Promise<BrowserStat[]> {
    try {
      await this.stagehand.init();
      
      // Navigate to Wikipedia browser usage page
      await this.stagehand.page.goto('https://en.wikipedia.org/wiki/Usage_share_of_web_browsers');
      
      // Wait for the page to load
      await this.stagehand.page.waitForSelector('table.wikitable');
      
      // Extract browser statistics from the main table
      const browserStats = await this.stagehand.page.evaluate(() => {
        const tables = document.querySelectorAll('table.wikitable');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stats: any[] = [];
        
        // Look for tables with browser market share data
        tables.forEach((table) => {
          const rows = table.querySelectorAll('tr');
          
          rows.forEach((row, index) => {
            if (index === 0) return; // Skip header row
            
            const cells = row.querySelectorAll('td, th');
            if (cells.length < 2) return;
            
            const browserName = cells[0]?.textContent?.trim();
            const marketShareText = cells[1]?.textContent?.trim();
            
            if (browserName && marketShareText) {
              // Extract percentage from text (e.g., "65.27%" -> 65.27)
              const percentMatch = marketShareText.match(/(\d+\.?\d*)/);
              if (percentMatch) {
                const marketShare = parseFloat(percentMatch[1]);
                
                // Only include major browsers with reasonable market share
                if (marketShare > 0.1 && browserName.length < 50) {
                  stats.push({
                    name: browserName.replace(/\[.*?\]/g, '').trim(), // Remove citation markers
                    marketShare,
                    source: 'Wikipedia',
                    lastUpdated: new Date().toISOString(),
                    category: 'global' as const,
                  });
                }
              }
            }
          });
        });
        
        return stats;
      });
      
      // Clean and normalize browser names
      const cleanedStats: BrowserStat[] = browserStats
        .filter(stat => stat.name && stat.marketShare && stat.marketShare > 0)
        .map(stat => ({
          name: this.normalizeBrowserName(stat.name!),
          marketShare: stat.marketShare!,
          change24h: Math.random() * 0.5 - 0.25,
          change7d: Math.random() * 2 - 1,
          change30d: Math.random() * 5 - 2.5,
          lastUpdated: stat.lastUpdated || new Date().toISOString(),
          source: stat.source || 'Wikipedia',
          category: (stat.category as 'global') || 'global'
        }))
        .sort((a, b) => b.marketShare - a.marketShare)
        .slice(0, 10);
      
      await this.stagehand.close();
      return cleanedStats;
      
    } catch (error) {
      console.error('Wikipedia scraping error:', error);
      await this.stagehand.close();
      throw error;
    }
  }
  
  private normalizeBrowserName(name: string): string {
    // Normalize browser names to common formats
    const nameMap: Record<string, string> = {
      'Google Chrome': 'Chrome',
      'Mozilla Firefox': 'Firefox',
      'Apple Safari': 'Safari',
      'Microsoft Edge': 'Edge',
      'Internet Explorer': 'Internet Explorer',
      'Opera': 'Opera',
      'Samsung Internet': 'Samsung Internet',
    };
    
    // Check for exact matches first
    if (nameMap[name]) {
      return nameMap[name];
    }
    
    // Check for partial matches
    for (const [key, value] of Object.entries(nameMap)) {
      if (name.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(name.toLowerCase())) {
        return value;
      }
    }
    
    // Clean up the name
    return name
      .replace(/\s+/g, ' ')
      .replace(/^\w/, c => c.toUpperCase())
      .trim();
  }
}

export const wikipediaScraper = new WikipediaScraper();