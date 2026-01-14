# ESCO Skills & Occupations Platform - Specification

## Project Overview

A Next.js web application that helps users discover career opportunities based on their skills using the ESCO (European Skills, Competences, Qualifications and Occupations) taxonomy data. The platform provides skill exploration, occupation matching, and an interactive skills assessment quiz.

## Core Features

### 1. Data Browser & Explorer

#### 1.1 Skills Browser
- **Browse All Skills**: Paginated list of all skills with search and filtering
- **Filters:**
  - Skill Type: `skill/competence`, `knowledge`, `language`, `attitude`
  - Reuse Level: `sector-specific`, `occupation-specific`, `cross-sector`, `transversal`
  - Skill Groups: Filter by ESCO skill group categories
- **Search**: Full-text search across skill labels, descriptions, and definitions
- **Skill Detail View:**
  - Display full skill information (label, description, definition, scope note)
  - Show related skills (essential/optional relations)
  - List occupations that require this skill (essential vs optional)
  - Display skill hierarchy (parent groups and child skills)
  - Alternative labels

#### 1.2 Occupations Browser
- **Browse All Occupations**: Paginated list with search and filtering
- **Filters:**
  - ISCO Group: Filter by 4-digit ISCO classification codes
  - Occupation Type: ESCO occupation vs Local occupation
  - Localized: Show only localized occupations
- **Search**: Full-text search across occupation labels and descriptions
- **Occupation Detail View:**
  - Complete occupation information
  - Required skills breakdown:
    - Essential skills (must-have)
    - Optional skills (nice-to-have)
  - ISCO group classification
  - Related occupations in hierarchy
  - Regulated profession notes (if applicable)

#### 1.3 ISCO Groups Browser
- **Browse ISCO Classification**: Hierarchical view of ISCO groups
- **Group Detail View:**
  - All occupations in this group
  - Group code and description
  - Hierarchy navigation (parent/child groups)

### 2. Skills-to-Occupation Matcher

#### 2.1 Skill Input Interface
- **Multi-Select Skill Picker:**
  - Autocomplete search for skills
  - Selected skills displayed as tags/chips
  - Ability to add/remove skills dynamically
  - Group similar skills together
  - Show skill count (e.g., "5 skills selected")

#### 2.2 Occupation Matching Algorithm
- **Match Scoring System:**
  - Calculate match percentage for each occupation based on:
    - Essential skills matched (higher weight: 70%)
    - Optional skills matched (lower weight: 30%)
  - Formula: `(essential_matched / total_essential * 0.7) + (optional_matched / total_optional * 0.3)`
- **Results Display:**
  - Sorted list of occupations by match percentage
  - Show match score (e.g., "85% match")
  - Highlight which skills match (with badges for essential/optional)
  - Show missing essential skills (gap analysis)
  - Show which additional optional skills would improve match

#### 2.3 Results Filtering & Sorting
- **Sort Options:**
  - Best match (default)
  - Most essential skills matched
  - Fewest missing essential skills
  - Alphabetical
- **Filters:**
  - Minimum match threshold (e.g., >50%, >75%)
  - Only show occupations where all essential skills are met
  - ISCO group filter
  - Occupation type

### 3. Skills Assessment Quiz

#### 3.1 Quiz Structure
- **Multi-stage Assessment:**
  - **Stage 1: General Skills (5-7 questions)**
    - Focus on transversal/cross-sector skills
    - Examples: "Do you have experience with digital tools?", "Are you comfortable communicating in English?"
  - **Stage 2: Skill Areas (8-10 questions)**
    - Categorized by skill groups
    - Examples: "Do you work well with numbers?", "Have you managed projects?"
  - **Stage 3: Specific Skills (10-15 questions)**
    - More granular skill-based questions
    - Adaptive: questions based on previous answers

#### 3.2 Question Types
- **Yes/No Questions:**
  - "Do you have experience with [skill]?"
  - Direct skill presence check
- **Proficiency Level:**
  - Beginner / Intermediate / Advanced / Expert
  - Maps to skill confidence/experience
- **Multiple Choice:**
  - "Which of these activities have you done?"
  - Can select multiple related skills at once
- **Scenario-based:**
  - Describe a situation, user selects what they would do
  - Infers multiple skills from response

#### 3.3 Skill Inference Engine
- **Mapping Questions to Skills:**
  - Each question maps to 1+ skills in database
  - Use skill relations to infer additional skills
  - If user has skill A and skills often come together, suggest checking for related skills
- **Confidence Scoring:**
  - Track certainty level for each inferred skill
  - Essential skills detected directly: 100% confidence
  - Related/inferred skills: 60-80% confidence

#### 3.4 Results & Recommendations
- **Skills Profile:**
  - Display all identified skills
  - Grouped by skill type/category
  - Show confidence level for each
- **Top Occupation Matches:**
  - Run skill-to-occupation matcher with quiz results
  - Show top 10-15 best-fit occupations
  - Explain why each occupation matches
  - Highlight which quiz responses led to these recommendations
- **Career Paths:**
  - Suggest related occupations in same ISCO groups
  - Show occupation progression/hierarchy
  - "People with your skills often pursue..."
- **Skill Gaps:**
  - For interesting occupations with partial matches
  - Show what skills user would need to develop
  - Suggest learning paths

#### 3.5 Quiz Experience
- **Progress Tracking:**
  - Visual progress bar
  - "Question 5 of 20"
  - Estimated time remaining
- **Save & Resume:**
  - Save progress to browser local storage
  - Allow users to return later
  - Option to export results
- **Retake & Adjust:**
  - Allow editing of answers
  - Recalculate matches dynamically
  - Compare results between quiz attempts

### 4. Additional Features

#### 4.1 User Features
- **Favorites/Bookmarks:**
  - Save interesting occupations
  - Save skill profiles
  - Export saved items as PDF/CSV
- **Comparison Tool:**
  - Compare multiple occupations side-by-side
  - See skill requirement differences
  - Identify common skills across occupations
- **Skill Development Paths:**
  - For a target occupation, show skills to acquire
  - Suggest learning sequence (based on skill relations)

#### 4.2 Search & Discovery
- **Global Search:**
  - Search across all entities (skills, occupations, groups)
  - Intelligent suggestions
  - Recent searches
- **Related Items:**
  - "People who viewed this occupation also viewed..."
  - Based on shared skills/ISCO groups
- **Trending/Popular:**
  - Track most-viewed occupations
  - Popular skill combinations

## Technical Architecture

### Database (SQLite)

#### Tables
```
- skill_groups
- skills  
- skill_hierarchy
- skill_skill_relations
- isco_groups
- occupations
- occupation_hierarchy
- occupation_skill_relations
```

#### Key Queries
1. **Get all skills for an occupation** (with relation type)
2. **Get all occupations requiring a skill**
3. **Find occupations matching skill set** (scoring algorithm)
4. **Get skill hierarchy** (recursive)
5. **Get occupation hierarchy** (recursive)
6. **Full-text search** across labels and descriptions

### Frontend (Next.js)

#### Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui or similar component library
- **State Management**: React Context or Zustand (for quiz state)
- **Database Access**: better-sqlite3 (server-side)
- **Search**: Client-side filtering or simple SQL LIKE queries

#### Page Structure
```
/                          → Home/Landing page
/skills                    → Skills browser (list)
/skills/[id]               → Skill detail page
/occupations               → Occupations browser (list)
/occupations/[id]          → Occupation detail page
/isco-groups               → ISCO groups browser
/isco-groups/[code]        → ISCO group detail
/matcher                   → Skills-to-occupation matcher tool
/quiz                      → Skills assessment quiz
/quiz/results              → Quiz results page
/about                     → About ESCO & the platform
```

#### API Routes
```
/api/skills                → List/search skills
/api/skills/[id]           → Get skill details
/api/occupations           → List/search occupations
/api/occupations/[id]      → Get occupation details
/api/occupations/match     → Match skills to occupations (POST)
/api/isco-groups           → List ISCO groups
/api/quiz/questions        → Get quiz questions
/api/quiz/evaluate         → Evaluate quiz answers (POST)
```

### Components Structure

#### Core Components
```
components/
  ├── layout/
  │   ├── Header.tsx
  │   ├── Footer.tsx
  │   └── Navigation.tsx
  ├── skills/
  │   ├── SkillCard.tsx
  │   ├── SkillList.tsx
  │   ├── SkillPicker.tsx           # Multi-select autocomplete
  │   ├── SkillBadge.tsx
  │   └── SkillDetail.tsx
  ├── occupations/
  │   ├── OccupationCard.tsx
  │   ├── OccupationList.tsx
  │   ├── OccupationDetail.tsx
  │   ├── OccupationMatch.tsx       # Match result display
  │   └── SkillRequirements.tsx     # Essential/optional skills
  ├── matcher/
  │   ├── SkillSelector.tsx
  │   ├── MatchResults.tsx
  │   ├── MatchScore.tsx
  │   └── GapAnalysis.tsx
  ├── quiz/
  │   ├── QuizQuestion.tsx
  │   ├── QuestionYesNo.tsx
  │   ├── QuestionMultiChoice.tsx
  │   ├── QuestionProficiency.tsx
  │   ├── QuizProgress.tsx
  │   ├── QuizResults.tsx
  │   └── SkillsProfile.tsx
  ├── shared/
  │   ├── SearchBar.tsx
  │   ├── FilterPanel.tsx
  │   ├── Pagination.tsx
  │   ├── Card.tsx
  │   ├── Badge.tsx
  │   └── LoadingSpinner.tsx
  └── charts/
      ├── MatchChart.tsx            # Visualize match scores
      └── SkillsRadar.tsx           # Skill distribution
```

### Data Models (TypeScript)

```typescript
interface Skill {
  id: string;
  originUri: string;
  uuidHistory: string;
  skillType: 'skill/competence' | 'knowledge' | 'language' | 'attitude' | '';
  reuseLevel: 'sector-specific' | 'occupation-specific' | 'cross-sector' | 'transversal' | '';
  preferredLabel: string;
  altLabels: string[];
  description: string;
  definition: string;
  scopeNote: string;
  createdAt: string;
  updatedAt: string;
}

interface Occupation {
  id: string;
  originUri: string;
  uuidHistory: string;
  iscoGroupCode: string;
  code: string;
  preferredLabel: string;
  altLabels: string[];
  description: string;
  definition: string;
  scopeNote: string;
  regulatedProfessionNote: string;
  occupationType: 'escooccupation' | 'localoccupation';
  isLocalized: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OccupationMatch {
  occupation: Occupation;
  matchScore: number;
  essentialSkillsMatched: Skill[];
  optionalSkillsMatched: Skill[];
  essentialSkillsMissing: Skill[];
  optionalSkillsMissing: Skill[];
  totalEssentialSkills: number;
  totalOptionalSkills: number;
}

interface QuizQuestion {
  id: string;
  stage: number;
  type: 'yes-no' | 'proficiency' | 'multiple-choice' | 'scenario';
  question: string;
  options?: string[];
  skillMappings: SkillMapping[];
}

interface SkillMapping {
  skillId: string;
  confidence: number; // 0-1
  condition?: 'yes' | 'no' | string; // Which answer triggers this skill
}

interface QuizResult {
  identifiedSkills: {
    skill: Skill;
    confidence: number;
    source: string; // Which question(s) led to this
  }[];
  topOccupations: OccupationMatch[];
  skillProfile: {
    transversal: Skill[];
    knowledge: Skill[];
    competence: Skill[];
    language: Skill[];
  };
}
```

## UI/UX Design Principles

### Visual Design
- **Clean & Professional**: Modern, accessible interface
- **Data Visualization**: Charts for match scores, skill distributions
- **Card-based Layout**: Easy scanning of skills/occupations
- **Color Coding:**
  - Essential skills: Red/Orange
  - Optional skills: Blue
  - Match scores: Green gradient (low to high)
  - Skill types: Different colors per type

### User Experience
- **Progressive Disclosure**: Don't overwhelm with all data at once
- **Helpful Tooltips**: Explain ESCO terminology
- **Quick Actions**: "Add to comparison", "View details", "Start quiz"
- **Responsive**: Mobile-friendly design
- **Accessibility**: WCAG 2.1 AA compliance
  - Keyboard navigation
  - Screen reader support
  - Proper ARIA labels
  - Sufficient color contrast

### Performance
- **Pagination**: Load 20-50 items at a time
- **Lazy Loading**: Images and detailed data
- **Debounced Search**: Wait for user to finish typing
- **Cached Results**: Use React Query or SWR for data fetching
- **Optimistic UI**: Immediate feedback for interactions

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- ✅ Import CSV data into SQLite
- Set up Next.js project
- Create database utility functions
- Build basic layout and navigation
- Implement search functionality

### Phase 2: Data Browsers (Week 2-3)
- Skills browser with filters
- Occupations browser with filters
- ISCO groups browser
- Detail pages for all entities
- Pagination and search

### Phase 3: Skills Matcher (Week 3-4)
- Skill picker component
- Matching algorithm implementation
- Results page with scoring
- Gap analysis
- Filtering and sorting results

### Phase 4: Quiz System (Week 4-6)
- Question database/configuration
- Quiz flow implementation
- Skill inference engine
- Results page
- Save/resume functionality

### Phase 5: Polish & Enhancement (Week 6-7)
- Favorites/bookmarks
- Comparison tool
- Data visualizations
- Performance optimization
- Accessibility audit
- Documentation

### Phase 6: Testing & Deployment (Week 7-8)
- User testing
- Bug fixes
- SEO optimization
- Deployment setup
- Analytics integration

## Future Enhancements

### V2 Features
- **User Accounts**: Save profiles, quiz history
- **Learning Resources**: Link to courses for skill development
- **Job Listings Integration**: Connect to real job postings
- **AI-Powered Recommendations**: ML model for better matching
- **Multi-language Support**: Leverage ESCO's multilingual nature
- **Career Path Visualization**: Interactive graphs showing progression
- **Skills Endorsement**: Social proof from others
- **Export Options**: PDF resume, LinkedIn profile
- **API for Third Parties**: Allow other apps to use the matcher

### Technical Improvements
- **Elasticsearch**: Better full-text search
- **PostgreSQL**: Migrate from SQLite for production
- **GraphQL**: More flexible API queries
- **Server-Side Rendering**: Improve SEO and initial load
- **PWA**: Offline functionality
- **Real-time Updates**: WebSocket for live recommendations

## Success Metrics

### User Engagement
- Time spent on platform
- Quiz completion rate
- Number of occupations explored
- Return visitor rate

### Feature Usage
- Matcher tool usage
- Skills selected per session
- Quiz retake rate
- Favorites/bookmarks created

### Business Value
- Successful job matches (if tracked)
- User satisfaction (surveys)
- Platform adoption rate
- Educational outcomes

## Resources & References

- [ESCO Portal](https://esco.ec.europa.eu/)
- [Tabiya Open Taxonomy](https://tabiya.tech/)
- ESCO API Documentation
- ISCO-08 Classification Structure

---

## Getting Started (Development)

### Prerequisites
```bash
Node.js 18+
npm or pnpm
```

### Installation
```bash
# Install dependencies
npm install

# Import CSV data to SQLite
npm run import-data

# Start development server
npm run dev
```

### Database Location
The SQLite database will be created at: `./esco.db`

### Environment Variables
```env
DATABASE_PATH=./esco.db
NODE_ENV=development
```

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Status**: Specification / Pre-Implementation
