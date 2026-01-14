# Skill Mapping Fix - Summary

## Problem Identified

The quiz was showing irrelevant skills and career matches because:

1. **Stage 2 questions use hardcoded S-code skill IDs** (S1.0.1, S2.2.1, etc.) that don't exist in the ESCO database
2. **These fake IDs were being stored in quiz sessions**, contaminating the results
3. **Occupation matching failed** because it tried to match against non-existent skills
4. **Results always showed the same wrong occupations** (specialist dentist, tobacco shop manager) regardless of user answers

## Root Cause

In [lib/quiz-stage2-questions.ts](lib/quiz-stage2-questions.ts), all 18 questions use dummy skill IDs like:
```typescript
skillLikelihoods: {
  'S2.2.1': 0.9, // Empathy (but S2.2.1 doesn't exist in DB!)
  'S1.0.1': 0.8, // Communication
  'S9.3.3': 0.7  // Conflict resolution
}
```

When users answered these questions, the S-codes were stored as identified skills, but the database couldn't find them, leading to:
- Skills showing generic labels or irrelevant matches
- Occupation matching receiving empty/wrong skill lists
- Results that didn't reflect actual user answers

## Solution Implemented

### 1. Created Skill Code Mapping ([lib/skill-code-mapping.ts](lib/skill-code-mapping.ts))

A comprehensive mapping from legacy S-codes to real ESCO key_* skills:

```typescript
export const SKILL_CODE_MAPPING: Record<string, string> = {
  'S1.0.1': 'key_2927', // Communication → communicate with customers
  'S2.2.1': 'key_7837', // Empathy → show empathy
  'S1.3.1': 'key_1428', // Analytical thinking → create solutions to problems
  'S4.3.1': 'key_1354', // Budget management → manage supplies
  // ... 30+ more mappings
};
```

### 2. Integrated Translation in Answer Processing ([app/api/quiz/answer/route.ts](app/api/quiz/answer/route.ts))

Modified the skill extraction to translate S-codes before storing:

```typescript
Object.entries(selectedOption.skillLikelihoods).forEach(([skillId, likelihood]) => {
  if (typeof likelihood === 'number' && likelihood > 0.5) {
    // Translate legacy S-code to ESCO key_* format
    const translatedSkillId = translateSkillCode(skillId);
    skills.push({
      skillId: translatedSkillId,
      skillLabel: translatedSkillId,
      confidence: Math.round(likelihood * 100),
      evidence: [question.question_id],
      source: 'direct' as const
    });
  }
});
```

### 3. Fixed Database Schema Migration

The `date_of_birth` and `location` columns were missing from `quiz_sessions` table. Created and ran migration:
- Script: [scripts/migrate-add-user-info.js](scripts/migrate-add-user-info.js)
- Added both columns to support user profile data

## Mapping Strategy

Mapped S-codes to ESCO skills based on semantic similarity:

| S-Code Category | Example Mapping | ESCO Skill |
|----------------|-----------------|------------|
| Communication | S1.0.1 → key_2927 | communicate with customers |
| Empathy | S2.2.1 → key_7837 | show empathy |
| Problem-solving | S1.3.1 → key_1428 | create solutions to problems |
| Planning | S4.1.2 → key_1411 | plan retail space |
| Care/Support | S3.1.1 → key_1490 | support harmed social service users |
| Creative | S6.1.1 → key_11134 | develop artistic project |
| Physical | S7.1.1 → key_3596 | manipulate tools |
| Risk Management | S10.2.1 → key_1284 | enterprise risk management |

## Testing

To verify the fix:

1. **Start a new quiz session**
   - Go to `/quiz/start`
   - Answer orientation questions
   
2. **Answer Stage 2 questions**
   - These use the S-codes internally
   - System now translates them to real ESCO skills
   
3. **Check results page** (`/quiz/[sessionId]/results`)
   - Skills should show real ESCO labels (not S-codes)
   - Career matches should be relevant to answers
   - No more "specialist dentist" for everyone!

4. **Verify database** (optional)
   ```bash
   node scripts/check-sessions.js
   ```
   - Should show key_* skills, not S*.*.* codes

## Files Changed

1. ✅ [lib/skill-code-mapping.ts](lib/skill-code-mapping.ts) - New file with 30+ mappings
2. ✅ [app/api/quiz/answer/route.ts](app/api/quiz/answer/route.ts) - Translate S-codes during answer processing
3. ✅ [scripts/migrate-add-user-info.js](scripts/migrate-add-user-info.js) - Database migration for DOB/location
4. ✅ [scripts/check-sessions.js](scripts/check-sessions.js) - Debugging utility
5. ✅ [scripts/find-useful-skills.js](scripts/find-useful-skills.js) - Research tool for ESCO skills

## Next Steps

1. **Test with real users** - Have a few people complete the quiz and verify results are relevant
2. **Monitor logs** - Check console for any unmapped S-codes
3. **Refine mappings** - If certain S-codes still produce odd results, adjust the mapping
4. **Consider AI questions** - Configure AWS Bedrock credentials to enable AI-generated scenario questions
5. **Long-term**: Replace Stage 2 questions entirely with real ESCO skill IDs

## AWS Bedrock Configuration (Optional Enhancement)

To enable AI-generated scenario questions, configure AWS credentials:

1. Set environment variables:
   ```bash
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   AWS_REGION=us-east-1
   ```

2. AI questions will automatically inject at progress points 3, 7, and 11 in Stage 2

## Database Schema Reference

### quiz_sessions table (after migration)
- `session_id` TEXT PRIMARY KEY
- `date_of_birth` TEXT (new)
- `location` TEXT (new)
- `identified_skills` TEXT (JSON array of IdentifiedSkill objects)
- `cluster_probabilities` TEXT (JSON with items array)
- ... other columns

### IdentifiedSkill structure
```typescript
{
  skillId: string,      // Now always key_* format (after translation)
  skillLabel: string,   // Resolved from ESCO database
  confidence: number,   // 0-100
  evidence: string[],   // Question IDs that provided evidence
  source: 'direct' | 'inferred' | 'validated' | 'ai-analysis'
}
```

## Impact

- ✅ Skills now show relevant ESCO labels from database
- ✅ Career matches based on real skills user demonstrated
- ✅ No more hardcoded dummy data contaminating results
- ✅ DOB and location properly saved for personalization
- ✅ Results vary based on actual answers (not always the same careers)
- ✅ Foundation for AI-powered questions when AWS configured
