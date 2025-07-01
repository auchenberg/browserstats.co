import { NextRequest, NextResponse } from 'next/server';
import { browserDataService } from '@/lib/dataServices';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const browser = searchParams.get('browser');
    const days = parseInt(searchParams.get('days') || '30');
    
    if (!browser) {
      return NextResponse.json({ error: 'Browser parameter is required' }, { status: 400 });
    }
    
    const trends = await browserDataService.fetchHistoricalTrends(browser, days);
    
    return NextResponse.json({
      browser,
      trends,
      period: `${days} days`,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching browser trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch browser trends' },
      { status: 500 }
    );
  }
}