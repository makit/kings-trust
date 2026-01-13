# ESCO Skills & Occupations Platform

A Next.js web application that helps users discover career opportunities based on their skills using the ESCO (European Skills, Competences, Qualifications and Occupations) taxonomy data.

## Features

- **Skills Browser**: Explore 13,000+ skills with filtering and search
- **Occupations Browser**: Browse 3,000+ occupation profiles with detailed requirements
- **Skills Matcher**: Match your skills to suitable occupations (Coming soon)
- **Skills Assessment Quiz**: Interactive quiz to identify your skills (Coming soon)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Import CSV data to SQLite:
```bash
npm run import-data
```

This will create an `esco.db` file in your project root with all the ESCO data.

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── skills/            # Skills browser pages
│   ├── occupations/       # Occupations browser pages
│   ├── matcher/           # Skills matcher (coming soon)
│   ├── quiz/              # Skills quiz (coming soon)
│   └── about/             # About page
├── components/            # React components
│   └── layout/           # Layout components (Header, Footer)
├── lib/                   # Utilities
│   └── database.ts       # Database queries and types
├── data/                  # CSV data files
├── scripts/               # Utility scripts
│   └── import-csv-to-sqlite.js
└── PROJECT_SPEC.md        # Comprehensive project specification

```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with better-sqlite3
- **Icons**: Lucide React

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run import-data` - Import CSV data to SQLite database
- `npm run lint` - Run ESLint

## Data Source

All data comes from the [ESCO Portal](https://esco.ec.europa.eu/) via [Tabiya Open Taxonomy](https://tabiya.tech/).

## Implementation Status

### ✅ Completed (Phase 1: Foundation)
- Next.js project setup with TypeScript
- Tailwind CSS configuration
- Database utilities and SQLite integration
- Layout components (Header, Footer)
- Home page with feature overview
- Skills browser with search and filters
- Skills detail pages
- Occupations browser with search and filters
- Occupation detail pages
- API routes for skills and occupations
- Match algorithm implementation

### 🚧 In Progress
- Skills matcher UI
- Skills assessment quiz

### 📋 Planned (See PROJECT_SPEC.md)
- ISCO groups browser
- Quiz question system
- Favorites/bookmarks
- Comparison tool
- Data visualizations

## License

Data from ESCO is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Contributing

See [PROJECT_SPEC.md](PROJECT_SPEC.md) for detailed specifications and implementation phases.
