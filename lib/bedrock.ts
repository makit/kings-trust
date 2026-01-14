/**
 * AWS Bedrock Integration for AI-Powered Quiz
 * Handles all Claude Sonnet 4 interactions for question generation and analysis
 */

import { 
  BedrockRuntimeClient, 
  InvokeModelCommand,
  InvokeModelCommandInput 
} from '@aws-sdk/client-bedrock-runtime';

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    ...(process.env.AWS_SESSION_TOKEN && { sessionToken: process.env.AWS_SESSION_TOKEN }),
  },
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-sonnet-4-0-v1:0';

/**
 * Generic function to invoke Claude via Bedrock
 */
async function invokeClaude(
  prompt: string,
  maxTokens: number = 2000,
  temperature: number = 0.7
): Promise<any> {
  const input: InvokeModelCommandInput = {
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: maxTokens,
      temperature,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  };

  try {
    const command = new InvokeModelCommand(input);
    const response = await bedrockClient.send(command);
    
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody;
  } catch (error) {
    console.error('Bedrock API Error:', error);
    throw new Error(`Failed to invoke Bedrock: ${error}`);
  }
}

/**
 * Generate an adaptive scenario question based on user's profile
 */
export async function generateAdaptiveQuestion(
  targetSkill: { id: string; label: string; description: string },
  userProfile: {
    currentSituation: string;
    interests: string[];
    experienceText: string;
  }
): Promise<{
  questionText: string;
  scenarioContext: string;
  suggestedApproaches: string[];
  skillIndicators: {
    strong: string[];
    moderate: string[];
    developing: string[];
  };
}> {
  const prompt = `You are a career assessment expert for The King's Trust, helping young people (16-25) discover their skills.

You are using the ESCO (European Skills, Competences, Qualifications and Occupations) framework for skill assessment.

Generate a realistic, youth-friendly scenario question to assess: "${targetSkill.label}"

Description: ${targetSkill.description}

User's Context:
- Current situation: ${userProfile.currentSituation}
- Interests: ${userProfile.interests.join(', ')}
- Experience: ${userProfile.experienceText}

Requirements:
1. Create a relatable scenario that a young person might encounter (school, volunteering, part-time work, life situations)
2. Ask how they would handle it
3. Make it engaging and not intimidating
4. Include 3-4 example approaches they could take (optional guidance)
5. The scenario should naturally require the ESCO skill: ${targetSkill.label}
6. Design the scenario to reveal ESCO-aligned skills in their response

Return ONLY valid JSON (no markdown):
{
  "questionText": "Short engaging question (1 sentence)",
  "scenarioContext": "2-3 sentences describing a realistic situation",
  "suggestedApproaches": ["Approach 1", "Approach 2", "Approach 3"],
  "skillIndicators": {
    "strong": ["Keywords/behaviors showing strong skill use"],
    "moderate": ["Keywords/behaviors showing moderate skill use"],
    "developing": ["Keywords/behaviors showing developing skill use"]
  }
}`;

  const response = await invokeClaude(prompt, 1500, 0.8);
  
  try {
    // Extract JSON from response
    const content = response.content[0].text;
    // Try to parse directly first
    try {
      return JSON.parse(content);
    } catch {
      // If wrapped in markdown, extract it
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                       content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error('Could not extract JSON from response');
    }
  } catch (error) {
    console.error('Failed to parse Bedrock response:', response);
    throw new Error('Invalid response format from Bedrock');
  }
}

/**
 * Analyze a free-text scenario response to identify skills
 */
export async function analyzeScenarioResponse(
  questionText: string,
  userResponse: string,
  targetSkills: Array<{ id: string; label: string; description: string }>,
  skillIndicators?: {
    strong: string[];
    moderate: string[];
    developing: string[];
  }
): Promise<{
  identifiedSkills: Array<{
    skillId: string;
    skillLabel: string;
    confidence: number;
    proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
    evidence: string;
    keyPhrases: string[];
  }>;
  additionalSkills: Array<{
    skillLabel: string;
    confidence: number;
    reasoning: string;
  }>;
  overallAssessment: string;
}> {
  const prompt = `You are analyzing a young person's response to help them discover their skills.

Scenario Question: ${questionText}

Their Response:
"${userResponse}"

Skills to Assess:
${targetSkills.map(s => `- ${s.label}: ${s.description}`).join('\n')}

${skillIndicators ? `
Skill Indicators:
- Strong: ${skillIndicators.strong.join(', ')}
- Moderate: ${skillIndicators.moderate.join(', ')}
- Developing: ${skillIndicators.developing.join(', ')}
` : ''}

IMPORTANT: This assessment uses the ESCO (European Skills, Competences, Qualifications and Occupations) framework.

Task: Analyze their response and identify demonstrated skills. Be encouraging and look for strengths!

CRITICAL REQUIREMENTS:
1. For "additionalSkills", ONLY use official ESCO skill names (e.g., "solve problems", "work in teams", "communicate", "show empathy", "think critically", "manage time", "demonstrate patience", "show initiative", "adapt to change")
2. Do NOT invent generic skills like "Teamwork" or "Problem Solving" - use exact ESCO terminology
3. Use lowercase, verb-based ESCO skill format (e.g., "coordinate events", "analyse data", "lead teams")
4. Be specific with ESCO skill names - avoid broad categories

Return ONLY valid JSON (no markdown):
{
  "identifiedSkills": [
    {
      "skillId": "skill_123",
      "skillLabel": "solve problems",
      "confidence": 85,
      "proficiencyLevel": "intermediate",
      "evidence": "Specific quote or behavior from their response",
      "keyPhrases": ["phrase 1", "phrase 2"]
    }
  ],
  "additionalSkills": [
    {
      "skillLabel": "work in teams",
      "confidence": 70,
      "reasoning": "They mentioned collaborating with others"
    }
  ],
  "overallAssessment": "Positive 1-2 sentence summary of their approach"
}`;

  const response = await invokeClaude(prompt, 2000, 0.6);
  
  try {
    const content = response.content[0].text;
    try {
      return JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                       content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error('Could not extract JSON from response');
    }
  } catch (error) {
    console.error('Failed to parse Bedrock response:', response);
    throw new Error('Invalid response format from Bedrock');
  }
}

/**
 * Generate personalized career insights based on quiz results
 */
export async function generatePersonalizedInsights(
  identifiedSkills: Array<{
    skillLabel: string;
    confidence: number;
    proficiencyLevel: string;
  }>,
  topOccupations: Array<{
    label: string;
    matchScore: number;
  }>,
  userProfile: {
    currentSituation: string;
    primaryGoal: string;
    interests: string[];
  }
): Promise<{
  executiveSummary: string;
  keyStrengths: string[];
  growthOpportunities: string[];
  careerRecommendations: string;
  learningPath: string[];
  encouragement: string;
}> {
  const prompt = `You are a career counselor at The King's Trust, providing personalized guidance to a young person who completed a skills assessment.

User Profile:
- Current situation: ${userProfile.currentSituation}
- Goal: ${userProfile.primaryGoal}
- Interests: ${userProfile.interests.join(', ')}

Identified Skills (top skills):
${identifiedSkills.slice(0, 8).map(s => 
  `- ${s.skillLabel} (${s.confidence}% confidence, ${s.proficiencyLevel} level)`
).join('\n')}

Top Career Matches:
${topOccupations.slice(0, 5).map(o => 
  `- ${o.label} (${o.matchScore}% match)`
).join('\n')}

Task: Generate encouraging, actionable career guidance. Remember, this is for a young person (16-25) - be supportive and realistic.

Return ONLY valid JSON (no markdown):
{
  "executiveSummary": "2-3 sentences about their overall skill profile",
  "keyStrengths": ["Strength 1 with brief explanation", "Strength 2", "Strength 3"],
  "growthOpportunities": ["Skill to develop and why", "Another skill and why", "Third skill and why"],
  "careerRecommendations": "Paragraph about their career options and next steps",
  "learningPath": ["First step to take", "Second step", "Third step"],
  "encouragement": "Positive, motivating closing message"
}`;

  const response = await invokeClaude(prompt, 3000, 0.7);
  
  try {
    const content = response.content[0].text;
    try {
      return JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                       content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error('Could not extract JSON from response');
    }
  } catch (error) {
    console.error('Failed to parse Bedrock response:', response);
    throw new Error('Invalid response format from Bedrock');
  }
}

/**
 * Get ESCO occupation recommendations based on identified skills
 * Uses LLM to suggest relevant careers with percentage matches
 */
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
}>> {
  const topSkills = identifiedSkills
    .filter(s => s.confidence >= 60)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);

  const prompt = `You are a career counselor using the ESCO (European Skills, Competences, Qualifications and Occupations) framework.

A young person (16-25) has completed a skills assessment. Based on their identified skills, suggest relevant ESCO occupations.

User Profile:
- Current situation: ${userProfile.currentSituation || 'Exploring career options'}
- Primary goal: ${userProfile.primaryGoal || 'Find a suitable career path'}
- Location: ${userProfile.location || 'UK'}
- Interests: ${userProfile.interests?.join(', ') || 'Not specified'}

Identified Skills (sorted by confidence):
${topSkills.map(s => `- ${s.skillLabel} (${s.confidence}% confidence)`).join('\n')}

Task: Suggest 8-10 ESCO occupations that match these skills. Use real ESCO occupation names (e.g., "shop assistant", "customer service representative", "retail manager", "care worker", "teaching assistant", etc.).

IMPORTANT:
1. Use realistic ESCO occupation titles that exist in the European skills framework
2. Match percentages should reflect how well their skills align (60-95% range is realistic)
3. Be specific - prefer concrete job titles over generic ones
4. Consider entry-level and growth opportunities suitable for young people
5. Provide brief reasoning for each match
6. Sort by match percentage (highest first)

Return ONLY valid JSON (no markdown, no code blocks):
{
  "occupations": [
    {
      "preferredLabel": "shop assistant",
      "description": "Brief 1-sentence description of what this role involves",
      "matchScore": 85,
      "reasoning": "Your strong communication and customer service skills are key for this role"
    }
  ]
}`;

  const response = await invokeClaude(prompt, 2500, 0.6);
  
  try {
    const content = response.content[0].text;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                       content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Could not extract JSON from response');
      }
    }
    
    // Transform to expected format
    return parsed.occupations.map((occ: any) => ({
      occupation: {
        preferredLabel: occ.preferredLabel,
        description: occ.description
      },
      matchScore: occ.matchScore,
      reasoning: occ.reasoning
    }));
  } catch (error) {
    console.error('Failed to parse occupation suggestions:', error);
    console.error('Raw response:', response);
    // Return fallback occupations
    return [
      {
        occupation: {
          preferredLabel: 'customer service representative',
          description: 'Assist customers with inquiries and provide support'
        },
        matchScore: 70,
        reasoning: 'Based on your communication and interpersonal skills'
      },
      {
        occupation: {
          preferredLabel: 'shop assistant',
          description: 'Help customers in retail environments'
        },
        matchScore: 68,
        reasoning: 'Your people skills and adaptability are valuable here'
      }
    ];
  }
}

/**
 * Health check to verify Bedrock connection
 */
export async function testBedrockConnection(): Promise<boolean> {
  try {
    const response = await invokeClaude('Say "OK" if you can read this.', 10, 0.1);
    return response && response.content && response.content.length > 0;
  } catch (error) {
    console.error('Bedrock connection test failed:', error);
    return false;
  }
}
