# King's Trust Career AI - Productionization Strategy

## Executive Summary

This document outlines strategies for taking the King's Trust Career AI quiz from local SQLite prototype to production-ready AWS infrastructure, with focus on:
- Data optimization and preprocessing
- Dynamic question generation using LLM
- Scalability and performance
- Cost efficiency

---

## 1. Data Architecture & Storage

### Current State
- SQLite with full ESCO dataset (~3000 skills, ~3000 occupations)
- Complex hierarchies and relationships
- ~60MB of CSV data imported
- All queries run at request time

### Production Strategy: DynamoDB with Preprocessed Data

#### Core DynamoDB Tables

**1. Skills Table**
```
Table: skills
Partition Key: skillId (e.g., "key_1260")
Attributes:
  - preferredLabel
  - description
  - skillType (skill/competence, knowledge, attitude)
  - reuseLevel (cross-sector, sector-specific, occupation-specific, transversal)
  - relatedOccupations: Set<String> // Preprocessed list of occupation IDs
  - skillGroupCode (e.g., "S2.2.1") // For hierarchy queries
  - parentGroupId
  - searchTerms: Set<String> // For matching

GSI: SkillGroupCodeIndex (Query all skills in a group)
GSI: ReuseLevel-PreferredLabel (Browse by type)
```

**2. Occupations Table**
```
Table: occupations
Partition Key: occupationId (e.g., "key_5000")
Attributes:
  - preferredLabel
  - description
  - iscoGroupCode
  - essentialSkills: List<{skillId, skillLabel}> // Preprocessed
  - optionalSkills: List<{skillId, skillLabel}>
  - totalEssentialSkills: Number
  - totalOptionalSkills: Number
  - searchTerms: Set<String>
  - popularityScore: Number // For ranking

GSI: IscoGroupCode-PopularityScore (Browse careers by category)
```

**3. Skill Groups Table**
```
Table: skill_groups
Partition Key: code (e.g., "S2.2.1")
Attributes:
  - preferredLabel
  - description
  - childSkillIds: Set<String> // All skills in this group
  - childSkillCount: Number
  - parentCode (e.g., "S2.2" for "S2.2.1")
  
GSI: ParentCode-Code (Get all children of a group)
```

**4. Quiz Sessions Table**
```
Table: quiz_sessions
Partition Key: sessionId
Sort Key: userId (optional, for multi-user support)
Attributes:
  - status
  - currentPhase
  - questionsAnswered
  - identifiedSkills: List<{skillId, skillLabel, confidence, evidence}>
  - userProfile: Map
  - createdAt
  - updatedAt
  - ttl: Number // Auto-expire after 30 days

GSI: UserId-CreatedAt (User's quiz history)
```

#### Why DynamoDB?

✅ **Pros:**
- Single-digit millisecond latency at any scale
- No query complexity - all lookups are key-based
- Pay per request (no idle server costs)
- Auto-scaling built-in
- Fits AWS ecosystem (Lambda, Bedrock, etc.)
- TTL for automatic session cleanup

❌ **Cons:**
- Need to denormalize/preprocess relationships
- More expensive for complex queries
- One-time migration effort

#### Preprocessing Pipeline

**Pre-compute relationships to eliminate joins:**

```javascript
// Preprocessing script (run once during deployment)
async function preprocessData() {
  // 1. For each occupation, embed its skill requirements
  for (const occupation of occupations) {
    const essentialSkills = await getEssentialSkills(occupation.id);
    const optionalSkills = await getOptionalSkills(occupation.id);
    
    await dynamodb.put({
      TableName: 'occupations',
      Item: {
        occupationId: occupation.id,
        preferredLabel: occupation.preferred_label,
        essentialSkills: essentialSkills.map(s => ({
          skillId: s.id,
          skillLabel: s.preferred_label
        })),
        optionalSkills: optionalSkills.map(s => ({
          skillId: s.id,
          skillLabel: s.preferred_label
        })),
        totalEssentialSkills: essentialSkills.length,
        totalOptionalSkills: optionalSkills.length
      }
    });
  }
  
  // 2. For each skill, embed which occupations need it
  for (const skill of skills) {
    const occupations = await getOccupationsForSkill(skill.id);
    
    await dynamodb.put({
      TableName: 'skills',
      Item: {
        skillId: skill.id,
        preferredLabel: skill.preferred_label,
        relatedOccupations: new Set(occupations.map(o => o.id))
      }
    });
  }
  
  // 3. Collapse skill hierarchies into groups
  for (const group of skillGroups) {
    const childSkills = await getAllSkillsInGroup(group.code);
    
    await dynamodb.put({
      TableName: 'skill_groups',
      Item: {
        code: group.code,
        preferredLabel: group.preferred_label,
        childSkillIds: new Set(childSkills.map(s => s.id)),
        childSkillCount: childSkills.length
      }
    });
  }
}
```

**Matching Algorithm Optimization:**

Current: O(n) scan of all 3000 occupations
```javascript
// ❌ Current (slow)
for (const occupation of allOccupations) {
  const skills = await getSkillsForOccupation(occupation.id); // DB query
  const match = calculateMatch(userSkills, skills);
  matches.push({ occupation, match });
}
```

Optimized: Preprocessed lookup
```javascript
// ✅ Optimized (fast)
async function matchOccupations(userSkillIds) {
  // Get all occupations that need ANY of the user's skills
  const candidateOccupationIds = new Set();
  
  for (const skillId of userSkillIds) {
    const skill = await dynamodb.get({
      TableName: 'skills',
      Key: { skillId }
    });
    skill.relatedOccupations.forEach(id => candidateOccupationIds.add(id));
  }
  
  // Batch get occupation details (DynamoDB supports batch gets)
  const occupations = await dynamodb.batchGet({
    RequestItems: {
      occupations: {
        Keys: Array.from(candidateOccupationIds).map(id => ({ occupationId: id }))
      }
    }
  });
  
  // Calculate match scores (all data is embedded, no more queries)
  return occupations.map(occ => {
    const essentialMatched = occ.essentialSkills.filter(s => 
      userSkillIds.includes(s.skillId)
    ).length;
    const optionalMatched = occ.optionalSkills.filter(s => 
      userSkillIds.includes(s.skillId)
    ).length;
    
    const matchScore = 
      (essentialMatched / occ.totalEssentialSkills) * 0.7 +
      (optionalMatched / occ.totalOptionalSkills) * 0.3;
    
    return { occupation: occ, matchScore };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
```

**Result:** 
- Reduces ~3000+ queries to ~10-50 queries
- Sub-100ms total matching time
- No full table scans

---

## 2. Dynamic Question Generation with LLM

### Current State
- 12 static questions
- Same for everyone
- Generic skill mappings

### Production Strategy: Adaptive Question Flow

#### Phase 1: Smart Onboarding (3-4 questions)
Keep initial questions short and use LLM to analyze free-text responses:

```javascript
async function analyzeOnboardingResponse(userText, questionContext) {
  const prompt = `
You are analyzing a young person's response to understand their skills and experiences.

Question: "${questionContext.question}"
Response: "${userText}"

Extract:
1. Specific skills demonstrated (be concrete, not generic)
2. Interest areas
3. Confidence level
4. 2-3 follow-up topics to explore

Return as JSON.
`;

  const result = await bedrock.invokeClaude(prompt);
  
  return {
    inferredSkills: result.skills.map(s => mapToESCOSkill(s)),
    interestAreas: result.interests,
    followUpTopics: result.followUpTopics,
    confidenceLevel: result.confidence
  };
}
```

#### Phase 2: Targeted Skill Discovery (5-7 questions)

Generate questions dynamically based on Phase 1 responses:

```javascript
async function generateNextQuestion(session) {
  // Determine highest-value skill areas to explore
  const unexploredSkillAreas = identifyGaps(
    session.identifiedSkills,
    session.interestAreas,
    session.targetOccupations
  );
  
  const prompt = `
Generate a quiz question for a 16-25 year old to identify their skills.

Context:
- Current situation: ${session.currentSituation}
- Interests: ${session.interestAreas.join(', ')}
- Skills identified so far: ${session.identifiedSkills.map(s => s.skillLabel).join(', ')}
- Target skill area: ${unexploredSkillAreas[0]}

Requirements:
1. Use youth-friendly language (casual, direct, no corporate jargon)
2. Focus on real-world scenarios they've likely experienced
3. Multiple choice or scenario-based (not free text)
4. Each option should map to specific ESCO skills
5. Make it relevant to their interests

Provide:
- Question text
- Description (context/encouragement)
- 4-5 options with skill implications

Format as JSON.
`;

  const question = await bedrock.invokeClaude(prompt);
  
  return {
    question_id: `generated_${Date.now()}`,
    phase: 2,
    ...question,
    is_generated: true
  };
}
```

#### Phase 3: Validation Questions (2-3 questions)

Confirm high-confidence skills with quick checks:

```javascript
async function generateValidationQuestion(skillToValidate, session) {
  const prompt = `
Create a quick validation question to confirm a skill.

Skill: ${skillToValidate.skillLabel}
Description: ${skillToValidate.description}
User's context: ${session.userProfile}

Generate a short scenario where this skill would be demonstrated.
Options should differentiate between:
- Strong demonstration of skill (100% confidence)
- Some demonstration (70% confidence)
- Little/no demonstration (reduce confidence to 30%)

Keep it real and relatable to young people.
`;

  return await bedrock.invokeClaude(prompt);
}
```

### Adaptive Flow Logic

```javascript
async function determineNextQuestion(session) {
  // Early exit if we have high confidence match
  if (session.questionsAnswered >= 5 && 
      session.identifiedSkills.length >= 8 &&
      session.identifiedSkills.filter(s => s.confidence >= 80).length >= 5) {
    
    const topOccupations = await matchOccupations(session.identifiedSkills);
    if (topOccupations[0].matchScore >= 75) {
      return null; // End quiz early
    }
  }
  
  // Maximum 12 questions
  if (session.questionsAnswered >= 12) {
    return null;
  }
  
  // Phases:
  if (session.currentPhase === 1 && session.questionsAnswered < 3) {
    return getNextOnboardingQuestion(session);
  }
  
  if (session.currentPhase === 2) {
    // Generate targeted questions based on what we've learned
    return await generateNextQuestion(session);
  }
  
  if (session.currentPhase === 3) {
    // Validate uncertain skills
    const uncertainSkills = session.identifiedSkills.filter(s => 
      s.confidence < 70 && s.confidence > 40
    );
    if (uncertainSkills.length > 0) {
      return await generateValidationQuestion(uncertainSkills[0], session);
    }
  }
  
  return null; // End quiz
}
```

### Benefits of Dynamic Questions

✅ **Shorter quiz:** 7-10 questions instead of 15-20
✅ **More accurate:** Questions tailored to each user
✅ **Better engagement:** Feels personalized, not generic
✅ **Explores edge cases:** Can probe unusual skill combinations
✅ **Adapts to user:** Adjusts difficulty and topics in real-time

---

## 3. Architecture Overview

### Recommended AWS Stack

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  CloudFront + S3 (Next.js Static)   │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌──────────────┐
        │ API Gateway  │
        │ (REST or     │
        │  AppSync)    │
        └──────┬───────┘
               │
        ┌──────┴───────┬──────────┬────────────┐
        ▼              ▼          ▼            ▼
    ┌────────┐    ┌────────┐  ┌────────┐  ┌────────┐
    │Lambda  │    │Lambda  │  │Lambda  │  │Lambda  │
    │Quiz    │    │Match   │  │Results │  │Insight │
    │Logic   │    │Engine  │  │        │  │Gen     │
    └───┬────┘    └───┬────┘  └───┬────┘  └───┬────┘
        │             │           │           │
        └─────────────┴───────────┴───────────┘
                      │
              ┌───────┴───────┐
              ▼               ▼
        ┌──────────┐    ┌──────────┐
        │ DynamoDB │    │ Bedrock  │
        │          │    │ Claude   │
        └──────────┘    └──────────┘
```

### Lambda Functions

**1. Quiz Manager (`POST /api/quiz/start`, `POST /api/quiz/answer`)**
- Handles session management
- Determines next question (static or generated)
- Extracts skills from answers
- Updates session state
- Memory: 512MB, Timeout: 30s

**2. Question Generator (`Internal - called by Quiz Manager`)**
- Calls Bedrock to generate questions
- Validates question format
- Maps options to ESCO skills
- Memory: 256MB, Timeout: 60s

**3. Matching Engine (`GET /api/quiz/results/[id]`)**
- Retrieves preprocessed occupation data
- Calculates match scores
- Returns top 10-20 occupations
- Memory: 256MB, Timeout: 10s

**4. Insights Generator (`Internal - called by Results`)**
- Generates personalized career advice
- Creates learning paths
- Formats encouragement
- Memory: 512MB, Timeout: 60s

### Cost Estimates (per 1000 quizzes)

**Current (Local SQLite):**
- Hosting: $0 (local only)
- Compute: N/A

**Production (AWS):**

| Service | Usage | Cost |
|---------|-------|------|
| DynamoDB | ~20 reads/quiz, ~5 writes/quiz | $0.03 |
| Lambda | 8-10 invocations × 3s avg | $0.10 |
| Bedrock Claude | 3-5 questions × 2000 tokens | $0.30 |
| Insights Generation | 1 call × 4000 tokens | $0.12 |
| API Gateway | 15 requests | $0.02 |
| **Total per 1000 quizzes** | | **~$0.57** |

**Monthly costs at scale:**
- 10K users: ~$6
- 100K users: ~$57
- 1M users: ~$570

*Note: CloudFront/S3 hosting adds ~$10-50/month regardless of traffic*

---

## 4. Migration Path

### Phase 1: Data Preprocessing (Week 1)
1. Create DynamoDB tables
2. Write preprocessing script
3. Import and denormalize ESCO data
4. Validate data integrity
5. Create backup of SQLite for reference

### Phase 2: Lambda Migration (Week 2)
1. Convert API routes to Lambda functions
2. Update database calls to DynamoDB SDK
3. Test matching algorithm performance
4. Deploy to dev environment

### Phase 3: Dynamic Questions (Week 3)
1. Implement question generation logic
2. Create prompt templates
3. Test with real user scenarios
4. Fine-tune adaptive flow

### Phase 4: Frontend Deployment (Week 4)
1. Build Next.js as static export
2. Deploy to S3 + CloudFront
3. Configure custom domain
4. Set up monitoring

### Phase 5: Testing & Launch (Week 5)
1. Load testing
2. User acceptance testing
3. Soft launch (limited audience)
4. Monitor and iterate

---

## 5. Improved Question Strategy

### Skill Coverage Matrix

Target 8-10 key skill clusters (from ESCO taxonomy):

| Cluster | ESCO Code | Example Skills | Question Type |
|---------|-----------|----------------|---------------|
| Communication | S13 | Listening, presenting, explaining | Scenario |
| Problem Solving | S2.1 | Analyzing, troubleshooting | Multi-select experience |
| Digital Literacy | S2.2 | Tech usage, digital tools | Scale |
| Teamwork | S13.1 | Collaboration, supporting | Multiple choice role |
| Organization | S5.2 | Planning, time management | Experience-based |
| Creativity | S3.3 | Innovation, content creation | Multi-select hobbies |
| Resilience | S6 | Stress management, adaptability | Scenario |
| Learning | S1 | Research, self-directed learning | Free text |

### Question Quality Criteria

**Good questions:**
✅ Map to specific ESCO skills (not generic)
✅ Use concrete scenarios young people recognize
✅ Differentiate between skill levels
✅ Are quick to answer (< 1 minute)
✅ Feel relevant and respectful

**Bad questions:**
❌ "Rate yourself 1-10" (no context)
❌ Corporate jargon ("stakeholder management")
❌ Hypothetical scenarios with no connection to their life
❌ Questions that assume work experience
❌ Leading questions that telegraph "right answer"

### LLM Prompt Template for Question Generation

```
You are a career guidance expert creating quiz questions for 16-25 year olds, 
many with limited work experience. Your questions must:

1. Use casual, direct language (no corporate speak)
2. Draw from experiences ALL young people have (school, friends, hobbies, family)
3. Be respectful and assume capability
4. Map clearly to ESCO skills taxonomy

User Context:
- Age: ${age}
- Situation: ${currentSituation}
- Interests: ${interests}
- Skills identified: ${skills}

Target Skill Area: ${targetSkillCluster}
Relevant ESCO Skills: ${escoSkillsList}

Generate ONE question that:
- Tests for skills in the target area
- Feels relevant to this user
- Has 4-5 options, each mapping to specific ESCO skill IDs
- Takes < 60 seconds to answer

Format:
{
  "text": "Question text",
  "description": "Helpful context or encouragement",
  "type": "multiple-choice | multi-select | scenario",
  "options": [
    {
      "value": "unique-id",
      "label": "Option text",
      "skillImplications": [
        {
          "skillId": "ESCO_skill_ID",
          "skillLabel": "Skill name",
          "confidence": 70-90,
          "reasoning": "Why this option indicates this skill"
        }
      ]
    }
  ]
}
```

---

## 6. Monitoring & Optimization

### Key Metrics to Track

1. **Quiz Completion Rate:** % who finish vs abandon
2. **Average Questions Needed:** Aim for 7-10
3. **Match Confidence:** % of quizzes with top match > 70%
4. **Question Generation Time:** Should be < 3s
5. **Total Quiz Duration:** Target 5-7 minutes
6. **User Satisfaction:** Post-quiz feedback

### A/B Testing Opportunities

- Static vs dynamic questions
- Number of questions before showing results
- Question difficulty progression
- Skill confidence thresholds
- Match algorithm weighting (essential vs optional skills)

### Performance Targets

- Quiz start: < 500ms
- Answer submission: < 1s
- Results generation: < 3s
- Total quiz time: 5-7 minutes
- 99.9% availability

---

## 7. Recommendations Summary

### Immediate (Prototype → MVP)
1. ✅ Keep SQLite for now, focus on LLM question generation
2. ✅ Implement adaptive question flow (reduces quiz length)
3. ✅ Add basic analytics (completion rate, time per question)

### Short-term (MVP → Beta)
1. ⚠️ Migrate to DynamoDB with preprocessed data
2. ⚠️ Deploy to AWS Lambda + API Gateway
3. ⚠️ Implement dynamic question generation
4. ⚠️ Add user authentication (optional)

### Long-term (Beta → Production)
1. 🎯 Scale testing with real users
2. 🎯 Fine-tune matching algorithm based on outcomes
3. 🎯 Build admin dashboard for content management
4. 🎯 Add career progression tracking
5. 🎯 Integrate with King's Trust programs/services

### Decision: DynamoDB or Keep SQL?

**Use DynamoDB if:**
- Expecting > 10K users
- Need sub-second response times at scale
- Want serverless auto-scaling
- Prefer AWS ecosystem integration

**Keep SQL/PostgreSQL if:**
- < 10K users initially
- Complex analytics queries needed
- Team prefers SQL familiarity
- Want to use RDS (managed PostgreSQL)

**Hybrid Approach:**
- PostgreSQL for admin/analytics
- DynamoDB for quiz runtime
- Nightly sync between them

---

## Conclusion

**Recommended Production Stack:**
- **Data:** DynamoDB with preprocessed relationships
- **Compute:** AWS Lambda (serverless)
- **AI:** Bedrock Claude for dynamic questions & insights
- **Frontend:** Next.js static on S3 + CloudFront
- **Questions:** 7-10 adaptive questions using LLM

**Key Innovation:** Dynamic question generation reduces quiz time by 40-50% while improving accuracy through personalization.

**Next Steps:**
1. Validate preprocessing strategy with sample data
2. Build question generation POC
3. Test adaptive flow with 10-20 users
4. Measure engagement and accuracy improvements
5. Plan phased migration to AWS
