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
  region: process.env.AWS_REGION || 'us-east-1',
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
5. The scenario should naturally require the skill: ${targetSkill.label}

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

Task: Analyze their response and identify demonstrated skills. Be encouraging and look for strengths!

Return ONLY valid JSON (no markdown):
{
  "identifiedSkills": [
    {
      "skillId": "skill_123",
      "skillLabel": "Problem Solving",
      "confidence": 85,
      "proficiencyLevel": "intermediate",
      "evidence": "Specific quote or behavior from their response",
      "keyPhrases": ["phrase 1", "phrase 2"]
    }
  ],
  "additionalSkills": [
    {
      "skillLabel": "Teamwork",
      "confidence": 70,
      "reasoning": "They mentioned working with others"
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
