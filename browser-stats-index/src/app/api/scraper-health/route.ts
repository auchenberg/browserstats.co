import { NextRequest, NextResponse } from 'next/server';
import { scraperOrchestrator } from '@/lib/scrapers/scraperOrchestrator';

export async function GET() {
  try {
    const health = await scraperOrchestrator.healthCheck();
    
    return NextResponse.json({
      success: true,
      data: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Health check failed',
        data: {
          status: 'unhealthy',
          scrapers: {},
          cacheSize: 0
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, source } = body;

    if (action === 'scrape') {
      if (source) {
        // Scrape specific source
        const data = await scraperOrchestrator.scrapeSource(source);
        return NextResponse.json({
          success: true,
          data,
          source,
          timestamp: new Date().toISOString()
        });
      } else {
        // Scrape all sources
        const result = await scraperOrchestrator.scrapeAll();
        return NextResponse.json({
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Scraper API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}