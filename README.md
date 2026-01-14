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

3. Start the development server:
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

## Data Source

All occupation and skills data comes from the [ESCO Portal](https://esco.ec.europa.eu/) via [Tabiya Open Taxonomy](https://tabiya.tech/). ESCO provides a standardized, multilingual classification system used across Europe for education, training, and employment.

## Quiz System

The adaptive quiz is the core feature of this platform, using advanced Bayesian inference and AI to efficiently identify user skills through intelligent questioning.

### Two-Stage Architecture

**Stage 1: Broad Orientation (4-5 questions)**
- Quickly clusters users based on fundamental preferences
- Questions cover: work preferences (people/things/information), work style (structured/variety), environment (indoor/outdoor), collaboration style (team/solo), and work pace (fast/steady)
- Each answer updates probability distributions across 8 predefined user clusters:
  - People Helper
  - Creative Maker
  - Tech Problem Solver
  - Action Outdoor
  - Organizer & Coordinator
  - Entrepreneur & Persuader
  - Care & Support Specialist
  - Analyst & Researcher

**Stage 2: Adaptive Skill Confirmation (8-15 questions)**
- Uses **information gain maximization** to select the most informative questions
- Calculates Shannon entropy to measure uncertainty and selects questions that reduce it most effectively
- Questions are dynamically chosen from a bank of 100+ skill-specific questions
- Mix of question types:
  - **Scale questions** (1-5 ratings) for proficiency self-assessment
  - **Scenario questions** for behavioral evaluation
  - **AI-generated questions** (max 3 per quiz) using AWS Bedrock for contextual follow-ups
- Stops when uncertainty is low enough OR maximum questions reached

### Bayesian Inference Engine

The quiz uses **Bayes' theorem** to continuously update beliefs about user skills:

```
P(skill|answer) ∝ P(answer|skill) × P(skill)
```

- Each question has pre-tuned likelihoods for how different clusters would answer
- As users answer, posterior probabilities are calculated and normalized
- The system tracks probability distributions over clusters, skills, and occupations
- **Entropy** measures uncertainty: lower entropy = more confident predictions

### AI-Powered Adaptation

Integrates AWS Bedrock (Claude Sonnet) for enhanced adaptability:
- **Generates contextual scenario questions** based on user's profile and uncertain skills
- **Analyzes free-text responses** to identify skills beyond predefined options
- **Adapts difficulty** based on user's age, location, and previous responses
- Injects AI questions strategically (at questions 3, 7, and 11) for variety

### Real-Time Matching

As users answer questions:
1. **Cluster probabilities** update after each response
2. **Skill probabilities** are inferred from cluster distributions and direct evidence
3. **Occupation matches** are calculated by comparing user's skills to ESCO occupation requirements
4. **Top matches** are continuously refined throughout the quiz

### Technical Implementation

- **Database**: Stores quiz sessions, responses, and identified skills (SQLite dev / Aurora production)
- **State Management**: Maintains Bayesian state across API calls
- **Question Selection**: `adaptive-quiz-controller.ts` orchestrates the flow
- **Bayesian Core**: `bayesian-quiz-engine.ts` handles all probability calculations
- **AI Integration**: `ai-adaptive-questions.ts` manages Bedrock interactions

The result is a quiz that feels natural and conversational while being mathematically optimal for discovering skills in the shortest time possible.


## License

Data from ESCO is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

---

**Built with ❤️ for the Kings Trust** - Empowering young people to discover their potential through skills-first career exploration.
