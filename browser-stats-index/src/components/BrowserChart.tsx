'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { BrowserStat, BrowserTrend } from '@/types/browser';

interface BrowserChartProps {
  data: BrowserStat[] | BrowserTrend[];
  type: 'pie' | 'line' | 'bar';
  title: string;
  height?: number;
}

// Color palette for charts
// const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

const getBrowserColor = (name: string) => {
  const colorMap: Record<string, string> = {
    'Chrome': '#3B82F6',
    'Safari': '#06B6D4',
    'Edge': '#10B981',
    'Firefox': '#F59E0B',
    'Opera': '#EF4444',
    'Samsung Internet': '#8B5CF6',
    'Others': '#84CC16'
  };
  return colorMap[name] || '#94A3B8';
};

interface TooltipPayload {
  color: string;
  name: string;
  value: number;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {payload.map((entry: TooltipPayload, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? `${entry.value.toFixed(2)}%` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function BrowserChart({ data, type, title, height = 400 }: BrowserChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  const renderPieChart = (browsers: BrowserStat[]) => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={browsers}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(1)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="marketShare"
        >
          {browsers.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getBrowserColor(entry.name)} 
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderLineChart = (trends: BrowserTrend[]) => {
    // Group trends by browser
    const browserGroups = trends.reduce((acc, trend) => {
      if (!acc[trend.browser]) {
        acc[trend.browser] = [];
      }
      acc[trend.browser].push(trend);
      return acc;
    }, {} as Record<string, BrowserTrend[]>);

    // Convert to format suitable for line chart
    const chartData = Object.keys(browserGroups).length > 0 
      ? browserGroups[Object.keys(browserGroups)[0]].map(trend => {
          const dataPoint: { [key: string]: number | string } = { date: trend.date };
          Object.keys(browserGroups).forEach(browser => {
            const browserTrend = browserGroups[browser].find(t => t.date === trend.date);
            dataPoint[browser] = browserTrend ? browserTrend.marketShare : 0;
          });
          return dataPoint;
        })
      : [];

    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {Object.keys(browserGroups).map((browser) => (
            <Line
              key={browser}
              type="monotone"
              dataKey={browser}
              stroke={getBrowserColor(browser)}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderBarChart = (browsers: BrowserStat[]) => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={browsers}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="marketShare" 
          fill="#3B82F6"
          radius={[4, 4, 0, 0]}
        >
          {browsers.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getBrowserColor(entry.name)} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return renderPieChart(data as BrowserStat[]);
      case 'line':
        return renderLineChart(data as BrowserTrend[]);
      case 'bar':
        return renderBarChart(data as BrowserStat[]);
      default:
        return renderPieChart(data as BrowserStat[]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {renderChart()}
    </div>
  );
}