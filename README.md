# Kings Trust - Career Pathfinder

**A skills-first career discovery platform built for the Kings Trust**

This project helps young people discover career opportunities by matching their skills to suitable occupations using the ESCO (European Skills, Competences, Qualifications and Occupations) taxonomy. Built with Next.js, it features an AI-powered adaptive quiz that identifies users' skills and connects them with relevant career paths.

## Project Structure

This repository contains two main components:

```
kings-trust/
├── web/                    # Next.js web application
│   ├── app/               # Next.js App Router pages & API routes
│   ├── components/        # React components
│   ├── lib/              # Business logic and utilities
│   ├── data/             # ESCO CSV data files
│   └── scripts/          # Database and utility scripts
│
└── infra/                 # AWS CDK infrastructure
    ├── lib/              # CDK stack definitions
    └── bin/              # CDK app entry point
```

## Quick Start

### Web Application (Development)

1. Navigate to the web folder:
```bash
cd web
```

2. Install dependencies:
```bash
npm install
```

3. Import CSV data to SQLite:
```bash
npm run import-data
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Infrastructure (AWS Deployment)

See [infra/DEPLOYMENT.md](infra/DEPLOYMENT.md) for complete deployment instructions.

1. Navigate to infra folder:
```bash
cd infra
```

2. Install dependencies:
```bash
npm install
```

3. Deploy to AWS:
```bash
cdk bootstrap  # First time only
cdk deploy
```

## Key Features

### ✅ Fully Implemented

- **Adaptive Skills Assessment Quiz**: AI-powered quiz using Bayesian inference and AWS Bedrock to efficiently identify user skills through intelligent question selection
- **Skills Browser**: Explore 13,000+ skills with advanced filtering and search
- **Occupations Browser**: Browse 3,000+ occupation profiles with detailed skill requirements
- **Rich Data Integration**: Full ESCO taxonomy with skills hierarchy, skill-skill relationships, and occupation-skill mappings
- **Production Deployment**: Fargate-based containerized deployment with auto-scaling and Bedrock integration

### 🎯 What Makes It Special

1. **Intelligent Questioning**: Uses Bayesian probability to ask the most informative questions, reducing quiz time while improving accuracy
2. **AI-Powered Adaptation**: Leverages AWS Bedrock (Claude) to generate contextual follow-up questions based on user responses
3. **Real-Time Matching**: As users answer questions, the system continuously updates occupation matches
4. **Skills-First Approach**: Focuses on what users can do, not job titles they already know

## Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Database**: SQLite (development) with Aurora (production)
- **AI**: AWS Bedrock (Claude Sonnet 3.5) for adaptive questioning and occupation matching
- **Infrastructure**: AWS CDK deploying to Fargate with Application Load Balancer
- **Auto-scaling**: 2-10 tasks based on CPU/Memory utilization

## Available Scripts

### Web Application
From the `web/` directory:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run import-data` - Import CSV data to SQLite database
- `npm run lint` - Run ESLint

### Infrastructure  
From the `infra/` directory:

- `npm run build` - Compile TypeScript
- `cdk synth` - Generate CloudFormation template
- `cdk deploy` - Deploy to AWS
- `cdk destroy` - Remove all AWS resources

## Documentation

- [web/PROJECT_SPEC.md](web/PROJECT_SPEC.md) - Comprehensive project specification
- [web/QUIZ_IMPLEMENTATION.md](web/QUIZ_IMPLEMENTATION.md) - Quiz system details
- [web/BAYESIAN_QUIZ.md](web/BAYESIAN_QUIZ.md) - Bayesian engine documentation
- [infra/DEPLOYMENT.md](infra/DEPLOYMENT.md) - AWS deployment guide
- [infra/SETUP_SUMMARY.md](infra/SETUP_SUMMARY.md) - Infrastructure overview

## Data Source

All occupation and skills data comes from the [ESCO Portal](https://esco.ec.europa.eu/) via [Tabiya Open Taxonomy](https://tabiya.tech/). ESCO provides a standardized, multilingual classification system used across Europe for education, training, and employment.

## Development Notes

### Unused Code Analysis

Several documentation markdown files exist in `web/` describing feature evolution:
- `BAYESIAN_*.md` - Bayesian quiz system documentation
- `LLM_OCCUPATION_MATCHING.md` - LLM matching approach
- `SKILL_MAPPING_FIX.md` - Historical fix documentation

These are kept for reference but can be removed if not needed.

### Code Organization

Key refactorings completed:
- **Quiz Results Service** ([web/lib/quiz-results-service.ts](web/lib/quiz-results-service.ts)) - Centralized results generation with clean API for easy swapping between local and remote computation
- All quiz logic uses the Bayesian engine with clear separation of concerns

## Contributing

This project was built for the Kings Trust. For detailed specifications, see [web/PROJECT_SPEC.md](web/PROJECT_SPEC.md).

## License

Data from ESCO is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

---

**Built with ❤️ for the Kings Trust** - Empowering young people to discover their potential through skills-first career exploration.
