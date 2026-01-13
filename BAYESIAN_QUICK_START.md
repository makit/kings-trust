# Quick Start: Bayesian Adaptive Quiz

## Setup

### 1. Run Database Migration
```bash
node scripts/migrate-bayesian-quiz.js
```

This adds the new Bayesian quiz fields to the database.

### 2. Test the System

#### Start a Quiz
```bash
curl -X POST http://localhost:3000/api/quiz/start \
  -H "Content-Type: application/json"
```

Response:
```json
{
  "sessionId": "abc-123",
  "firstQuestion": {
    "question_id": "stage1_q1_preference",
    "type": "multiple-choice",
    "text": "When you imagine yourself in a job you enjoy, what are you most likely doing?",
    "options": [...]
  },
  "quizInfo": {
    "stage": 1,
    "stageDescription": "Getting to know you",
    "estimatedQuestions": "14-23 questions"
  }
}
```

#### Answer a Question
```bash
curl -X POST http://localhost:3000/api/quiz/answer \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc-123",
    "questionId": "stage1_q1_preference",
    "response": "solving-analyzing",
    "responseTime": 5000
  }'
```

Response:
```json
{
  "nextQuestion": {...},
  "progress": {
    "current": 1,
    "estimated": 16,
    "stage": 1,
    "message": "Getting to know you...",
    "confidence": 25
  },
  "topClusters": [
    {
      "name": "Tech Problem Solver",
      "probability": 45
    },
    {
      "name": "Analyst & Researcher",
      "probability": 38
    }
  ],
  "isComplete": false
}
```

## What Changed

### Before (Hardcoded Questions)
- Fixed sequence of 20-25 questions
- Same questions for everyone
- No adaptation based on answers

### After (Bayesian Adaptive)
- **Stage 1**: 6-10 orientation questions → places user in clusters
- **Stage 2**: 8-15 adaptive questions → selected for maximum information gain
- **Total**: 14-23 questions (typically 15-18)
- Questions adapt to user's cluster profile

## Key Files Created

1. **lib/bayesian-quiz-engine.ts** - Core Bayesian inference
2. **lib/quiz-stage1-questions.ts** - Orientation questions
3. **lib/quiz-stage2-questions.ts** - Adaptive question bank (25+ questions)
4. **lib/adaptive-quiz-controller.ts** - Quiz orchestration
5. **scripts/migrate-bayesian-quiz.js** - Database migration

## Key Files Modified

1. **lib/quiz-db.ts** - Added Bayesian state fields
2. **app/api/quiz/start/route.ts** - Initialize Bayesian state
3. **app/api/quiz/answer/route.ts** - Process answers adaptively

## How It Works

### Stage 1: Broad Orientation
Each answer updates probability distribution over 8 clusters:
- People Helper
- Creative Maker
- Tech Problem Solver
- Action Outdoor
- Organizer & Coordinator
- Entrepreneur & Persuader
- Care & Support Specialist
- Analyst & Researcher

Example:
```
Question: "When you imagine yourself in a job you enjoy..."
Answer: "Solving problems, analyzing data"

Updates:
- Tech Problem Solver: 25% → 45% ↑
- Analyst & Researcher: 20% → 38% ↑
- Creative Maker: 15% → 8% ↓
```

### Stage 2: Adaptive Skill Confirmation
System calculates **information gain** for each candidate question:
- Which question will most reduce uncertainty?
- Targets top 2-3 clusters from Stage 1
- Progressive difficulty

Example:
```
Top clusters: Tech Problem Solver (65%), Analyst (22%)

Candidate questions evaluated:
1. "How comfortable with numbers?" → IG = 0.32 bits
2. "How do you learn new tech?" → IG = 0.54 bits ← SELECTED
3. "Group role preference?" → IG = 0.21 bits

Next question: "How do you learn new tech?"
```

Stops when:
- Confidence > 70% (low entropy)
- OR 15 questions answered
- Minimum: 8 questions

## Testing Different User Profiles

### Tech-Oriented User
```bash
# Stage 1 answers
Q1: "solving-analyzing"
Q2: "structured-routine"  
Q3: "mainly-indoors"
Q4: "independent-solo"
Q5: "steady-careful"

# Result: Tech Problem Solver (75%), Analyst (18%)
# Stage 2: Gets tech/analytical questions
```

### People-Oriented User
```bash
# Stage 1 answers
Q1: "talking-people"
Q2: "variety-change"
Q3: "mix-both"
Q4: "team-collaboration"
Q5: "fast-dynamic"

# Result: Entrepreneur (52%), Helper (31%)
# Stage 2: Gets communication/leadership questions
```

### Creative User
```bash
# Stage 1 answers
Q1: "creating-fixing"
Q2: "variety-change"
Q3: "mix-both"
Q4: "independent-solo"
Q5: "fast-dynamic"

# Result: Creative Maker (68%), Entrepreneur (20%)
# Stage 2: Gets creativity/hands-on questions
```

## Monitoring

Watch the console for:
```
Information Gain Calculation:
  Question: "How comfortable with tech?"
  Current Entropy: 1.45 bits
  Expected Entropy: 0.91 bits
  Information Gain: 0.54 bits ← Selected
```

## Next Steps

1. **Run Migration**: `node scripts/migrate-bayesian-quiz.js`
2. **Test Frontend**: Ensure quiz UI handles new response format
3. **Tune Parameters**: Adjust in `bayesian-quiz-engine.ts`:
   - `targetUncertainty`: 0.5 (lower = more questions)
   - `minQuestions`: 8
   - `maxQuestions`: 15
4. **Add Questions**: Extend `quiz-stage2-questions.ts` with more scenarios

## Benefits Over Old System

✅ **Smarter**: Adapts to each user  
✅ **Faster**: 14-18 questions vs 20-25  
✅ **Better UX**: "It gets me" feeling  
✅ **More Accurate**: Information gain maximization  
✅ **Scalable**: Easy to add questions/clusters  

## Troubleshooting

### Migration fails
- Check database exists: `ls esco.db`
- Try manual column addition in SQLite

### Quiz doesn't adapt
- Check `bayesian_state` is being saved in DB
- Verify cluster likelihoods in Stage 1 questions

### All questions same difficulty
- Check `difficulty` field in Stage 2 questions
- Verify filtering logic in `adaptive-quiz-controller.ts`

## Documentation

- **[BAYESIAN_QUIZ.md](./BAYESIAN_QUIZ.md)** - Full technical documentation
- **[QUIZ_SPEC.md](./QUIZ_SPEC.md)** - Original quiz specification
