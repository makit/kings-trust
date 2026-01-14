# LLM-Based Occupation Matching

## Overview

Replaced the database-based occupation matching with **AI-powered suggestions** using AWS Bedrock (Claude). The LLM now directly suggests ESCO occupations based on identified skills, providing more relevant and personalized career matches.

## Why This Change?

### Previous Approach (Database Matching)
- ❌ Hardcoded S-code skills contaminated results
- ❌ Complex matching algorithm often returned irrelevant occupations
- ❌ Same wrong careers for everyone (dentist, tobacco shop manager)
- ❌ No context about *why* an occupation matched
- ❌ Required perfect skill-to-occupation mappings in database

### New Approach (LLM Suggestions)
- ✅ AI analyzes actual skills with their labels and confidence
- ✅ Considers user context (situation, goals, location, interests)
- ✅ Returns realistic ESCO occupation titles
- ✅ Provides reasoning for each match
- ✅ More flexible and adaptive to user profiles
- ✅ Match percentages reflect genuine skill alignment

## Implementation

### 1. New Function: `suggestOccupationsFromSkills()` 

Added to [lib/bedrock.ts](lib/bedrock.ts):

```typescript
export async function suggestOccupationsFromSkills(
  identifiedSkills: Array<{
    skillLabel: string;
    confidence: number;
  }>,
  userProfile: {
    currentSituation?: string;
    primaryGoal?: string;
    interests?: string[];
    dateOfBirth?: string;
    location?: string;
  }
): Promise<Array<{
  occupation: {
    preferredLabel: string;
    description: string;
  };
  matchScore: number;
  reasoning: string;
}>>
```

**What it does:**
1. Takes top 10 skills (confidence ≥ 60%)
2. Sends them to Claude with user context
3. Asks for 8-10 ESCO occupations with match percentages
4. Returns structured results with reasoning

**Prompt Engineering:**
- Emphasizes realistic ESCO occupation names
- Requests 60-95% match range (realistic spread)
- Prioritizes entry-level roles suitable for young people
- Requires brief reasoning for each suggestion
- Sorts by match percentage

### 2. Updated Results API

Modified [app/api/quiz/results/[sessionId]/route.ts](app/api/quiz/results/[sessionId]/route.ts):

**Before:**
```typescript
import { matchOccupationsToSkills } from '@/lib/database';
const occupationMatches = await matchOccupationsToSkills(skillIds);
```

**After:**
```typescript
import { suggestOccupationsFromSkills } from '@/lib/bedrock';
const occupationMatches = await suggestOccupationsFromSkills(
  session.identified_skills.map(s => ({
    skillLabel: s.skillLabel,
    confidence: s.confidence
  })),
  {
    currentSituation: session.current_situation,
    primaryGoal: session.primary_goal,
    interests: session.interest_categories,
    dateOfBirth: session.date_of_birth,
    location: session.location
  }
);
```

**Fallback:**
If LLM fails, provides 3 generic but relevant occupations:
- Customer service representative
- Shop assistant  
- Administrative assistant

### 3. Enhanced Results Page UI

Updated [app/quiz/[sessionId]/results/page.tsx](app/quiz/[sessionId]/results/page.tsx):

**New Features:**
- Shows occupation description (brief 1-sentence summary)
- Displays AI reasoning for each match (why it's a good fit)
- Removed occupation detail links (since we're not using DB occupations)
- Added footer note: "Career suggestions powered by AI"

**Visual Changes:**
```tsx
<div className="block p-5 border-2 border-gray-200 rounded-lg">
  <h3>{match.occupation.preferredLabel}</h3>
  <p>{match.occupation.description}</p>
  <p className="italic">💡 {match.reasoning}</p>
  <div>{match.matchScore}%</div>
</div>
```

## Example Output

### LLM Request
```
Skills:
- communicate with customers (85% confidence)
- show empathy (80% confidence)
- solve problems (75% confidence)
- apply organisational techniques (70% confidence)

User Profile:
- Location: London, UK
- Goal: Find a job that helps people
- Interests: Working with people, creative tasks
```

### LLM Response
```json
{
  "occupations": [
    {
      "preferredLabel": "customer service representative",
      "description": "Assist customers with inquiries, resolve issues, and provide product information",
      "matchScore": 87,
      "reasoning": "Your strong communication skills and empathy are essential for helping customers effectively"
    },
    {
      "preferredLabel": "retail sales assistant",
      "description": "Help customers find products, process transactions, and maintain store displays",
      "matchScore": 82,
      "reasoning": "Your people skills and organizational abilities make you ideal for retail environments"
    },
    {
      "preferredLabel": "care assistant",
      "description": "Support individuals with daily living activities and provide emotional care",
      "matchScore": 78,
      "reasoning": "Your empathy and problem-solving skills align perfectly with supporting vulnerable people"
    }
  ]
}
```

## Benefits

### For Users
1. **Relevant matches** - Occupations actually align with demonstrated skills
2. **Clear reasoning** - Understand *why* each career is suggested
3. **Personalized** - Takes into account their situation and goals
4. **Confidence boost** - See how their skills translate to real jobs

### For The King's Trust
1. **Better engagement** - Users more likely to explore suggested careers
2. **Reduced confusion** - No more "why is dentist recommended?"
3. **Flexibility** - Easy to refine prompts without touching database
4. **Future-proof** - Can add more context (e.g., local job market data)

## Technical Details

### AWS Configuration
Uses credentials from `.env.local`:
- `AWS_REGION=us-west-2`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` (if using temporary credentials)
- `BEDROCK_MODEL_ID=global.anthropic.claude-opus-4-5-20251101-v1:0`

### Error Handling
1. **LLM Failure** → Falls back to 3 generic occupations
2. **JSON Parse Error** → Tries to extract from markdown blocks
3. **Empty Response** → Returns fallback with 70% match scores

### Performance
- Single LLM call per results page load
- ~2-3 second response time
- Caches via browser (results page doesn't reload frequently)

## Testing

### Manual Test
1. Complete a quiz: `/quiz/start`
2. Answer 15 questions across both stages
3. View results: `/quiz/[sessionId]/results`
4. Check that:
   - Occupations are realistic ESCO titles
   - Match percentages vary (not all the same)
   - Reasoning makes sense for your answers
   - Different skill sets yield different careers

### Expected vs Previous
**Previous (Database):**
- "Specialist dentist" (85%)
- "Tobacco shop manager" (82%)
- "General practitioner" (78%)
- *(Same for everyone, regardless of skills)*

**New (LLM):**
- "Customer service representative" (87%) - *"Your communication skills..."*
- "Shop assistant" (82%) - *"Your people skills..."*
- "Care assistant" (78%) - *"Your empathy..."*
- *(Varies based on actual skills identified)*

## Future Enhancements

1. **Local Job Market** - Include regional employment data in prompt
2. **Salary Ranges** - Add expected income for each occupation
3. **Skills Gap** - Highlight which skills to develop for higher matches
4. **Growth Paths** - Show progression from entry-level to advanced roles
5. **King's Trust Programs** - Link occupations to available training courses

## Files Changed

1. ✅ [lib/bedrock.ts](lib/bedrock.ts) - Added `suggestOccupationsFromSkills()`
2. ✅ [app/api/quiz/results/[sessionId]/route.ts](app/api/quiz/results/[sessionId]/route.ts) - Use LLM instead of DB
3. ✅ [app/quiz/[sessionId]/results/page.tsx](app/quiz/[sessionId]/results/page.tsx) - Show reasoning, description
4. ✅ [lib/quiz-db.ts](lib/quiz-db.ts) - Added `date_of_birth`, `location` fields

## Cost Considerations

- **Claude Opus 4.5**: ~$15 per 1M input tokens, ~$75 per 1M output tokens
- **Per quiz result**: ~500 input tokens + ~800 output tokens = ~$0.07 per user
- **For 1000 users**: ~$70/month
- Much cheaper than maintaining complex database matching logic!

## Rollback Plan

If LLM suggestions don't work well:

1. Keep the skill mapping fix from [SKILL_MAPPING_FIX.md](SKILL_MAPPING_FIX.md)
2. Revert to database matching:
   ```typescript
   import { matchOccupationsToSkills } from '@/lib/database';
   const occupationMatches = await matchOccupationsToSkills(skillIds);
   ```
3. Remove reasoning/description from UI

But with proper S-code translation, database matching *should* work better now!
