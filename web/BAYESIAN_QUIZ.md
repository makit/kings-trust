# Bayesian Adaptive Quiz System

## Overview

The quiz has been upgraded to a **two-stage Bayesian adaptive system** that provides the feeling of "it gets me" while efficiently narrowing down user characteristics through information theory.

## How It Works

### Stage 1: Broad Orientation (4-5 questions)

Quick questions that place users into broad clusters based on:
- **Preferences**: People vs Things vs Information
- **Work Style**: Structure vs Variety
- **Environment**: Indoor vs Outdoor
- **Collaboration**: Teamwork vs Solo
- **Pace**: Detail/Patient vs Speed/Action

Each answer updates a probability distribution over 8 pre-defined user clusters:
1. **People Helper** - Works with people, helping others
2. **Creative Maker** - Hands-on, creative, variety
3. **Tech Problem Solver** - Analytical, tech-oriented
4. **Action Outdoor** - Physical, outdoor, fast-paced
5. **Organizer & Coordinator** - Detail-oriented, structured
6. **Entrepreneur & Persuader** - Persuasive, variety, fast-paced
7. **Care & Support Specialist** - Empathetic, patient-focused
8. **Analyst & Researcher** - Information-focused, deep analysis

### Stage 2: Adaptive Skill Confirmation (8-15 questions)

Uses **information gain** to select questions that most efficiently reduce uncertainty about:
- User's top clusters
- Relevant skills
- Candidate occupations (top 10-30 based on clusters)

The system:
1. Maintains probability distributions over clusters, skills, and occupations
2. Each answer updates distributions using Bayes' theorem
3. Calculates **expected information gain** for each potential question
4. Selects the question that maximizes information gain
5. Stops when:
   - Entropy is below target threshold (high confidence)
   - Minimum questions answered (8)
   - Maximum questions reached (15)

## Key Features

### 1. **Efficient Bayesian Narrowing**
- Uses Shannon entropy to measure uncertainty
- Calculates information gain for question selection
- Adaptively selects next question to maximize learning

### 2. **Personalized Experience**
- Questions feel relevant because they target user's cluster
- Progressive difficulty (starts easy, increases based on progress)
- Real-time confidence feedback

### 3. **Smart Question Bank**
- 5 carefully calibrated Stage 1 questions with cluster likelihoods
- 25+ Stage 2 questions covering different skill domains
- Questions tagged with:
  - Target clusters they help distinguish
  - Skills they validate
  - Difficulty level (1-3)

### 4. **Probability-Based Scoring**
- Each question option has likelihoods for each cluster
- Example: Answering "I love talking with people" → 90% likelihood for "People Helper" cluster
- Updates maintained across all clusters simultaneously

## Implementation

### Core Files

```
lib/
├── bayesian-quiz-engine.ts           # Core Bayesian inference engine
├── quiz-stage1-questions.ts          # Stage 1 orientation questions
├── quiz-stage2-questions.ts          # Stage 2 adaptive question bank
├── adaptive-quiz-controller.ts       # Quiz orchestration logic
└── quiz-db.ts                        # Database functions (updated)

app/api/quiz/
├── start/route.ts                    # Initialize Bayesian quiz
└── answer/route.ts                   # Process answers with adaptive logic
```

### Database Schema Updates

New fields in `quiz_sessions`:
- `quiz_stage` (1 or 2)
- `stage1_complete` (boolean)
- `bayesian_state` (JSON of full state)
- `cluster_probabilities` (JSON of current distribution)
- `questions_asked` (array of question IDs)

Run migration:
```bash
node scripts/migrate-bayesian-quiz.js
```

### API Changes

#### POST /api/quiz/start
Returns:
```json
{
  "sessionId": "uuid",
  "firstQuestion": { ... },
  "quizInfo": {
    "stage": 1,
    "stageDescription": "Getting to know you",
    "estimatedQuestions": "12-20 questions",
    "estimatedTime": "5-8 minutes"
  }
}
```

#### POST /api/quiz/answer
Request:
```json
{
  "sessionId": "uuid",
  "questionId": "stage1_q1_preference",
  "response": "solving-analyzing",
  "responseTime": 5000
}
```

Response:
```json
{
  "nextQuestion": { ... },
  "progress": {
    "current": 3,
    "estimated": 15,
    "stage": 1,
    "stageTransition": false,
    "message": "Getting to know you...",
    "confidence": 45
  },
  "skillsIdentified": [ ... ],
  "topClusters": [
    {
      "name": "Tech Problem Solver",
      "description": "Analytical, tech-oriented...",
      "probability": 65
    }
  ],
  "isComplete": false
}
```

## Mathematics

### Bayes' Theorem
For each cluster $c$ and answer $a$:

$$P(c|a) = \frac{P(a|c) \cdot P(c)}{P(a)}$$

Where:
- $P(c|a)$ = Posterior probability of cluster given answer
- $P(a|c)$ = Likelihood of answer given cluster (from question)
- $P(c)$ = Prior probability of cluster
- $P(a)$ = Normalizing constant

### Shannon Entropy
Measure of uncertainty in the distribution:

$$H(X) = -\sum_{i} p_i \log_2(p_i)$$

Lower entropy = more certain about user's cluster.

### Information Gain
For each candidate question $q$:

$$IG(q) = H_{current} - \mathbb{E}[H_{after}(q)]$$

Where:
- $H_{current}$ = Current entropy
- $\mathbb{E}[H_{after}(q)]$ = Expected entropy after asking question $q$

Select question with maximum $IG(q)$.

## User Experience

### Stage 1 (6-10 questions)
- "When you imagine yourself in a job you enjoy, what are you most likely doing?"
- "Which work environment appeals to you more?"
- Fast-paced, engaging questions
- Builds rapport while gathering key orientation data

### Stage 2 (8-15 questions)
- Adaptive based on Stage 1 results
- Questions targeted to user's top 2-3 clusters
- Examples:
  - "A team member is upset about a decision. What do you do?" (for people-oriented clusters)
  - "Something isn't working as expected. What's your first instinct?" (for problem-solver clusters)
- Progressive difficulty
- Real-time confidence indicator

### Stage Transition
After Stage 1 completion:
- Brief message: "Great! Now let's dig deeper into your strengths..."
- Shows top cluster matches with brief descriptions
- User sees they're being understood

## Extending the System

### Adding New Clusters
1. Add to `USER_CLUSTERS` in [bayesian-quiz-engine.ts](lib/bayesian-quiz-engine.ts)
2. Define characteristics (preference, workStyle, environment, etc.)
3. Map to ISCO groups and core skills
4. Update cluster likelihoods in existing questions

### Adding New Questions
1. Add to question bank in [quiz-stage2-questions.ts](lib/quiz-stage2-questions.ts)
2. Specify:
   - `targetClusters`: Which clusters this helps distinguish
   - `targetSkills`: Which skills it validates
   - `difficulty`: 1-3 for pacing
   - `clusterLikelihoods`: P(answer|cluster) for each option

### Tuning Parameters
In [bayesian-quiz-engine.ts](lib/bayesian-quiz-engine.ts):
- `targetUncertainty`: Lower = more questions for higher confidence (default: 0.5)
- `minQuestions`: Minimum Stage 2 questions (default: 8)
- `maxQuestions`: Maximum Stage 2 questions (default: 15)

## Benefits

### 1. **Efficiency**
- Typically 14-20 questions total (vs fixed 20-25)
- Smart users may finish in 14 questions
- Uncertain cases get more questions (up to 23)

### 2. **Accuracy**
- Maximizes information gain at each step
- Reduces guessing by targeting uncertainty
- Multiple evidence sources (clusters + direct skills)

### 3. **Engagement**
- "It gets me" feeling from adaptive questions
- Real-time confidence building
- Personalized pace

### 4. **Scalability**
- Easy to add new clusters/questions
- Automatic question selection
- No hardcoded question sequences

## Future Enhancements

1. **Occupation-Level Adaptation**
   - Stage 3: Narrow down to specific occupations (top 5-10)
   - Questions that distinguish between similar occupations

2. **Machine Learning**
   - Learn optimal cluster likelihoods from user data
   - Personalize question ordering based on demographics

3. **Confidence Thresholds**
   - Allow users to choose thoroughness vs speed
   - Adaptive min/max questions based on user preference

4. **Real-Time Feedback**
   - Show cluster probabilities visually during quiz
   - "You seem like a Tech Problem Solver!" mid-quiz

5. **Multi-Modal Questions**
   - Image-based scenarios
   - Video responses for free-text analysis
   - Gamified assessments

## Testing

Run the migration first:
```bash
node scripts/migrate-bayesian-quiz.js
```

Start a quiz:
```bash
curl -X POST http://localhost:3000/api/quiz/start
```

Submit answers and observe:
- Cluster probabilities updating
- Information gain calculations
- Adaptive question selection
- Stage transitions

## Notes

- The system is deterministic given the same answers
- Cluster likelihoods are hand-tuned but can be learned from data
- Stage 1 questions have carefully balanced likelihoods to avoid bias
- Stage 2 questions are selected dynamically, so no two users get the same sequence (unless they're in the same cluster)
