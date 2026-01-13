/**
 * Static Quiz Question Bank
 * Onboarding and Phase 2 questions for the skills assessment
 */

import { QuizQuestion } from './quiz-db';

/**
 * Phase 1: Onboarding Questions (5 questions)
 */
export function getOnboardingQuestions(): QuizQuestion[] {
  return [
    {
      question_id: 'onboarding_1',
      phase: 1,
      type: 'multiple-choice',
      text: 'What are you up to right now?',
      description: 'This helps us understand your current situation',
      options: [
        { value: 'in-school', label: 'In school/college' },
        { value: 'just-finished', label: 'Just finished school/college' },
        { value: 'first-job', label: 'Looking for my first job' },
        { value: 'between-jobs', label: 'Between jobs' },
        { value: 'part-time', label: 'Working part-time' },
        { value: 'volunteering', label: 'Volunteering' },
        { value: 'taking-break', label: 'Taking a break/figuring things out' },
        { value: 'other', label: 'Other' }
      ],
      target_skills: [],
      is_generated: false,
      estimated_time: 30
    },
    {
      question_id: 'onboarding_2',
      phase: 1,
      type: 'free-text',
      text: 'Tell us about your experiences',
      description: 'Don\'t worry if you haven\'t had a "proper job" yet - we want to hear about ALL your experiences: babysitting, sports teams, helping family, gaming, school projects, volunteering, anything!',
      target_skills: [],
      is_generated: false,
      estimated_time: 120
    },
    {
      question_id: 'onboarding_3',
      phase: 1,
      type: 'multi-select',
      text: 'What kind of work sounds interesting to you?',
      description: 'Select as many as you like - we\'re just getting to know you!',
      options: [
        { value: 'people', label: 'Working with people (retail, care, teaching)' },
        { value: 'creative', label: 'Creative stuff (design, media, music, art)' },
        { value: 'tech', label: 'Tech and digital (coding, gaming, social media)' },
        { value: 'hands-on', label: 'Hands-on work (building, fixing, creating)' },
        { value: 'outdoor', label: 'Outdoor work (environment, sports, animals)' },
        { value: 'helping', label: 'Helping others (healthcare, social work, support)' },
        { value: 'business', label: 'Business and office work' },
        { value: 'not-sure', label: 'Not sure yet - show me options!' }
      ],
      target_skills: [],
      is_generated: false,
      estimated_time: 45
    },
    {
      question_id: 'onboarding_4',
      phase: 1,
      type: 'free-text',
      text: 'What are you naturally good at or what do people say you\'re good at?',
      description: 'Like... being organized? Good with people? Problem-solving? Creative? Good listener? Don\'t be shy!',
      target_skills: [],
      is_generated: false,
      estimated_time: 90
    },
    {
      question_id: 'onboarding_5',
      phase: 1,
      type: 'multiple-choice',
      text: 'What would make this quiz useful for you?',
      description: 'This helps us tailor the rest of the questions',
      options: [
        { value: 'find-jobs', label: 'Help me figure out what jobs might suit me' },
        { value: 'discover-skills', label: 'Show me what skills I actually have' },
        { value: 'next-steps', label: 'Give me ideas for my next steps' },
        { value: 'cv-help', label: 'Help me with my CV/applications' },
        { value: 'exploring', label: 'Just exploring and learning' }
      ],
      target_skills: [],
      is_generated: false,
      estimated_time: 30
    }
  ];
}

/**
 * Phase 2: Experience-Based Questions
 * Static questions to identify skills from experiences
 */
export async function getPhase2Questions(session: any): Promise<QuizQuestion[]> {
  // These are static for now; in full implementation, some would be Bedrock-generated
  return [
    {
      question_id: 'phase2_1',
      phase: 2,
      type: 'multi-select',
      text: 'Have you ever...?',
      description: 'Select all that apply. These help us understand your experiences.',
      options: [
        { 
          value: 'organized-event', 
          label: 'Organized an event or activity',
          skillImplications: [
            { skillId: 'S5.2.1', confidence: 70, reasoning: 'Event planning indicates organizational skills' }
          ]
        },
        { 
          value: 'helped-learn', 
          label: 'Helped someone learn something new',
          skillImplications: [
            { skillId: 'S13.2.1', confidence: 70, reasoning: 'Teaching shows communication and patience' }
          ]
        },
        { 
          value: 'fixed-tech', 
          label: 'Fixed a technical problem',
          skillImplications: [
            { skillId: 'S2.1.1', confidence: 65, reasoning: 'Technical problem-solving' }
          ]
        },
        { 
          value: 'created-content', 
          label: 'Created content (videos, art, posts, etc.)',
          skillImplications: [
            { skillId: 'S3.3.1', confidence: 75, reasoning: 'Content creation shows creativity' }
          ]
        },
        { 
          value: 'team-work', 
          label: 'Worked as part of a team',
          skillImplications: [
            { skillId: 'S13.1.1', confidence: 80, reasoning: 'Teamwork and collaboration' }
          ]
        },
        { 
          value: 'managed-money', 
          label: 'Managed your own money or budget',
          skillImplications: [
            { skillId: 'S5.3.1', confidence: 70, reasoning: 'Financial management' }
          ]
        },
        { 
          value: 'handled-difficult', 
          label: 'Dealt with a difficult situation calmly',
          skillImplications: [
            { skillId: 'S6.1.1', confidence: 75, reasoning: 'Stress management and composure' }
          ]
        }
      ],
      target_skills: [
        { skillId: 'S5.2.1', confidence: 70 },
        { skillId: 'S13.2.1', confidence: 70 },
        { skillId: 'S2.1.1', confidence: 65 },
        { skillId: 'S3.3.1', confidence: 75 },
        { skillId: 'S13.1.1', confidence: 80 },
        { skillId: 'S5.3.1', confidence: 70 },
        { skillId: 'S6.1.1', confidence: 75 }
      ],
      is_generated: false,
      difficulty: 'beginner',
      estimated_time: 60
    },
    {
      question_id: 'phase2_2',
      phase: 2,
      type: 'scale',
      text: 'How comfortable are you with technology?',
      description: 'Using computers, phones, apps, social media, etc.',
      options: [
        { value: '1', label: '1 - Not comfortable at all' },
        { value: '2', label: '2 - A bit uncomfortable' },
        { value: '3', label: '3 - Okay, can do basic stuff' },
        { value: '4', label: '4 - Pretty comfortable' },
        { value: '5', label: '5 - Very comfortable, tech-savvy' }
      ],
      target_skills: [
        { skillId: 'S2.2.1', confidence: 80 } // Digital literacy
      ],
      is_generated: false,
      difficulty: 'beginner',
      estimated_time: 20
    },
    {
      question_id: 'phase2_3',
      phase: 2,
      type: 'scenario',
      text: 'A customer is upset because their order is wrong. You\'re working the till. What do you do?',
      description: 'Choose all approaches you would take',
      options: [
        { 
          value: 'listen-apologize', 
          label: 'Listen to them and apologize',
          skillImplications: [
            { skillId: 'S13.2.2', confidence: 80, reasoning: 'Active listening and empathy' }
          ]
        },
        { 
          value: 'get-manager', 
          label: 'Get my manager immediately',
          skillImplications: [
            { skillId: 'S5.1.2', confidence: 60, reasoning: 'Following procedures' }
          ]
        },
        { 
          value: 'fix-it', 
          label: 'Offer to fix it right away',
          skillImplications: [
            { skillId: 'S2.1.2', confidence: 75, reasoning: 'Problem-solving and initiative' }
          ]
        },
        { 
          value: 'stay-calm', 
          label: 'Stay calm and ask what would help',
          skillImplications: [
            { skillId: 'S6.1.2', confidence: 80, reasoning: 'Composure under pressure' }
          ]
        }
      ],
      target_skills: [
        { skillId: 'S13.2.2', confidence: 80 },
        { skillId: 'S5.1.2', confidence: 60 },
        { skillId: 'S2.1.2', confidence: 75 },
        { skillId: 'S6.1.2', confidence: 80 }
      ],
      is_generated: false,
      difficulty: 'intermediate',
      estimated_time: 45
    },
    {
      question_id: 'phase2_4',
      phase: 2,
      type: 'multi-select',
      text: 'What do you spend your free time doing?',
      description: 'Select all that apply - your hobbies tell us a lot about your skills!',
      options: [
        { value: 'gaming', label: 'Gaming' },
        { value: 'social-media', label: 'Social media / creating content' },
        { value: 'sports', label: 'Sports or fitness' },
        { value: 'music-art', label: 'Music or art' },
        { value: 'reading', label: 'Reading or learning' },
        { value: 'volunteering', label: 'Volunteering or helping out' },
        { value: 'hanging-out', label: 'Hanging out with friends' },
        { value: 'side-hustle', label: 'Side projects or earning money' },
        { value: 'other', label: 'Other hobbies' }
      ],
      target_skills: [],
      is_generated: false,
      difficulty: 'beginner',
      estimated_time: 30
    },
    {
      question_id: 'phase2_5',
      phase: 2,
      type: 'multiple-choice',
      text: 'When working on a group project, what role do you usually take?',
      description: 'Think about school projects, team activities, or anything you\'ve done with others',
      options: [
        { 
          value: 'leader', 
          label: 'The organizer/leader - I like to coordinate things',
          skillImplications: [
            { skillId: 'S14.1.1', confidence: 85, reasoning: 'Leadership and coordination' }
          ]
        },
        { 
          value: 'ideas', 
          label: 'The ideas person - I come up with creative solutions',
          skillImplications: [
            { skillId: 'S3.3.2', confidence: 80, reasoning: 'Creativity and innovation' }
          ]
        },
        { 
          value: 'doer', 
          label: 'The doer - I get things done and finish tasks',
          skillImplications: [
            { skillId: 'S5.2.2', confidence: 80, reasoning: 'Execution and reliability' }
          ]
        },
        { 
          value: 'supporter', 
          label: 'The supporter - I help others and keep morale up',
          skillImplications: [
            { skillId: 'S13.1.2', confidence: 85, reasoning: 'Teamwork and support' }
          ]
        },
        { 
          value: 'researcher', 
          label: 'The researcher - I find information and figure things out',
          skillImplications: [
            { skillId: 'S1.1.1', confidence: 80, reasoning: 'Research and analysis' }
          ]
        }
      ],
      target_skills: [
        { skillId: 'S14.1.1', confidence: 85 },
        { skillId: 'S3.3.2', confidence: 80 },
        { skillId: 'S5.2.2', confidence: 80 },
        { skillId: 'S13.1.2', confidence: 85 },
        { skillId: 'S1.1.1', confidence: 80 }
      ],
      is_generated: false,
      difficulty: 'intermediate',
      estimated_time: 40
    },
    {
      question_id: 'phase2_6',
      phase: 2,
      type: 'scale',
      text: 'How good are you at explaining things to others?',
      description: 'Like helping someone understand something, teaching, or giving instructions',
      options: [
        { value: '1', label: '1 - Not my strength' },
        { value: '2', label: '2 - I find it quite hard' },
        { value: '3', label: '3 - I\'m okay at it' },
        { value: '4', label: '4 - I\'m pretty good' },
        { value: '5', label: '5 - I\'m great at it - people say I explain things well' }
      ],
      target_skills: [
        { skillId: 'S13.2.3', confidence: 85 } // Communication and explanation
      ],
      is_generated: false,
      difficulty: 'beginner',
      estimated_time: 25
    },
    {
      question_id: 'phase2_7',
      phase: 2,
      type: 'free-text',
      text: 'Tell us about a time you solved a problem or overcame a challenge',
      description: 'It can be anything - a school project, helping someone, fixing something, dealing with a difficult situation. What happened and what did you do?',
      target_skills: [
        { skillId: 'S2.1.3', confidence: 80 }, // Problem solving
        { skillId: 'S6.2.1', confidence: 70 }  // Resilience
      ],
      is_generated: false,
      difficulty: 'intermediate',
      estimated_time: 120
    }
  ];
}

/**
 * Get a random subset of Phase 2 questions
 */
export async function getRandomPhase2Questions(session: any, count: number = 10): Promise<QuizQuestion[]> {
  const allQuestions = await getPhase2Questions(session);
  
  // Shuffle and take first N questions
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
