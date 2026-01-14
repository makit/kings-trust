# Quiz Setup Instructions

## Overview

The quiz system has been implemented with:
- ✅ SQLite database for local storage (no DynamoDB needed)
- ✅ AWS Bedrock integration for AI-powered questions and insights
- ✅ Complete quiz flow: onboarding → skill discovery → results
- ✅ Youth-friendly questions designed for The King's Trust

## Database Setup

The quiz tables have already been created in your SQLite database (`esco.db`). Tables include:
- `quiz_sessions` - Track quiz progress
- `quiz_questions` - Store questions (static and generated)
- `quiz_responses` - User answers
- `quiz_results` - Final results and insights

## AWS Bedrock Setup (Optional but Recommended)

To enable AI-powered features, you need AWS credentials with Bedrock access:

### 1. Get AWS Credentials

1. Log into AWS Console
2. Go to IAM → Users → Your User → Security Credentials
3. Create an Access Key (or use existing)
4. Make sure you have Bedrock permissions (or request access)

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Copy from the example
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
BEDROCK_MODEL_ID=us.anthropic.claude-sonnet-4-0-v1:0
```

### 3. Request Bedrock Model Access

1. Go to AWS Bedrock Console
2. Navigate to "Model access"
3. Request access to "Claude Sonnet 4" (Anthropic)
4. Wait for approval (usually instant for most regions)

### Without Bedrock

The quiz will still work without Bedrock, but:
- No AI-generated scenario questions
- No personalized insights on results page
- Only static questions will be used

## Running the Quiz

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the quiz:**
   - Landing page: `http://localhost:3000/quiz`
   - Click "Start the Quiz"

3. **Quiz Flow:**
   - Phase 1: 5 onboarding questions (getting to know you)
   - Phase 2: 7 skill discovery questions (experiences and scenarios)
   - Results: Skills profile + career matches + AI insights

## Testing the Quiz

### Manual Testing

1. Go to `http://localhost:3000/quiz`
2. Click "Start the Quiz"
3. Answer the onboarding questions
4. Complete the skill discovery questions
5. View your results with:
   - Identified skills with confidence scores
   - Top occupation matches
   - AI-generated insights (if Bedrock is configured)

### Test Without Full Completion

To test the results page directly, you can:
1. Start a quiz
2. Note the session ID from the URL (`/quiz/[sessionId]`)
3. Manually complete it via the database or API

## API Endpoints

- `POST /api/quiz/start` - Create new quiz session
- `POST /api/quiz/answer` - Submit answer and get next question
- `GET /api/quiz/results/[sessionId]` - Get quiz results

## Architecture

```
Frontend (Next.js Client Components)
    ↓
API Routes (Next.js API handlers)
    ↓
Quiz Logic (lib/quiz-db.ts, lib/quiz-questions.ts)
    ↓
SQLite Database (esco.db)
    ↓
AWS Bedrock (optional, for AI features)
```

## Question Bank

Static questions are defined in `lib/quiz-questions.ts`:
- **Phase 1 (Onboarding):** 5 questions about current situation, interests, goals
- **Phase 2 (Skills):** 7 questions covering experiences, scenarios, and self-assessment

To add more questions, edit the `getPhase2Questions()` function.

## Skill Inference

Currently, skill inference is done through:
1. **Direct mapping:** Multiple choice options map to specific skills
2. **Manual scoring:** Based on question responses
3. **AI analysis:** (Future) Bedrock analyzes free-text responses

The matching algorithm uses the same logic as the skills matcher:
- 70% weight on essential skills
- 30% weight on optional skills

## Future Enhancements

To move to cloud deployment later:

1. **Replace SQLite with DynamoDB:**
   - Use AWS CDK to provision tables
   - Update `lib/quiz-db.ts` to use DynamoDB SDK

2. **Move API logic to Lambda:**
   - Create Lambda functions for each API route
   - Use API Gateway for REST endpoints

3. **Add authentication:**
   - Implement AWS Cognito
   - Save quiz history per user

4. **Enable quiz resume:**
   - Already supported in database schema
   - Add resume UI

## Troubleshooting

### Quiz Won't Start
- Check browser console for errors
- Verify database exists: `ls esco.db`
- Ensure tables created: `node scripts/create-quiz-tables.js`

### No AI Insights on Results
- Check AWS credentials in `.env.local`
- Verify Bedrock model access in AWS Console
- Check server logs for Bedrock errors

### Questions Not Loading
- Check `lib/quiz-questions.ts` for syntax errors
- Verify question types match component names
- Check browser network tab for API errors

## Support

For issues or questions:
1. Check browser console and server logs
2. Verify environment variables
3. Test Bedrock connection: The API will log errors if Bedrock fails

## Summary

Your quiz is now ready to run locally with:
- ✅ SQLite database (no cloud dependencies)
- ✅ Optional AWS Bedrock for AI features
- ✅ Complete quiz flow with results
- ✅ Youth-focused questions for The King's Trust

To test: `npm run dev` and visit `http://localhost:3000/quiz`
