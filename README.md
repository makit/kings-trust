# Kings Trust Hackathon - Career Pathfinder

**A skills-first career discovery platform built for the Kings Trust Hackathon**

This project helps young people discover career opportunities by matching their skills to suitable occupations using the ESCO (European Skills, Competences, Qualifications and Occupations) taxonomy. Built with Next.js, it features an AI-powered adaptive quiz that identifies users' skills and connects them with relevant career paths.

## The Challenge

Young people often struggle to identify career paths that match their skills and interests. Traditional career guidance relies on self-awareness and knowledge of the job market that many young people don't yet have. This platform takes a skills-first approach, helping users discover what they're good at and showing them careers they might never have considered.

## Key Features

### ✅ Fully Implemented

- **Adaptive Skills Assessment Quiz**: AI-powered quiz using Bayesian inference and AWS Bedrock to efficiently identify user skills through intelligent question selection
- **Skills Browser**: Explore 13,000+ skills with advanced filtering and search
- **Occupations Browser**: Browse 3,000+ occupation profiles with detailed skill requirements
- **Skills Matcher**: Input your skills and get matched to suitable occupations with match scores
- **Rich Data Integration**: Full ESCO taxonomy with skills hierarchy, skill-skill relationships, and occupation-skill mappings

### 🎯 What Makes It Special

1. **Intelligent Questioning**: Uses Bayesian probability to ask the most informative questions, reducing quiz time while improving accuracy
2. **AI-Powered Adaptation**: Leverages AWS Bedrock (Claude) to generate contextual follow-up questions based on user responses
3. **Real-Time Matching**: As users answer questions, the system continuously updates occupation matches
4. **Skills-First Approach**: Focuses on what users can do, not job titles they already know

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
- **AI/ML**: AWS Bedrock (Claude Sonnet 3.5) for adaptive questioning
- **Algorithms**: Bayesian inference for probabilistic skill assessment
- **Icons**: Lucide React

## How It Works

### The Quiz Engine

The platform uses a sophisticated two-stage quiz system:

1. **Stage 1 - Broad Assessment**: Identifies general skill areas using predefined scenario-based questions
2. **Stage 2 - AI-Powered Deep Dive**: Generates dynamic questions using AWS Bedrock to explore promising skill areas in depth

The Bayesian engine maintains probability distributions for each skill, updating beliefs as users answer questions. This allows the system to:
- Ask fewer, more relevant questions
- Handle uncertainty in responses
- Provide confidence scores for skill assessments
- Match users to occupations with quantified certainty

### The Matching Algorithm

Occupation matching considers:
- Essential skills (weighted heavily)
- Optional skills (bonus points)
- Skill confidence levels
- Coverage percentage (how many required skills the user has)

Results show both match scores and confidence intervals, giving users realistic expectations.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run import-data` - Import CSV data to SQLite database
- `npm run lint` - Run ESLint

## Data Source

All data comes from the [ESCO Portal](https://esco.ec.europa.eu/) via [Tabiya Open Taxonomy](https://tabiya.tech/).

## Implementation Status

### ✅ Completed
- Full ESCO data integration (13,000+ skills, 3,000+ occupations)
- Skills and occupations browsers with advanced search/filtering
- Bayesian quiz engine with probability inference
- AI-powered adaptive question generation using AWS Bedrock
- Two-stage quiz system (broad assessment + deep dive)
- Real-time occupation matching with confidence scores
- Skills matcher tool
- Complete API layer
- Responsive UI with Tailwind CSS

### 🎓 Built for Kings Trust Hackathon

This project was created to support the Kings Trust's mission of helping young people build the skills and confidence they need to unlock their potential. By combining proven taxonomies (ESCO) with modern AI technology, we've created a tool that makes career exploration accessible, engaging, and personalized.

## Data Source

All occupation and skills data comes from the [ESCO Portal](https://esco.ec.europa.eu/) via [Tabiya Open Taxonomy](https://tabiya.tech/). ESCO provides a standardized, multilingual classification system used across Europe for education, training, and employment.

## Contributing

This project was built for the Kings Trust Hackathon. See [PROJECT_SPEC.md](PROJECT_SPEC.md) for detailed specifications, or explore the quiz implementation details in [QUIZ_IMPLEMENTATION.md](QUIZ_IMPLEMENTATION.md) and [BAYESIAN_QUIZ.md](BAYESIAN_QUIZ.md).

## License

Data from ESCO is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

---

**Built with ❤️ for the Kings Trust Hackathon** - Empowering young people to discover their potential through skills-first career exploration.
