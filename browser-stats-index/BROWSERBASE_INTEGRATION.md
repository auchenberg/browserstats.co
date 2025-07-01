# Browserbase Integration with Stagehand

This project now includes real web scraping capabilities using [Browserbase](https://browserbase.com) and their [Stagehand](https://github.com/browserbase/stagehand) framework.

## Overview

Instead of using mock data, the application can now scrape real browser statistics from multiple sources:

- **Wikipedia Usage Share of Web Browsers** - Community-maintained browser usage statistics
- **GitHub Browser Stats Repository** - Historical browser usage datasets
- **Analytics.usa.gov** - US Government website analytics data

## Architecture

### Scraper Components

1. **Individual Scrapers** (`src/lib/scrapers/`)
   - `wikipediaScraper.ts` - Scrapes Wikipedia browser usage tables
   - `githubScraper.ts` - Extracts data from GitHub browser-stats repository
   - `analyticsUSAScraper.ts` - Fetches US government analytics data

2. **Scraper Orchestrator** (`src/lib/scrapers/scraperOrchestrator.ts`)
   - Manages all scrapers with concurrency control
   - Handles caching, rate limiting, and error recovery
   - Aggregates data from multiple sources
   - Provides health monitoring

3. **Integration Layer** (`src/lib/dataServices.ts`)
   - Updated existing data service to use scrapers
   - Maintains backward compatibility with mock data fallbacks
   - Seamless integration with existing API endpoints

## Setup Instructions

### 1. Get Browserbase Credentials

1. Sign up at [Browserbase](https://browserbase.com)
2. Create a new project
3. Get your API key and Project ID from the dashboard

### 2. Configure Environment Variables

Create a `.env.local` file (or copy from `.env.local.example`):

```bash
# Browserbase Configuration
BROWSERBASE_API_KEY=your_browserbase_api_key_here
BROWSERBASE_PROJECT_ID=your_project_id_here

# Scraping Configuration
SCRAPING_ENABLED=true
SCRAPING_INTERVAL_MINUTES=30
CACHE_DURATION_MINUTES=5

# Rate Limiting
MAX_CONCURRENT_SCRAPERS=3
SCRAPER_DELAY_MS=2000
```

### 3. Install Dependencies

The Stagehand dependency is already included:

```bash
npm install @browserbasehq/stagehand
```

## Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BROWSERBASE_API_KEY` | Your Browserbase API key | Required |
| `BROWSERBASE_PROJECT_ID` | Your Browserbase project ID | Required |
| `SCRAPING_ENABLED` | Enable/disable real scraping | `true` |
| `CACHE_DURATION_MINUTES` | How long to cache scraped data | `5` |
| `MAX_CONCURRENT_SCRAPERS` | Max scrapers running simultaneously | `3` |
| `SCRAPER_DELAY_MS` | Delay between scraper calls | `2000` |

### Fallback Behavior

- If `SCRAPING_ENABLED=false`, the app uses mock data
- If scrapers fail, the app automatically falls back to mock data
- Individual scraper failures are handled gracefully
- Cache is used to reduce API calls and improve performance

## API Endpoints

### Health Check and Manual Control

**GET** `/api/scraper-health`
- Returns health status of all scrapers
- Shows cache size and scraper availability

**POST** `/api/scraper-health`
- Manually trigger scraping operations
- Body: `{ "action": "scrape", "source": "wikipedia" }` (optional source)

### Example Usage

```javascript
// Check scraper health
const health = await fetch('/api/scraper-health');
const healthData = await health.json();

// Manually trigger scraping
const scrape = await fetch('/api/scraper-health', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'scrape' })
});
```

## How Scrapers Work

### Wikipedia Scraper
- Navigates to Wikipedia's browser usage page
- Extracts data from wikitable elements
- Parses market share percentages
- Normalizes browser names for consistency

### GitHub Scraper
- Accesses GitHub browser-stats repository
- Looks for CSV data files
- Converts raw CSV to structured data
- Falls back to mock data if files aren't accessible

### Analytics USA Scraper
- Attempts to extract browser data from analytics.usa.gov
- Looks for JSON data in script tags or visible elements
- Focuses on US government website visitor data
- Provides realistic fallback data for government use patterns

## Data Aggregation

The scraper orchestrator:

1. **Runs scrapers concurrently** (with rate limiting)
2. **Caches results** for the configured duration
3. **Aggregates data** by averaging market shares across sources
4. **Normalizes browser names** (e.g., "Google Chrome" → "Chrome")
5. **Handles errors gracefully** with automatic fallbacks

## Performance Considerations

- **Caching**: Results are cached for 5 minutes by default
- **Rate Limiting**: Max 3 concurrent scrapers with 2-second delays
- **Error Handling**: Individual scraper failures don't break the entire system
- **Fallback Strategy**: Always maintains functionality even if all scrapers fail

## Security and Ethics

- **Respectful Scraping**: Implements delays and rate limiting
- **Public Data Only**: Only scrapes publicly available information
- **User Agent**: Uses proper browser automation (not disguised requests)
- **Error Handling**: Graceful degradation prevents service disruption

## Monitoring and Debugging

### Health Check Dashboard
Visit `/api/scraper-health` to see:
- Overall system health (healthy/degraded/unhealthy)
- Individual scraper status
- Cache utilization
- Recent error information

### Console Logging
Scrapers provide detailed logging:
```
Starting scrape for wikipedia...
Completed scrape for wikipedia: 7 items
Scraper github failed: Navigation timeout
```

### Development Mode
Set `SCRAPING_ENABLED=false` for development to use mock data and avoid API calls.

## Extending the System

### Adding New Scrapers

1. Create a new scraper class in `src/lib/scrapers/`
2. Implement the scraping logic using Stagehand
3. Add it to the `scrapers` object in `scraperOrchestrator.ts`
4. Update the data service mapping

### Example New Scraper

```typescript
export class NewSourceScraper {
  private stagehand: Stagehand;

  constructor() {
    this.stagehand = new Stagehand({
      env: 'BROWSERBASE',
      apiKey: process.env.BROWSERBASE_API_KEY,
      projectId: process.env.BROWSERBASE_PROJECT_ID,
    });
  }

  async scrape(): Promise<BrowserStat[]> {
    await this.stagehand.init();
    await this.stagehand.page.goto('https://example.com/browser-stats');
    
    // Scraping logic here
    
    await this.stagehand.close();
    return results;
  }
}
```

## Troubleshooting

### Common Issues

1. **"Object literal may only specify known properties" Error**
   - Stagehand configuration has changed
   - Remove unsupported properties like `headless`

2. **Scrapers Always Return Mock Data**
   - Check `BROWSERBASE_API_KEY` and `BROWSERBASE_PROJECT_ID`
   - Verify `SCRAPING_ENABLED=true`
   - Check network connectivity

3. **Rate Limiting Issues**
   - Increase `SCRAPER_DELAY_MS`
   - Reduce `MAX_CONCURRENT_SCRAPERS`

4. **Browser Session Failures**
   - Verify Browserbase account is active
   - Check API key permissions
   - Monitor Browserbase dashboard for session limits

### Debug Mode

Enable verbose logging by setting `NODE_ENV=development` and checking browser console for detailed scraper execution logs.

## Cost Optimization

- **Caching**: Reduces Browserbase session usage
- **Fallback Strategy**: Prevents unnecessary retries
- **Selective Scraping**: Option to disable scraping per source
- **Development Mode**: Uses mock data to avoid API costs during development

## Production Deployment

### Environment Setup
```bash
# Production environment variables
BROWSERBASE_API_KEY=prod_key_here
BROWSERBASE_PROJECT_ID=prod_project_id
SCRAPING_ENABLED=true
CACHE_DURATION_MINUTES=30  # Longer cache in production
MAX_CONCURRENT_SCRAPERS=2  # Conservative for production
```

### Monitoring
- Set up alerts for scraper health endpoint
- Monitor Browserbase usage in their dashboard
- Log scraper errors for debugging

This integration provides a robust, scalable solution for real-time browser statistics while maintaining reliability through intelligent fallbacks and caching strategies.