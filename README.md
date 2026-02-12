# Summer Calling 🌅

A beautiful weather tracking web application that helps you discover when summer days are arriving by analyzing sunrise and sunset patterns.

![Summer Calling](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.2-2D3748?style=flat&logo=prisma)

## Features

- 🌡️ **7-Day Weather Forecast** - View high/low temperatures for the current week
- 🌅 **Sunrise & Sunset Tracking** - Monitor daily sunrise and sunset times
- 📊 **Interactive Charts** - Visualize temperature trends and sun patterns
- 🎉 **Summer Day Detection** - Get notified when:
  - Sunset is ≥30 minutes later than any previous day this month
  - Sunrise is ≥30 minutes earlier than any previous day this month
- 📍 **Location Search** - Track weather for any city worldwide
- 🎨 **Glassmorphism UI** - Beautiful, modern design with vibrant gradients

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism design
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **API**: OpenWeatherMap API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenWeatherMap API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd SummerCalling
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# OpenWeatherMap API Key
OPENWEATHER_API_KEY=your_api_key_here

# Supabase Database URL
# Get this from: Supabase Project Settings → Database → Connection String (URI)
DATABASE_URL="postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres"
```

4. Set up the database:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Weather Data Caching
- Weather data is cached for 5 hours to minimize API calls
- Fresh data is fetched from OpenWeatherMap when cache expires
- All data is stored in Supabase for historical comparison

### Summer Day Detection Algorithm

For each day in the current week:
1. Compare sunset time to all previous days in the current month
2. Compare sunrise time to all previous days in the current month
3. If sunset is ≥30 minutes later AND sunrise is ≥30 minutes earlier, it's a **Summer Day**! 🎉

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel project settings:
   - `OPENWEATHER_API_KEY`
   - `DATABASE_URL`
4. Deploy!

## API Routes

- `GET /api/weather?location={city}` - Fetch weather data and summer detections
- `GET /api/location?q={query}` - Search for cities

## Project Structure

```
SummerCalling/
├── app/
│   ├── api/          # API routes
│   ├── globals.css   # Global styles with glassmorphism
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Main dashboard
├── components/       # React components
├── lib/              # Utilities and logic
├── prisma/           # Database schema
└── public/           # Static assets
```

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

MIT

## Acknowledgments

- Weather data from [OpenWeatherMap](https://openweathermap.org/)
- Database hosted on [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)
