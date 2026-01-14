/**
 * Stage 1: Broad Orientation Questions
 * 
 * 4-5 questions designed to quickly place users into clusters (reduced from 6-8)
 * Each question helps narrow down:
 * - preferences: people vs things vs information
 * - structure vs variety
 * - indoor vs outdoor
 * - teamwork vs solo
 * - patience/detail vs speed/action
 */

import { AdaptiveQuestion } from './bayesian-quiz-engine';

/**
 * Get Stage 1 orientation questions
 * These have carefully tuned cluster likelihoods
 */
export function getStage1Questions(): AdaptiveQuestion[] {
  return [
    {
      question_id: 'stage1_q1_preference',
      type: 'multiple-choice',
      text: 'When you imagine yourself in a job you enjoy, what are you most likely doing?',
      description: 'Think about what energizes you',
      options: [
        {
          value: 'talking-people',
          label: 'Talking with people, helping them, or working as a team',
          clusterLikelihoods: {
            'helper-people': 0.9,
            'care-support': 0.85,
            'entrepreneur-persuader': 0.8,
            'tech-solver': 0.2,
            'analyst-researcher': 0.1,
            'creative-maker': 0.3,
            'action-outdoor': 0.5,
            'organizer-coordinator': 0.6
          }
        },
        {
          value: 'creating-fixing',
          label: 'Creating, building, or fixing things with my hands',
          clusterLikelihoods: {
            'creative-maker': 0.9,
            'action-outdoor': 0.7,
            'tech-solver': 0.4,
            'helper-people': 0.2,
            'care-support': 0.1,
            'entrepreneur-persuader': 0.3,
            'analyst-researcher': 0.2,
            'organizer-coordinator': 0.2
          }
        },
        {
          value: 'solving-analyzing',
          label: 'Solving problems, analyzing data, or researching information',
          clusterLikelihoods: {
            'tech-solver': 0.9,
            'analyst-researcher': 0.9,
            'organizer-coordinator': 0.5,
            'creative-maker': 0.4,
            'helper-people': 0.2,
            'care-support': 0.2,
            'entrepreneur-persuader': 0.4,
            'action-outdoor': 0.2
          }
        },
        {
          value: 'organizing-planning',
          label: 'Organizing, planning, or coordinating activities',
          clusterLikelihoods: {
            'organizer-coordinator': 0.9,
            'entrepreneur-persuader': 0.7,
            'helper-people': 0.5,
            'tech-solver': 0.4,
            'analyst-researcher': 0.4,
            'creative-maker': 0.3,
            'care-support': 0.5,
            'action-outdoor': 0.3
          }
        }
      ],
      targetClusters: ['helper-people', 'creative-maker', 'tech-solver', 'organizer-coordinator']
    },
    
    {
      question_id: 'stage1_q2_work_style',
      type: 'multiple-choice',
      text: 'Which work environment appeals to you more?',
      description: 'Both can be good - which feels more like you?',
      options: [
        {
          value: 'structured-routine',
          label: 'Clear routines and structure - I like knowing what to expect',
          clusterLikelihoods: {
            'organizer-coordinator': 0.9,
            'care-support': 0.8,
            'helper-people': 0.75,
            'tech-solver': 0.7,
            'analyst-researcher': 0.8,
            'creative-maker': 0.2,
            'entrepreneur-persuader': 0.3,
            'action-outdoor': 0.4
          }
        },
        {
          value: 'variety-change',
          label: 'Variety and change - every day being different keeps me engaged',
          clusterLikelihoods: {
            'creative-maker': 0.9,
            'entrepreneur-persuader': 0.85,
            'action-outdoor': 0.8,
            'helper-people': 0.4,
            'tech-solver': 0.3,
            'analyst-researcher': 0.2,
            'care-support': 0.3,
            'organizer-coordinator': 0.2
          }
        },
        {
          value: 'bit-of-both',
          label: 'A bit of both - some structure with room for variety',
          clusterLikelihoods: {
            'helper-people': 0.7,
            'tech-solver': 0.6,
            'organizer-coordinator': 0.6,
            'creative-maker': 0.6,
            'care-support': 0.7,
            'entrepreneur-persuader': 0.6,
            'analyst-researcher': 0.5,
            'action-outdoor': 0.6
          }
        }
      ],
      targetClusters: ['organizer-coordinator', 'creative-maker', 'entrepreneur-persuader']
    },
    
    {
      question_id: 'stage1_q3_environment',
      type: 'multiple-choice',
      text: 'Where do you see yourself working?',
      description: 'Think about the physical environment',
      options: [
        {
          value: 'mainly-indoors',
          label: 'Mainly indoors (office, shop, studio, lab)',
          clusterLikelihoods: {
            'tech-solver': 0.9,
            'analyst-researcher': 0.9,
            'organizer-coordinator': 0.85,
            'helper-people': 0.7,
            'care-support': 0.8,
            'creative-maker': 0.6,
            'entrepreneur-persuader': 0.7,
            'action-outdoor': 0.1
          }
        },
        {
          value: 'mainly-outdoors',
          label: 'Mainly outdoors (nature, sports, construction, travel)',
          clusterLikelihoods: {
            'action-outdoor': 0.95,
            'creative-maker': 0.5,
            'entrepreneur-persuader': 0.4,
            'helper-people': 0.2,
            'tech-solver': 0.1,
            'analyst-researcher': 0.05,
            'care-support': 0.2,
            'organizer-coordinator': 0.1
          }
        },
        {
          value: 'mix-both',
          label: 'Mix of both - variety is good',
          clusterLikelihoods: {
            'entrepreneur-persuader': 0.8,
            'creative-maker': 0.7,
            'helper-people': 0.6,
            'action-outdoor': 0.6,
            'care-support': 0.5,
            'organizer-coordinator': 0.4,
            'tech-solver': 0.3,
            'analyst-researcher': 0.2
          }
        }
      ],
      targetClusters: ['action-outdoor', 'tech-solver', 'analyst-researcher']
    },
    
    {
      question_id: 'stage1_q4_collaboration',
      type: 'multiple-choice',
      text: 'How do you prefer to work on projects or tasks?',
      description: 'Think about when you feel most productive',
      options: [
        {
          value: 'team-collaboration',
          label: 'In a team - I love collaborating and bouncing ideas around',
          clusterLikelihoods: {
            'helper-people': 0.9,
            'entrepreneur-persuader': 0.85,
            'care-support': 0.85,
            'action-outdoor': 0.7,
            'organizer-coordinator': 0.7,
            'creative-maker': 0.4,
            'tech-solver': 0.5,
            'analyst-researcher': 0.2
          }
        },
        {
          value: 'independent-solo',
          label: 'Independently - I work best focusing on my own',
          clusterLikelihoods: {
            'analyst-researcher': 0.9,
            'creative-maker': 0.85,
            'tech-solver': 0.7,
            'organizer-coordinator': 0.5,
            'helper-people': 0.2,
            'care-support': 0.2,
            'entrepreneur-persuader': 0.3,
            'action-outdoor': 0.4
          }
        },
        {
          value: 'flexible-both',
          label: 'Flexible - depends on the task',
          clusterLikelihoods: {
            'tech-solver': 0.7,
            'organizer-coordinator': 0.7,
            'creative-maker': 0.6,
            'entrepreneur-persuader': 0.6,
            'helper-people': 0.6,
            'analyst-researcher': 0.6,
            'care-support': 0.6,
            'action-outdoor': 0.6
          }
        }
      ],
      targetClusters: ['helper-people', 'analyst-researcher', 'entrepreneur-persuader']
    },
    
    {
      question_id: 'stage1_q5_pace',
      type: 'multiple-choice',
      text: 'What kind of work pace suits you best?',
      description: 'Be honest - there\'s no wrong answer!',
      options: [
        {
          value: 'fast-dynamic',
          label: 'Fast-paced and dynamic - I thrive on energy and quick decisions',
          clusterLikelihoods: {
            'entrepreneur-persuader': 0.9,
            'action-outdoor': 0.85,
            'creative-maker': 0.7,
            'helper-people': 0.5,
            'organizer-coordinator': 0.3,
            'tech-solver': 0.4,
            'care-support': 0.3,
            'analyst-researcher': 0.2
          }
        },
        {
          value: 'steady-careful',
          label: 'Steady and careful - I like taking time to get things right',
          clusterLikelihoods: {
            'analyst-researcher': 0.9,
            'care-support': 0.85,
            'organizer-coordinator': 0.85,
            'tech-solver': 0.75,
            'helper-people': 0.6,
            'creative-maker': 0.4,
            'entrepreneur-persuader': 0.2,
            'action-outdoor': 0.3
          }
        },
        {
          value: 'balanced',
          label: 'Balanced - I can adapt to what\'s needed',
          clusterLikelihoods: {
            'helper-people': 0.7,
            'tech-solver': 0.65,
            'organizer-coordinator': 0.65,
            'care-support': 0.6,
            'creative-maker': 0.6,
            'entrepreneur-persuader': 0.6,
            'analyst-researcher': 0.5,
            'action-outdoor': 0.6
          }
        }
      ],
      targetClusters: ['entrepreneur-persuader', 'action-outdoor', 'analyst-researcher', 'care-support']
    },
    
  ];
}

/**
 * Validate Stage 1 completion
 * Ensures we have enough information to proceed to Stage 2
 */
export function isStage1Complete(responsesCount: number): boolean {
  // Require at least 4 questions answered (reduced from 6)
  return responsesCount >= 4;
}

/**
 * Get stage 1 progress
 */
export function getStage1Progress(responsesCount: number): {
  current: number;
  total: number;
  percentage: number;
  canProceed: boolean;
} {
  const total = 5; // Total stage 1 questions (reduced from 8)
  return {
    current: responsesCount,
    total,
    percentage: Math.round((responsesCount / total) * 100),
    canProceed: isStage1Complete(responsesCount)
  };
}
