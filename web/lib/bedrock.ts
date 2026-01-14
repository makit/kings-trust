/**
 * AWS Bedrock Integration for AI-Powered Quiz
 * Handles all Claude Sonnet 4 interactions for question generation and analysis
 */

import { 
  BedrockRuntimeClient, 
  InvokeModelCommand,
  InvokeModelCommandInput 
} from '@aws-sdk/client-bedrock-runtime';
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand
} from '@aws-sdk/client-bedrock-agent-runtime';

// Initialize Bedrock client
// In ECS, credentials are automatically provided by the task role
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-west-2',
});

const bedrockAgentClient = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION || 'us-west-2',
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
 * Uses AWS Bedrock Agent for career counseling
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
  escoOccupations: Array<{
    preferredLabel: string;
    description: string;
    matchScore: number;
    reasoning: string;
  }>;
  recommendedEvents: Array<{
    title: string;
    category: string;
    careerLevel: string;
    city: string;
    venue: string;
    date: string;
    format: string;
    skills: string[];
    relevanceReason: string;
  }>;
  recommendedKingsTrustCourses: Array<{
    courseName: string;
    programmeType: string;
    targetAudience: string;
    skillsSupported: string[];
    relevanceReason: string;
    courseLink: string;
  }>;
  encouragement: string;
}> {
  const agentId = 'XCZN9FTONE';
  const agentAliasId = 'TSTALIASID'; // Use test alias or create specific alias
  
  // Prepare input for the agent
  const inputData = {
    userProfile: {
      currentSituation: userProfile.currentSituation,
      primaryGoal: userProfile.primaryGoal,
      interests: userProfile.interests
    },
    identifiedSkills: identifiedSkills.slice(0, 8).map(s => ({
      skillLabel: s.skillLabel,
      confidence: s.confidence,
      proficiencyLevel: s.proficiencyLevel
    })),
    topOccupations: topOccupations.slice(0, 5).map(o => ({
      label: o.label,
      matchScore: o.matchScore
    }))
  };

  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  console.info('Calling Bedrock Agent with input:', inputData);

  try {
    const command = new InvokeAgentCommand({
      agentId,
      agentAliasId,
      sessionId,
      inputText: JSON.stringify(inputData)
    });

    const response = await bedrockAgentClient.send(command);
    
    // Collect response chunks from the stream
    let fullResponse = '';
    if (response.completion) {
      for await (const chunk of response.completion) {
        if (chunk.chunk?.bytes) {
          const text = new TextDecoder().decode(chunk.chunk.bytes);
          fullResponse += text;
        }
      }
    }

    console.info('Agent response:', fullResponse);

    // Parse the agent's response
    try {
      return JSON.parse(fullResponse);
    } catch {
      console.warn('Direct JSON parse failed, attempting to extract JSON from response');
      // Try to extract JSON from response
      const jsonMatch = fullResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                       fullResponse.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        console.info('Extracted JSON from response:', jsonMatch[1]);
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error('Could not extract JSON from agent response');
    }
  } catch (error) {
    console.error('Bedrock Agent Error:', error);
    throw new Error(`Failed to invoke Bedrock Agent: ${error}`);
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

    // console.info({
    //   location: userProfile.location || 'UK',
    //   currentSituation: userProfile.currentSituation || 'Exploring career options',
    //   primaryGoal: userProfile.primaryGoal || 'Find a suitable career path',
    //   interests: userProfile.interests || [],
    //   topSkills: topSkills,
    // });

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
