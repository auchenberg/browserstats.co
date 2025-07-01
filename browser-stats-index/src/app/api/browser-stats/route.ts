import { NextRequest, NextResponse } from 'next/server';
import { browserDataService } from '@/lib/dataServices';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    
    if (source) {
      // Fetch data from specific source
      let data;
      switch (source) {
        case 'wikipedia':
          data = await browserDataService.fetchWikipediaBrowserData();
          break;
        case 'github':
          data = await browserDataService.fetchGitHubBrowserStats();
          break;
        case 'netmarket':
          data = await browserDataService.fetchNetMarketShareData();
          break;
        case 'analytics-usa':
          data = await browserDataService.fetchAnalyticsUSAData();
          break;
        case 'global-stats':
          data = await browserDataService.fetchGlobalStatsData();
          break;
        default:
          return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
      }
      
      return NextResponse.json({ data, source });
    }
    
    // Fetch all data and aggregated results
    const allData = await browserDataService.fetchAllBrowserData();
    
    return NextResponse.json({
      aggregated: allData.aggregated,
      sources: allData.sources,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching browser stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch browser statistics' },
      { status: 500 }
    );
  }
}