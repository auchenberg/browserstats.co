# Browser Statistics Index

A comprehensive browser statistics dashboard that aggregates market share data from multiple trusted sources, inspired by the design of ailaborindex.com. This application provides real-time browser usage analytics and trends across different platforms and regions.

![Browser Statistics Index](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🌟 Features

### Real Web Scraping with Browserbase
- **Live Data Collection**: Automated scraping using Browserbase + Stagehand framework
- **Intelligent Fallbacks**: Graceful degradation to mock data if scraping fails
- **Rate Limiting**: Respectful scraping with configurable delays and concurrency
- **Health Monitoring**: Built-in scraper health checks and manual controls
- **Caching System**: Smart caching reduces API calls and improves performance

### Data Sources Integration
- **Wikipedia Usage Share**: Live-scraped community-maintained browser statistics
- **GitHub Browser Stats**: Real-time data from the datasets/browser-stats repository  
- **Analytics.usa.gov**: Live US Government website analytics scraping
- **NetMarketShare**: Commercial browser market share analytics (mock)
- **Global Stats**: Comprehensive global browser usage statistics (mock)

### Analytics Dashboard
- **Real-time Market Share**: Live browser market share percentages
- **Trend Analysis**: 24h, 7-day, and 30-day change tracking
- **Interactive Charts**: Pie charts, bar charts, and trend visualizations
- **Market Diversity Index**: Statistical analysis of browser competition
- **Geographic Breakdown**: Regional browser usage patterns

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface inspired by ailaborindex.com
- **Real-time Updates**: Automatic data refresh every 5 minutes
- **Sortable Tables**: Interactive sorting by market share, change, and source
- **Data Source Tabs**: Switch between different data providers

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd browser-stats-index
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Browserbase (Optional)**
   ```bash
   # Copy environment template
   cp .env.local.example .env.local
   
   # Add your Browserbase credentials to .env.local
   BROWSERBASE_API_KEY=your_api_key
   BROWSERBASE_PROJECT_ID=your_project_id
   SCRAPING_ENABLED=true
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

> **Note**: Without Browserbase credentials, the app will use mock data. See [BROWSERBASE_INTEGRATION.md](./BROWSERBASE_INTEGRATION.md) for full setup instructions.

### Build for Production

```bash
npm run build
npm run start
```

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Data Fetching**: Native fetch API with caching
- **UI Components**: Custom components with Headless UI

### Project Structure
```
browser-stats-index/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   │   ├── browser-stats/ # Browser statistics endpoint
│   │   │   ├── trends/        # Trends endpoint
│   │   │   └── scraper-health/# Scraper monitoring endpoint
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── BrowserChart.tsx   # Chart components
│   │   ├── BrowserStatsTable.tsx
│   │   ├── Header.tsx
│   │   └── StatsDashboard.tsx
│   ├── lib/                   # Utility functions
│   │   ├── scrapers/         # Web scraping modules
│   │   │   ├── wikipediaScraper.ts
│   │   │   ├── githubScraper.ts
│   │   │   ├── analyticsUSAScraper.ts
│   │   │   └── scraperOrchestrator.ts
│   │   └── dataServices.ts    # Data fetching services
│   └── types/                 # TypeScript definitions
│       └── browser.ts
├── public/                    # Static assets
├── .env.local.example         # Environment variables template
├── BROWSERBASE_INTEGRATION.md # Detailed scraping setup guide
└── package.json
```

## 📊 Data Sources

### Current Sources
1. **Wikipedia** - Community-maintained usage statistics
2. **GitHub Browser Stats** - Historical browser data repository
3. **NetMarketShare** - Commercial analytics platform
4. **Analytics.usa.gov** - US government website data
5. **Global Stats** - Worldwide browser usage data

### Data Aggregation
- Sources are polled automatically every 5 minutes
- Data is cached to improve performance
- Market share percentages are aggregated across sources
- Trend calculations show percentage changes over time

## 🔧 API Endpoints

### Browser Statistics
```
GET /api/browser-stats
```
Returns aggregated browser statistics from all sources.

**Query Parameters:**
- `source` (optional): Filter by specific data source

**Response:**
```json
{
  "aggregated": [...],
  "sources": {
    "wikipedia": [...],
    "github": [...],
    "netmarket": [...],
    "analyticsUSA": [...],
    "globalStats": [...]
  },
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

### Browser Trends
```
GET /api/trends?browser=Chrome&days=30
```
Returns historical trend data for a specific browser.

**Query Parameters:**
- `browser` (required): Browser name
- `days` (optional): Number of days of history (default: 30)

### Scraper Health Monitoring
```
GET /api/scraper-health
```
Returns health status of all web scrapers.

```
POST /api/scraper-health
Content-Type: application/json

{
  "action": "scrape",
  "source": "wikipedia" // optional
}
```
Manually triggers scraping operations for testing or immediate updates.

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981) 
- **Warning**: Amber (#F59E0B)
- **Danger**: Red (#EF4444)
- **Gray Scale**: Various shades for text and backgrounds

### Typography
- **Headings**: Inter font family
- **Body**: Inter font family
- **Code**: JetBrains Mono

### Components
- Responsive grid layouts
- Card-based information architecture
- Interactive tables with sorting
- Modern chart visualizations
- Mobile-friendly navigation

## 🔄 Data Updates

### Automatic Refresh
- Dashboard refreshes every 5 minutes
- Manual refresh button available
- Real-time timestamps shown
- Error handling with retry mechanisms

### Caching Strategy
- 5-minute cache duration for API responses
- Client-side state management
- Optimistic updates for better UX

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Responsive Design

- **Desktop**: Full dashboard with all features
- **Tablet**: Adapted layout with collapsible sections
- **Mobile**: Stacked layout with touch-friendly interactions

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Other Platforms
- Netlify
- Railway
- DigitalOcean App Platform
- Self-hosted with Docker

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from [ailaborindex.com](https://www.ailaborindex.com/)
- Data sources: Wikipedia, GitHub, NetMarketShare, Analytics.usa.gov
- Built with Next.js, TypeScript, and Tailwind CSS
- Charts powered by Recharts

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Browser Statistics Index** - Comprehensive browser analytics for the modern web.
