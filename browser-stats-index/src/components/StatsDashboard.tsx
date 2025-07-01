'use client';

import { useState, useEffect } from 'react';
import { BrowserStat } from '@/types/browser';
import { TrendingUp, TrendingDown, Users, Globe, Activity, BarChart3 } from 'lucide-react';
import clsx from 'clsx';

interface StatsDashboardProps {
  browsers: BrowserStat[];
}

interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  trend: 'up' | 'down' | 'neutral';
}

export default function StatsDashboard({ browsers }: StatsDashboardProps) {
  const [stats, setStats] = useState<StatCard[]>([]);

  useEffect(() => {
    if (browsers.length === 0) return;

    // Calculate market dominance (top browser percentage)
    const topBrowser = browsers.reduce((max, current) => 
      current.marketShare > max.marketShare ? current : max, browsers[0]
    );

    // Calculate diversity index (how evenly distributed market share is)
    const totalShare = browsers.reduce((sum, browser) => sum + browser.marketShare, 0);
    const normalizedShares = browsers.map(b => b.marketShare / totalShare);
    const diversityIndex = -normalizedShares.reduce((sum, share) => 
      sum + (share > 0 ? share * Math.log(share) : 0), 0
    ) / Math.log(browsers.length);

    // Calculate average growth
    const validChanges = browsers.filter(b => b.change7d !== undefined).map(b => b.change7d!);
    const avgGrowth = validChanges.length > 0 
      ? validChanges.reduce((sum, change) => sum + change, 0) / validChanges.length 
      : 0;

    // Calculate volatility (standard deviation of market shares)
    // const avgMarketShare = browsers.reduce((sum, b) => sum + b.marketShare, 0) / browsers.length;
    // const variance = browsers.reduce((sum, b) => sum + Math.pow(b.marketShare - avgMarketShare, 2), 0) / browsers.length;
    // const volatility = Math.sqrt(variance);

    const newStats: StatCard[] = [
      {
        title: 'Market Leader',
        value: `${topBrowser.name} (${topBrowser.marketShare.toFixed(1)}%)`,
        change: topBrowser.change7d || 0,
        icon: Users,
        trend: (topBrowser.change7d || 0) > 0 ? 'up' : (topBrowser.change7d || 0) < 0 ? 'down' : 'neutral'
      },
      {
        title: 'Active Browsers',
        value: browsers.length.toString(),
        change: 0,
        icon: Globe,
        trend: 'neutral'
      },
      {
        title: 'Market Diversity',
        value: `${(diversityIndex * 100).toFixed(1)}%`,
        change: 0,
        icon: BarChart3,
        trend: 'neutral'
      },
      {
        title: 'Avg. 7-Day Growth',
        value: `${avgGrowth >= 0 ? '+' : ''}${avgGrowth.toFixed(2)}%`,
        change: avgGrowth,
        icon: Activity,
        trend: avgGrowth > 0 ? 'up' : avgGrowth < 0 ? 'down' : 'neutral'
      }
    ];

    setStats(newStats);
  }, [browsers]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={clsx(
                  'p-2 rounded-lg',
                  {
                    'bg-green-100 text-green-600': stat.trend === 'up',
                    'bg-red-100 text-red-600': stat.trend === 'down',
                    'bg-gray-100 text-gray-600': stat.trend === 'neutral'
                  }
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              {stat.change !== 0 && (
                <div className={clsx(
                  'flex items-center space-x-1',
                  {
                    'text-green-600': stat.trend === 'up',
                    'text-red-600': stat.trend === 'down',
                    'text-gray-500': stat.trend === 'neutral'
                  }
                )}>
                  {stat.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                  {stat.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                  <span className="text-sm font-medium">
                    {stat.change > 0 ? '+' : ''}{stat.change.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}