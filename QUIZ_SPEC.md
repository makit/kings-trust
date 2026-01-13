# Skills Assessment Quiz - Technical Specification

## Overview

An intelligent, adaptive skills assessment quiz designed for **young people** (16-25 years old) supported by The King's Trust. The quiz uses AI to identify skills, build confidence, and recommend realistic career pathways - even for those with limited work experience. Powered by AWS services including Amazon Bedrock for AI capabilities.

### King's Trust Context

This tool is specifically designed for:
- Young people exploring career options
- School leavers unsure of their strengths
- Those with non-traditional experience (volunteering, hobbies, life skills)
- Young adults facing barriers to employment
- First-time job seekers building their profile

The quiz recognizes that skills come from many places: school projects, volunteering, sports, gaming, family responsibilities, and personal interests - not just formal work experience.

## Architecture

### AWS Services Stack

#### 1. **Amazon Bedrock** (Core AI Engine)
- **Claude 3.5 Sonnet v2** - Primary model for:
  - Dynamic question generation based on user responses
  - Natural language processing of free-text answers
  - Skill inference from conversation
  - Personalized occupation recommendations
  - Explanation generation for results
  - Youth-friendly language and encouragement

- **Titan Embeddings** - For:
  - Semantic similarity matching between user responses and skills
  - Finding related skills and occupations
  - Contextual understanding of job descriptions

#### 2. **Amazon DynamoDB**
- **QuizSessions** table - Store user quiz progress
- **UserProfiles** table - Store identified skills and preferences
- **QuizQuestions** table - Question bank and metadata
- **QuizResponses** table - User answers and timestamps

#### 3. **AWS Lambda**
- Quiz orchestration and business logic
- Bedrock API integration
- Real-time skill scoring
- Occupation matching algorithms

#### 4. **Amazon S3**
- Store generated quiz reports (PDF)
- Cache frequently accessed data
- Quiz analytics data

#### 5. **Amazon API Gateway**
- RESTful API endpoints for Next.js frontend
- WebSocket support for real-time quiz updates
- Request throttling and authentication

#### 6. **AWS Cognito** (Optional - Future)
- User authentication
- Save quiz history
- Multi-device quiz resume

---

## Quiz Flow

### Phase 1: Getting to Know You (5 questions)
**Goal**: Build rapport and understand the young person's context

1. **Current Situation**
   - "What are you up to right now?"
   - Options: 
     - In school/college
     - Just finished school/college
     - Looking for my first job
     - Between jobs
     - Working part-time
     - Volunteering
     - Taking a break/figuring things out
     - Other

2. **Experience Beyond Work**
   - "Tell us about your experiences (work, volunteering, hobbies, or anything else!)"
   - Free text with prompts: "Don't worry if you haven't had a 'proper job' yet - we want to hear about ALL your experiences: babysitting, sports teams, helping family, gaming, school projects, anything!"

3. **What Interests You?**
   - "What kind of work sounds interesting to you?" (Multi-select)
   - Youth-friendly categories:
     - Working with people (retail, care, teaching)
     - Creative stuff (design, media, music, art)
     - Tech and digital (coding, gaming, social media)
     - Hands-on work (building, fixing, creating)
     - Outdoor work (environment, sports, animals)
     - Helping others (healthcare, social work, support)
     - Business and office work
     - Not sure yet - show me options!

4. **Your Strengths**
   - "What are you naturally good at or what do people say you're good at?"
   - Prompts with examples: "Like... being organized? Good with people? Problem-solving? Creative? Good listener?"

5. **Your Goal**
   - "What would make this quiz useful for you?"
   - Options:
     - Help me figure out what jobs might suit me
     - Show me what skills I actually have
     - Give me ideas for my next steps
     - Help me with my CV/applications
     - Just exploring and learning

### Phase 2: Discovering Your Skills (10-15 questions)
**Goal**: Use Bedrock to identify skills from real-life experiences

#### Question Types

##### A. Experience-Based Questions
```
"Have you ever...?" (Yes/Definitely/Not Sure/No)
- Organized an event or activity?
- Helped someone learn something new?
- Fixed a technical problem?
- Created content (videos, art, posts, etc.)?
- Worked as part of a team?
- Managed your own money or budget?
- Dealt with a difficult situation calmly?
```

##### B. Real-Life Scenario Questions (Bedrock Generated)
```
Amazon Bedrock generates relatable scenarios based on:
- User's age and experience level
- Their interests
- Youth-relevant contexts

Example:
"Imagine you're organizing a charity fundraiser with your mates. You've got 
two weeks, a £50 budget, and everyone has different ideas. What would you do first?"

User provides free-text response → Bedrock analyzes → Infers skills like:
- Event planning
- Budget management
- Team coordination
- Leadership
- Communication

The AI looks for skills demonstrated in everyday contexts:
- Gaming (strategy, teamwork, problem-solving)
- Social media (content creation, communication, digital literacy)
- Sports (teamwork, discipline, goal-setting)
- Family care (responsibility, patience, time management)
- School projects (research, presentation, collaboration)
```

##### C. "What Would You Do?" Questions
```
Present common workplace/life challenges in accessible language:

"A customer is upset because their order is wrong. You're working the till. 
What do you do?"

Options that reveal different skills:
□ Listen to them and apologize (Communication, empathy)
□ Get my manager immediately (Following procedures)
□ Offer to fix it right away (Problem-solving, initiative)
□ Stay calm and ask what would help (Conflict resolution)

Multiple selections allowed - shows nuanced approach
```

##### D. Skills from Interests
```
"What do you spend your free time doing?" (Multi-select)

Then drill down:
- Gaming → "What kind of games?" → Infer strategic thinking, coordination, etc.
- Social media → "What do you do?" → Content creation, communication
- Sports → "What role?" → Teamwork, leadership, discipline
- Music/Art → Project completion, creativity, practice
```

#### Adaptive Logic Flow

```javascript
// Pseudocode for adaptive question selection
const selectNextQuestion = async (sessionId) => {
  const session = await getQuizSession(sessionId);
  const identifiedSkills = session.identifiedSkills;
  const uncertainSkills = session.uncertainSkills;
  
  // Use Bedrock to analyze response patterns
  const analysis = await bedrockAnalyze({
    prompt: `Based on the user's responses so far, they appear to have:
      - Strong skills in: ${identifiedSkills.join(', ')}
      - Potential skills to explore: ${uncertainSkills.join(', ')}
      
      Generate the next question to better understand their capabilities in:
      ${uncertainSkills[0]} or related skills.
      
      Format: JSON with question text, type, and options.`
  });
  
  return analysis.nextQuestion;
};
```

### Phase 3: Skill Validation (5-8 questions)
**Goal**: Confirm high-confidence skills and explore edge cases

- Focus on skills with medium confidence scores (60-80%)
- Use Bedrock to generate specific validation questions
- Cross-reference skills using skill-to-skill relations from database

### Phase 4: Results & Recommendations

---

## Data Models

### QuizSession
```typescript
interface QuizSession {
  sessionId: string;                    // UUID
  userId?: string;                      // If authenticated
  status: 'in-progress' | 'completed' | 'abandoned';
  
  // Onboarding responses
  currentRole: string;
  experienceYears: number;
  industryInterests: string[];
  workStylePreference: string;
  primaryGoal: string;
  
  // Progress tracking
  currentPhase: 1 | 2 | 3 | 4;
  questionsAnswered: number;
  totalQuestions: number;
  
  // Identified skills with confidence scores
  identifiedSkills: IdentifiedSkill[];
  
  // Skills to explore further
  uncertainSkills: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  
  // Save/Resume support
  lastQuestionId: string;
  canResume: boolean;
}

interface IdentifiedSkill {
  skillId: string;
  skillLabel: string;
  confidence: number;              // 0-100
  evidence: QuestionResponse[];     // Which responses led to this
  source: 'direct' | 'inferred' | 'validated';
  relatedSkills?: string[];        // From skill_skill_relations
}

interface QuestionResponse {
  questionId: string;
  questionText: string;
  questionType: string;
  userResponse: string | string[] | number;
  responseTime: number;            // Milliseconds
  skillsInferred: string[];
  timestamp: string;
}
```

### Quiz Question (Bedrock Generated + Static)
```typescript
interface QuizQuestion {
  questionId: string;
  phase: 1 | 2 | 3;
  type: 'multiple-choice' | 'multi-select' | 'scenario' | 'scale' | 'free-text';
  
  // Question content
  text: string;
  description?: string;
  options?: QuestionOption[];
  
  // Skill mappings
  targetSkills: SkillMapping[];
  
  // Dynamic generation metadata
  isGenerated: boolean;
  generatedBy?: 'bedrock' | 'static';
  generationPrompt?: string;
  
  // Adaptive logic
  prerequisiteResponses?: string[];  // Show only if user answered X
  skipConditions?: SkipCondition[];
  
  // Metadata
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;            // Seconds
}

interface SkillMapping {
  skillId: string;
  confidence: number;               // How strongly this answer indicates the skill
  condition?: string;               // Which response(s) trigger this mapping
  reasoning?: string;               // Why this maps to the skill
}

interface QuestionOption {
  value: string;
  label: string;
  skillImplications: SkillMapping[];
}
```

### Quiz Result
```typescript
interface QuizResult {
  sessionId: string;
  userId?: string;
  
  // Skills Profile
  identifiedSkills: IdentifiedSkillResult[];
  skillsByCategory: {
    transversal: IdentifiedSkillResult[];
    knowledge: IdentifiedSkillResult[];
    competence: IdentifiedSkillResult[];
    language: IdentifiedSkillResult[];
    attitude: IdentifiedSkillResult[];
  };
  
  // Occupation Matches
  topOccupations: OccupationMatch[];
  careerPaths: CareerPath[];
  
  // Recommendations
  recommendedSkills: RecommendedSkill[];  // Skills to learn
  learningPaths: LearningPath[];
  
  // AI-Generated Insights (from Bedrock)
  personalizedSummary: string;
  strengthsAnalysis: string;
  growthAreas: string;
  careerAdvice: string;
  
  // Metadata
  generatedAt: string;
  processingTime: number;
}

interface IdentifiedSkillResult extends IdentifiedSkill {
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience?: number;
  lastUsed?: string;
}

interface CareerPath {
  title: string;
  occupations: string[];            // Progression path
  timeframe: string;
  requiredSkills: string[];
  skillGap: number;                 // 0-100
  reasoning: string;                // Bedrock-generated explanation
}

interface RecommendedSkill {
  skillId: string;
  skillLabel: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  occupationsUnlocked: string[];    // How learning this helps
  estimatedLearningTime: string;
}
```

---

## API Design

### REST Endpoints

#### 1. Start Quiz
```http
POST /api/quiz/start
Response: {
  sessionId: string;
  firstQuestion: QuizQuestion;
  estimatedTime: number;
}
```

#### 2. Submit Answer
```http
POST /api/quiz/answer
Body: {
  sessionId: string;
  questionId: string;
  response: any;
  responseTime: number;
}
Response: {
  nextQuestion?: QuizQuestion;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  skillsIdentified: IdentifiedSkill[];
  isComplete: boolean;
}
```

#### 3. Get Results
```http
GET /api/quiz/results/:sessionId
Response: QuizResult
```

#### 4. Save Progress
```http
POST /api/quiz/save
Body: {
  sessionId: string;
}
Response: {
  saved: boolean;
  resumeToken: string;
}
```

#### 5. Resume Quiz
```http
POST /api/quiz/resume
Body: {
  resumeToken: string;
}
Response: {
  session: QuizSession;
  nextQuestion: QuizQuestion;
}
```

#### 6. Export Results
```http
GET /api/quiz/export/:sessionId?format=pdf|json
Response: File download or JSON
```

---

## Amazon Bedrock Integration

### Use Case 1: Dynamic Question Generation

```typescript
// Lambda function
export async function generateAdaptiveQuestion(
  session: QuizSession,
  targetSkill: string
): Promise<QuizQuestion> {
  
  const skill = await getSkillById(targetSkill);
  const relatedSkills = await getRelatedSkills(targetSkill);
  
  const prompt = `You are a career assessment expert. Generate a realistic 
scenario-based question to assess someone's proficiency in "${skill.preferredLabel}".

Context:
- User's background: ${session.currentRole}, ${session.experienceYears} years experience
- Industries of interest: ${session.industryInterests.join(', ')}
- Related skills we're testing: ${relatedSkills.map(s => s.preferredLabel).join(', ')}

Requirements:
1. Create a realistic work scenario that requires this skill
2. The scenario should be relevant to their industry interests
3. Ask how they would handle the situation
4. The question should allow for free-text response
5. Include 3-4 example approaches as guidance (optional for user)

Return JSON format:
{
  "questionText": "...",
  "scenarioContext": "...",
  "suggestedApproaches": ["...", "...", "..."],
  "skillIndicators": {
    "strong": ["keywords or behaviors indicating strong skill"],
    "moderate": ["keywords or behaviors indicating moderate skill"],
    "developing": ["keywords or behaviors indicating developing skill"]
  }
}`;

  const response = await bedrockClient.send(new InvokeModelCommand({
    modelId: 'us.anthropic.claude-sonnet-4-0-v1:0',  // Claude Sonnet 4
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  }));
  
  const result = JSON.parse(new TextDecoder().decode(response.body));
  
  return {
    questionId: generateId(),
    phase: 2,
    type: 'scenario',
    text: result.content[0].text.questionText,
    description: result.content[0].text.scenarioContext,
    targetSkills: [{
      skillId: targetSkill,
      confidence: 0.8,
      reasoning: 'Direct scenario assessment'
    }],
    isGenerated: true,
    generatedBy: 'bedrock',
    difficulty: 'intermediate',
    estimatedTime: 120
  };
}
```

### Use Case 2: Free-Text Response Analysis

```typescript
export async function analyzeScenarioResponse(
  question: QuizQuestion,
  userResponse: string,
  session: QuizSession
): Promise<IdentifiedSkill[]> {
  
  const targetSkills = await getSkillsByIds(
    question.targetSkills.map(t => t.skillId)
  );
  
  const prompt = `Analyze this user's response to a scenario question and identify 
which skills they demonstrate.

Scenario: ${question.text}

User's Response:
"${userResponse}"

Target Skills to Assess:
${targetSkills.map(s => `- ${s.preferredLabel}: ${s.description}`).join('\n')}

Related Skills in Database:
${await getRelatedSkillDescriptions(question.targetSkills)}

Task:
1. Identify which skills the user demonstrates in their response
2. Rate their proficiency level for each skill (0-100)
3. Explain your reasoning
4. Identify any additional skills not in the target list

Return JSON:
{
  "identifiedSkills": [
    {
      "skillId": "skill_123",
      "skillLabel": "Problem Solving",
      "confidence": 85,
      "proficiencyLevel": "advanced",
      "evidence": "User described systematic approach...",
      "keyPhrases": ["analyzed root cause", "prioritized solutions"]
    }
  ],
  "additionalSkills": [
    {
      "skillLabel": "Team Communication",
      "confidence": 70,
      "reasoning": "User mentioned coordinating with team members"
    }
  ],
  "overallAssessment": "Brief summary of user's approach and strengths"
}`;

  const response = await bedrockClient.send(new InvokeModelCommand({
    modelId: 'us.anthropic.claude-sonnet-4-0-v1:0',  // Claude Sonnet 4
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  }));
  
  const analysis = JSON.parse(new TextDecoder().decode(response.body));
  
  // Map to IdentifiedSkill format
  return analysis.content[0].text.identifiedSkills.map(skill => ({
    skillId: skill.skillId,
    skillLabel: skill.skillLabel,
    confidence: skill.confidence,
    evidence: [{
      questionId: question.questionId,
      questionText: question.text,
      userResponse: userResponse,
      skillsInferred: [skill.skillId],
      timestamp: new Date().toISOString()
    }],
    source: 'inferred',
    relatedSkills: []
  }));
}
```

### Use Case 3: Personalized Results Generation

```typescript
export async function generatePersonalizedInsights(
  result: QuizResult,
  session: QuizSession
): Promise<PersonalizedInsights> {
  
  const prompt = `You are a career counselor providing personalized insights to 
someone who completed a skills assessment.

User Profile:
- Current situation: ${session.currentRole}
- Experience: ${session.experienceYears} years
- Goal: ${session.primaryGoal}
- Industry interests: ${session.industryInterests.join(', ')}

Identified Skills:
${result.identifiedSkills.map(s => 
  `- ${s.skillLabel} (${s.confidence}% confidence, ${s.proficiencyLevel} level)`
).join('\n')}

Top Occupation Matches:
${result.topOccupations.slice(0, 5).map(o => 
  `- ${o.occupation.preferredLabel} (${o.matchScore}% match)`
).join('\n')}

Task: Generate a comprehensive, encouraging, and actionable career report with:

1. Executive Summary (2-3 sentences about their skill profile)
2. Key Strengths (3-5 bullet points highlighting top skills)
3. Growth Opportunities (3-4 skills they should develop and why)
4. Career Recommendations (Specific guidance on next steps)
5. Learning Path (Suggested order for skill development)

Tone: Professional, encouraging, specific, and actionable.
Return as JSON with these sections.`;

  const response = await bedrockClient.send(new InvokeModelCommand({
    modelId: 'us.anthropic.claude-sonnet-4-0-v1:0',  // Claude Sonnet 4
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  }));
  
  return JSON.parse(new TextDecoder().decode(response.body)).content[0].text;
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up AWS infrastructure (Lambda, DynamoDB, API Gateway)
- [ ] Configure Amazon Bedrock access and test Claude integration
- [ ] Create DynamoDB tables and indexes
- [ ] Build basic quiz session management
- [ ] Create static question bank (20-30 questions)

### Phase 2: Core Quiz Flow (Week 2-3)
- [ ] Implement onboarding phase (5 questions)
- [ ] Build quiz orchestration Lambda functions
- [ ] Create answer submission and validation
- [ ] Implement basic skill inference logic
- [ ] Add progress tracking and save/resume

### Phase 3: AI Integration (Week 3-4)
- [ ] Integrate Bedrock for scenario generation
- [ ] Implement free-text response analysis
- [ ] Build adaptive question selection algorithm
- [ ] Add confidence scoring and skill validation
- [ ] Test AI-generated questions quality

### Phase 4: Results & Recommendations (Week 4-5)
- [ ] Build occupation matching integration
- [ ] Implement results calculation
- [ ] Generate personalized insights with Bedrock
- [ ] Create skill gap analysis
- [ ] Build career path recommendations

### Phase 5: Frontend (Week 5-6)
- [ ] Quiz UI components (QuizQuestion, Progress, etc.)
- [ ] Results display page
- [ ] Skills profile visualization
- [ ] Occupation recommendations UI
- [ ] Export to PDF functionality

### Phase 6: Polish & Testing (Week 6-7)
- [ ] User testing and feedback
- [ ] Performance optimization
- [ ] Error handling and edge cases
- [ ] Analytics and tracking
- [ ] Documentation

---

## Frontend Components (Next.js)

### Quiz Pages Structure
```
app/quiz/
  ├── page.tsx                 # Quiz landing/start page
  ├── [sessionId]/
  │   ├── page.tsx            # Active quiz interface
  │   └── results/
  │       └── page.tsx        # Results page
  └── resume/
      └── page.tsx            # Resume saved quiz

components/quiz/
  ├── QuizOnboarding.tsx      # Phase 1 questions
  ├── QuizQuestion.tsx        # Dynamic question renderer
  ├── QuestionTypes/
  │   ├── MultipleChoice.tsx
  │   ├── MultiSelect.tsx
  │   ├── ScenarioQuestion.tsx
  │   ├── ScaleQuestion.tsx
  │   └── FreeText.tsx
  ├── QuizProgress.tsx        # Progress bar and stats
  ├── QuizResults.tsx         # Results container
  ├── SkillsProfile.tsx       # Visual skill breakdown
  ├── OccupationRecommendations.tsx
  ├── CareerPathways.tsx
  ├── SkillGapAnalysis.tsx
  └── ExportResults.tsx
```

### Key UI/UX Features

1. **Real-time Progress Indicators**
   - Visual progress bar with phase indicators
   - Estimated time remaining
   - Questions completed count
   - Skill confidence meters filling as quiz progresses

2. **Engaging Question UI**
   - Smooth transitions between questions
   - Loading states for AI-generated questions
   - Support for rich media (images for scenario questions)
   - Response validation and hints

3. **Interactive Results**
   - Animated skill radar charts
   - Interactive occupation cards with drill-down
   - Collapsible sections for detailed analysis
   - Share buttons for social media

4. **Mobile-First Design**
   - Touch-optimized controls
   - Swipe navigation between questions
   - Responsive layouts for all screen sizes
   - Save and resume from any device

---

## Cost Estimation (AWS)

### Monthly Costs (assuming 10,000 quiz completions/month)

1. **Amazon Bedrock**
   - Claude 3.5 Sonnet: ~5 questions/quiz × 1000 tokens/request
   - 50,000 requests × $0.003/1K tokens = $150
   - Response generation: 50,000 × $0.015/1K tokens = $750
   - **Total: ~$900/month**

2. **DynamoDB**
   - On-demand pricing for quiz sessions
   - ~500 writes/quiz, 100 reads/quiz
   - **Total: ~$100/month**

3. **Lambda**
   - ~20 invocations/quiz × 10,000 = 200K invocations
   - **Total: ~$10/month (within free tier initially)**

4. **API Gateway**
   - REST API calls: ~$3.50 per million
   - **Total: ~$7/month**

5. **S3**
   - PDF storage and retrieval
   - **Total: ~$5/month**

**Estimated Total: ~$1,020/month** at scale
*(Much lower with AWS Free Tier initially)*

---

## Security & Privacy

1. **Data Handling**
   - No PII collection unless user opts in
   - Anonymous quiz sessions by default
   - Encrypted data at rest (DynamoDB encryption)
   - TLS for all API calls

2. **Bedrock Safety**
   - Prompt injection protection
   - Content filtering on responses
   - Rate limiting per session
   - Output validation before display

3. **Session Management**
   - Short-lived session tokens
   - Automatic cleanup of abandoned sessions (7 days)
   - Optional user authentication with Cognito

---

## Success Metrics

1. **Engagement**
   - Quiz completion rate (target: >60%)
   - Average time to complete (target: 15-20 min)
   - Resume rate for saved quizzes (target: >40%)

2. **Quality**
   - User satisfaction rating (target: >4.2/5)
   - Occupation match accuracy (user feedback)
   - AI-generated question quality scores

3. **Technical**
   - API response time (target: <2s)
   - Bedrock success rate (target: >99%)
   - Error rate (target: <0.5%)

---

## Future Enhancements (V2)

1. **Multi-language Support**
   - Leverage Bedrock for translation
   - Support all ESCO language variations

2. **Video Interview Mode**
   - Record video responses
   - Use AWS Transcribe + Bedrock for analysis
   - Assess soft skills from body language

3. **Collaborative Assessments**
   - Peer skill validation
   - Manager/colleague endorsements
   - 360-degree skill feedback

4. **Learning Integration**
   - Direct links to courses for skill gaps
   - Track learning progress
   - Re-assessment after training

5. **Job Matching**
   - Direct integration with job boards
   - Real-time job recommendations
   - Application assistance with AI

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Status**: Specification - Ready for Implementation
