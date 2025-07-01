'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import StatsDashboard from '@/components/StatsDashboard';
import BrowserStatsTable from '@/components/BrowserStatsTable';
import BrowserChart from '@/components/BrowserChart';
import { BrowserStat } from '@/types/browser';
import { DATA_SOURCES } from '@/lib/dataServices';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Clock, Database, TrendingUp } from 'lucide-react';

interface BrowserData {
  aggregated: BrowserStat[];
  sources: Record<string, BrowserStat[]>;
  lastUpdated: string;
}

export default function HomePage() {
  const [browserData, setBrowserData] = useState<BrowserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchBrowserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/browser-stats');
      if (!response.ok) {
        throw new Error('Failed to fetch browser statistics');
      }
      
      const data = await response.json();
      setBrowserData(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrowserData();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchBrowserData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchBrowserData();
  };

  if (loading && !browserData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading browser statistics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Data</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Browser Statistics Index
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Comprehensive browser market share analytics from multiple trusted sources
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>{DATA_SOURCES.length} data sources</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {browserData && (
          <>
            {/* Stats Dashboard */}
            <StatsDashboard browsers={browserData.aggregated} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <BrowserChart
                data={browserData.aggregated}
                type="pie"
                title="Market Share Distribution"
                height={350}
              />
              <BrowserChart
                data={browserData.aggregated}
                type="bar"
                title="Browser Comparison"
                height={350}
              />
            </div>

            {/* Top Browsers Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Top Browsers</h2>
              </div>
              
              <BrowserStatsTable
                browsers={browserData.aggregated}
                title="Aggregated Browser Statistics"
                description="Combined data from all sources, providing the most comprehensive view of browser market share"
              />
            </div>

            {/* Data Sources Breakdown */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Source Breakdown</h2>
              
              <Tabs defaultValue="wikipedia" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                  <TabsTrigger value="wikipedia">Wikipedia</TabsTrigger>
                  <TabsTrigger value="github">GitHub</TabsTrigger>
                  <TabsTrigger value="netmarket">NetMarket</TabsTrigger>
                  <TabsTrigger value="analyticsUSA">Analytics.gov</TabsTrigger>
                  <TabsTrigger value="globalStats">Global Stats</TabsTrigger>
                </TabsList>
                
                <TabsContent value="wikipedia">
                  <BrowserStatsTable
                    browsers={browserData.sources.wikipedia || []}
                    title="Wikipedia Usage Share"
                    description="Community-maintained browser usage statistics from Wikipedia"
                  />
                </TabsContent>
                
                <TabsContent value="github">
                  <BrowserStatsTable
                    browsers={browserData.sources.github || []}
                    title="GitHub Browser Stats"
                    description="Historical browser usage data from the datasets/browser-stats repository"
                  />
                </TabsContent>
                
                <TabsContent value="netmarket">
                  <BrowserStatsTable
                    browsers={browserData.sources.netmarket || []}
                    title="NetMarketShare"
                    description="Commercial browser market share analytics and trends"
                  />
                </TabsContent>
                
                <TabsContent value="analyticsUSA">
                  <BrowserStatsTable
                    browsers={browserData.sources.analyticsUSA || []}
                    title="Analytics.usa.gov"
                    description="US Government website analytics data showing browser usage patterns"
                  />
                </TabsContent>
                
                <TabsContent value="globalStats">
                  <BrowserStatsTable
                    browsers={browserData.sources.globalStats || []}
                    title="Global Stats"
                    description="Global browser usage statistics from multiple regions"
                  />
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Data Sources
              </h3>
              <ul className="space-y-2">
                {DATA_SOURCES.map((source) => (
                  <li key={source.id}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      {source.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                About
              </h3>
              <p className="text-sm text-gray-600">
                Browser Statistics Index provides comprehensive, real-time browser market share 
                data aggregated from multiple trusted sources to give you the most accurate 
                picture of web browser usage trends.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Updates
              </h3>
              <p className="text-sm text-gray-600">
                Data is automatically refreshed every 5 minutes to ensure you have access to 
                the most current browser usage statistics and market trends.
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              © 2024 Browser Statistics Index. Data aggregated from public sources.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
