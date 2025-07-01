'use client';

import { useState } from 'react';
import { BrowserStat } from '@/types/browser';
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';

interface BrowserStatsTableProps {
  browsers: BrowserStat[];
  title: string;
  description?: string;
}

type SortField = 'name' | 'marketShare' | 'change24h' | 'change7d' | 'change30d';
type SortOrder = 'asc' | 'desc';

const getBrowserIcon = (name: string) => {
  const icons: Record<string, string> = {
    'Chrome': '🟡',
    'Safari': '🔵',
    'Edge': '🟦',
    'Firefox': '🟠',
    'Opera': '🔴',
    'Samsung Internet': '⚫',
    'Others': '⚪'
  };
  return icons[name] || '🌐';
};

const formatChange = (change: number | undefined) => {
  if (change === undefined || change === null) return null;
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;
  
  return (
    <div className={clsx('flex items-center space-x-1', {
      'text-green-600': isPositive,
      'text-red-600': isNegative,
      'text-gray-500': isNeutral
    })}>
      {isPositive && <TrendingUp className="h-3 w-3" />}
      {isNegative && <TrendingDown className="h-3 w-3" />}
      {isNeutral && <Minus className="h-3 w-3" />}
      <span className="text-xs font-medium">
        {isPositive ? '+' : ''}{change.toFixed(2)}%
      </span>
    </div>
  );
};

export default function BrowserStatsTable({ browsers, title, description }: BrowserStatsTableProps) {
  const [sortField, setSortField] = useState<SortField>('marketShare');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'marketShare' ? 'desc' : 'asc');
    }
  };

  const sortedBrowsers = [...browsers].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortField) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'marketShare':
        aValue = a.marketShare;
        bValue = b.marketShare;
        break;
      case 'change24h':
        aValue = a.change24h || 0;
        bValue = b.change24h || 0;
        break;
      case 'change7d':
        aValue = a.change7d || 0;
        bValue = b.change7d || 0;
        break;
      case 'change30d':
        aValue = a.change30d || 0;
        bValue = b.change30d || 0;
        break;
      default:
        aValue = a.marketShare;
        bValue = b.marketShare;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortOrder === 'asc' 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:bg-gray-50 px-2 py-1 rounded text-left w-full"
    >
      <span>{children}</span>
      {sortField === field && (
        sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
      )}
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="name">Browser</SortButton>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="marketShare">Market Share</SortButton>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="change24h">24h Change</SortButton>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="change7d">7d Change</SortButton>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="change30d">30d Change</SortButton>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedBrowsers.map((browser) => (
              <tr key={`${browser.name}-${browser.source}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{getBrowserIcon(browser.name)}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{browser.name}</div>
                      {browser.version && (
                        <div className="text-xs text-gray-500">v{browser.version}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(browser.marketShare, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {browser.marketShare.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatChange(browser.change24h)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatChange(browser.change7d)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatChange(browser.change30d)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {browser.source}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}