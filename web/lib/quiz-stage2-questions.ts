/**
 * Stage 2: Adaptive Skill Confirmation Questions
 * 
 * Question bank for Stage 2, where we use information gain to select
 * the best question to narrow down skills and occupations.
 * 
 * Questions are tagged with:
 * - Target skills they validate
 * - Target clusters they help distinguish
 * - Difficulty level for pacing
 */

import { AdaptiveQuestion } from './bayesian-quiz-engine';

/**
 * Get all Stage 2 questions
 * These will be dynamically selected based on information gain
 */
export function getStage2QuestionBank(): AdaptiveQuestion[] {
  return [
    // ========================================================================
    // Communication & People Skills
    // ========================================================================
    {
      question_id: 'stage2_comm_01',
      type: 'scale',
      text: 'How comfortable are you explaining complex ideas to others?',
      description: 'Rate from 1 (not comfortable) to 5 (very comfortable)',
      options: [
        { value: '1', label: '1 - Not comfortable', skillLikelihoods: {} },
        { value: '2', label: '2', skillLikelihoods: {} },
        { value: '3', label: '3 - Somewhat comfortable', skillLikelihoods: {} },
        { value: '4', label: '4', skillLikelihoods: {} },
        { value: '5', label: '5 - Very comfortable', skillLikelihoods: {} }
      ],
      targetSkills: ['S1.0.1', 'S1.0.3'], // Communication, instruction
      targetClusters: ['helper-people', 'entrepreneur-persuader', 'tech-solver'],
      difficulty: 2
    },
    
    {
      question_id: 'stage2_comm_02',
      type: 'multiple-choice',
      text: 'A team member is upset about a decision. What do you do?',
      description: 'Choose the approach that feels most natural to you',
      options: [
        {
          value: 'listen-empathize',
          label: 'Listen carefully to understand their concerns and feelings',
          clusterLikelihoods: {
            'care-support': 0.9,
            'helper-people': 0.85,
            'organizer-coordinator': 0.6,
            'entrepreneur-persuader': 0.5,
            'tech-solver': 0.3,
            'analyst-researcher': 0.2,
            'creative-maker': 0.4,
            'action-outdoor': 0.4
          },
          skillLikelihoods: {
            'S2.2.1': 0.9, // Empathy
            'S1.0.1': 0.8, // Communication
            'S9.3.3': 0.7  // Conflict resolution
          }
        },
        {
          value: 'explain-rationale',
          label: 'Explain the reasoning behind the decision clearly',
          clusterLikelihoods: {
            'tech-solver': 0.8,
            'analyst-researcher': 0.8,
            'organizer-coordinator': 0.7,
            'entrepreneur-persuader': 0.6,
            'helper-people': 0.5,
            'care-support': 0.4,
            'creative-maker': 0.5,
            'action-outdoor': 0.4
          },
          skillLikelihoods: {
            'S1.0.1': 0.8, // Communication
            'S1.3.1': 0.7, // Analytical thinking
            'S9.3.3': 0.6  // Conflict resolution
          }
        },
        {
          value: 'find-compromise',
          label: 'Work together to find a compromise or alternative',
          clusterLikelihoods: {
            'entrepreneur-persuader': 0.9,
            'helper-people': 0.8,
            'organizer-coordinator': 0.8,
            'care-support': 0.7,
            'creative-maker': 0.6,
            'tech-solver': 0.5,
            'analyst-researcher': 0.4,
            'action-outdoor': 0.5
          },
          skillLikelihoods: {
            'S9.3.3': 0.9, // Conflict resolution
            'T4.1.3': 0.8, // Negotiation
            'S1.0.1': 0.7  // Communication
          }
        },
        {
          value: 'escalate-manager',
          label: 'Bring it to a manager or someone neutral',
          clusterLikelihoods: {
            'organizer-coordinator': 0.6,
            'analyst-researcher': 0.5,
            'tech-solver': 0.5,
            'helper-people': 0.4,
            'care-support': 0.4,
            'entrepreneur-persuader': 0.3,
            'creative-maker': 0.4,
            'action-outdoor': 0.4
          },
          skillLikelihoods: {
            'S4.1.1': 0.6, // Following procedures
            'S1.0.1': 0.5  // Communication
          }
        }
      ],
      targetSkills: ['S2.2.1', 'S9.3.3', 'S1.0.1'],
      targetClusters: ['care-support', 'helper-people', 'entrepreneur-persuader'],
      difficulty: 2
    },
    
    {
      question_id: 'stage2_comm_03',
      type: 'multiple-choice',
      text: 'You need to persuade someone to try your idea. What\'s your approach?',
      options: [
        {
          value: 'enthusiasm',
          label: 'Share your enthusiasm and paint a vision of success',
          clusterLikelihoods: {
            'entrepreneur-persuader': 0.9,
            'creative-maker': 0.7,
            'helper-people': 0.6,
            'action-outdoor': 0.6,
            'care-support': 0.4,
            'organizer-coordinator': 0.4,
            'tech-solver': 0.3,
            'analyst-researcher': 0.2
          },
          skillLikelihoods: {
            'S1.0.2': 0.9, // Persuasion
            'S4.3.1': 0.8, // Initiative
            'S1.0.1': 0.7  // Communication
          }
        },
        {
          value: 'data-logic',
          label: 'Present data and logical arguments for why it works',
          clusterLikelihoods: {
            'analyst-researcher': 0.9,
            'tech-solver': 0.85,
            'organizer-coordinator': 0.7,
            'entrepreneur-persuader': 0.5,
            'helper-people': 0.4,
            'creative-maker': 0.4,
            'care-support': 0.3,
            'action-outdoor': 0.3
          },
          skillLikelihoods: {
            'S1.3.1': 0.9, // Analytical thinking
            'S1.0.2': 0.7, // Persuasion
            'S1.0.1': 0.8  // Communication
          }
        },
        {
          value: 'show-example',
          label: 'Show them a prototype or example of it working',
          clusterLikelihoods: {
            'creative-maker': 0.9,
            'tech-solver': 0.7,
            'entrepreneur-persuader': 0.7,
            'action-outdoor': 0.6,
            'helper-people': 0.5,
            'analyst-researcher': 0.5,
            'organizer-coordinator': 0.5,
            'care-support': 0.4
          },
          skillLikelihoods: {
            'S3.4.5': 0.8, // Creativity
            'S1.0.2': 0.7 // Persuasion
          }
        },
        {
          value: 'understand-concerns',
          label: 'First understand their concerns, then address them',
          clusterLikelihoods: {
            'helper-people': 0.85,
            'care-support': 0.85,
            'organizer-coordinator': 0.7,
            'entrepreneur-persuader': 0.6,
            'tech-solver': 0.5,
            'analyst-researcher': 0.5,
            'creative-maker': 0.5,
            'action-outdoor': 0.4
          },
          skillLikelihoods: {
            'S2.2.1': 0.9, // Empathy
            'S1.0.1': 0.8, // Communication
            'S1.0.2': 0.7  // Persuasion
          }
        }
      ],
      targetSkills: ['S1.0.2', 'S4.3.1'],
      targetClusters: ['entrepreneur-persuader', 'analyst-researcher', 'creative-maker'],
      difficulty: 3
    },
    
    // ========================================================================
    // Problem Solving & Analytical
    // ========================================================================
    {
      question_id: 'stage2_problem_01',
      type: 'multiple-choice',
      text: 'Something isn\'t working as expected. What\'s your first instinct?',
      options: [
        {
          value: 'try-different-approaches',
          label: 'Try different approaches until something works',
          clusterLikelihoods: {
            'creative-maker': 0.85,
            'action-outdoor': 0.75,
            'entrepreneur-persuader': 0.7,
            'tech-solver': 0.6,
            'helper-people': 0.5,
            'care-support': 0.4,
            'organizer-coordinator': 0.4,
            'analyst-researcher': 0.3
          },
          skillLikelihoods: {
            'S4.3.1': 0.8, // Initiative
            'S1.3.3': 0.7, // Problem solving
            'S3.4.5': 0.7  // Creativity
          }
        },
        {
          value: 'investigate-systematically',
          label: 'Investigate systematically to find the root cause',
          clusterLikelihoods: {
            'analyst-researcher': 0.9,
            'tech-solver': 0.9,
            'organizer-coordinator': 0.7,
            'creative-maker': 0.5,
            'entrepreneur-persuader': 0.5,
            'helper-people': 0.4,
            'care-support': 0.4,
            'action-outdoor': 0.3
          },
          skillLikelihoods: {
            'S1.3.1': 0.9, // Analytical thinking
            'S1.3.3': 0.9, // Problem solving
            'S3.2.1': 0.6  // Technical skills
          }
        },
        {
          value: 'ask-for-help',
          label: 'Ask someone with experience or look it up',
          clusterLikelihoods: {
            'helper-people': 0.8,
            'organizer-coordinator': 0.7,
            'care-support': 0.7,
            'tech-solver': 0.6,
            'action-outdoor': 0.5,
            'entrepreneur-persuader': 0.5,
            'creative-maker': 0.5,
            'analyst-researcher': 0.5
          },
          skillLikelihoods: {
            'S1.0.1': 0.7, // Communication
            'S3.1.1': 0.8, // Learning
            'S9.2.1': 0.7  // Teamwork
          }
        },
        {
          value: 'take-break-fresh',
          label: 'Take a break and come back with fresh eyes',
          clusterLikelihoods: {
            'creative-maker': 0.75,
            'analyst-researcher': 0.7,
            'care-support': 0.6,
            'helper-people': 0.6,
            'tech-solver': 0.6,
            'organizer-coordinator': 0.5,
            'entrepreneur-persuader': 0.4,
            'action-outdoor': 0.5
          },
          skillLikelihoods: {
            'S2.1.1': 0.8, // Self-awareness
            'S1.3.3': 0.6, // Problem solving
            'S2.1.3': 0.7  // Stress management
          }
        }
      ],
      targetSkills: ['S1.3.3', 'S1.3.1', 'S4.3.1'],
      targetClusters: ['analyst-researcher', 'tech-solver', 'creative-maker'],
      difficulty: 2
    },
    
    {
      question_id: 'stage2_problem_02',
      type: 'scale',
      text: 'How confident are you with numbers, data, or calculations?',
      description: 'Rate from 1 (not confident) to 5 (very confident)',
      options: [
        { value: '1', label: '1 - Not confident', skillLikelihoods: {} },
        { value: '2', label: '2', skillLikelihoods: {} },
        { value: '3', label: '3 - Somewhat confident', skillLikelihoods: {} },
        { value: '4', label: '4', skillLikelihoods: {} },
        { value: '5', label: '5 - Very confident', skillLikelihoods: {} }
      ],
      targetSkills: ['S3.2.3', 'S1.3.1'], // Numeracy, analytical thinking
      targetClusters: ['analyst-researcher', 'tech-solver', 'organizer-coordinator'],
      difficulty: 1
    },
    
    // ========================================================================
    // Organization & Planning
    // ========================================================================
    {
      question_id: 'stage2_org_01',
      type: 'multiple-choice',
      text: 'You have multiple tasks with the same deadline. How do you handle it?',
      options: [
        {
          value: 'list-prioritize',
          label: 'Make a list and prioritize by importance',
          clusterLikelihoods: {
            'organizer-coordinator': 0.9,
            'analyst-researcher': 0.75,
            'tech-solver': 0.7,
            'care-support': 0.6,
            'helper-people': 0.6,
            'entrepreneur-persuader': 0.5,
            'creative-maker': 0.4,
            'action-outdoor': 0.4
          },
          skillLikelihoods: {
            'S4.1.1': 0.9, // Organization
            'S4.1.2': 0.9, // Time management
            'S4.1.3': 0.8  // Planning
          }
        },
        {
          value: 'tackle-hardest',
          label: 'Tackle the hardest one first while I have energy',
          clusterLikelihoods: {
            'entrepreneur-persuader': 0.8,
            'tech-solver': 0.75,
            'action-outdoor': 0.7,
            'creative-maker': 0.6,
            'analyst-researcher': 0.6,
            'organizer-coordinator': 0.5,
            'helper-people': 0.5,
            'care-support': 0.5
          },
          skillLikelihoods: {
            'S4.3.1': 0.8, // Initiative
            'S4.1.2': 0.7, // Time management
            'S2.1.2': 0.7  // Self-motivation
          }
        },
        {
          value: 'start-quick-wins',
          label: 'Start with quick wins to build momentum',
          clusterLikelihoods: {
            'action-outdoor': 0.8,
            'entrepreneur-persuader': 0.75,
            'creative-maker': 0.7,
            'helper-people': 0.6,
            'organizer-coordinator': 0.6,
            'tech-solver': 0.5,
            'care-support': 0.5,
            'analyst-researcher': 0.4
          },
          skillLikelihoods: {
            'S4.1.2': 0.8, // Time management
            'S4.3.1': 0.7, // Initiative
            'S2.1.2': 0.7  // Self-motivation
          }
        },
        {
          value: 'delegate-collaborate',
          label: 'See if I can delegate or collaborate on some',
          clusterLikelihoods: {
            'entrepreneur-persuader': 0.85,
            'organizer-coordinator': 0.8,
            'helper-people': 0.75,
            'care-support': 0.6,
            'tech-solver': 0.5,
            'analyst-researcher': 0.4,
            'creative-maker': 0.5,
            'action-outdoor': 0.5
          },
          skillLikelihoods: {
            'S9.2.1': 0.8, // Teamwork
            'S9.3.1': 0.7, // Leadership
            'S4.1.2': 0.7  // Time management
          }
        }
      ],
      targetSkills: ['S4.1.1', 'S4.1.2', 'S4.1.3'],
      targetClusters: ['organizer-coordinator', 'entrepreneur-persuader'],
      difficulty: 2
    },
    
    {
      question_id: 'stage2_org_02',
      type: 'scale',
      text: 'How good are you at keeping track of details and deadlines?',
      description: 'Rate from 1 (struggle with this) to 5 (excellent at this)',
      options: [
        { value: '1', label: '1 - Struggle with this', skillLikelihoods: {} },
        { value: '2', label: '2', skillLikelihoods: {} },
        { value: '3', label: '3 - Decent', skillLikelihoods: {} },
        { value: '4', label: '4', skillLikelihoods: {} },
        { value: '5', label: '5 - Excellent', skillLikelihoods: {} }
      ],
      targetSkills: ['S4.1.1', 'S4.1.2'], // Organization, time management
      targetClusters: ['organizer-coordinator', 'analyst-researcher'],
      difficulty: 1
    },
    
    // ========================================================================
    // Technical & Digital
    // ========================================================================
    {
      question_id: 'stage2_tech_01',
      type: 'multiple-choice',
      text: 'How comfortable are you learning new technology or software?',
      options: [
        {
          value: 'love-it',
          label: 'I love it - excited to explore and figure it out',
          clusterLikelihoods: {
            'tech-solver': 0.9,
            'creative-maker': 0.7,
            'entrepreneur-persuader': 0.6,
            'analyst-researcher': 0.7,
            'helper-people': 0.4,
            'organizer-coordinator': 0.5,
            'care-support': 0.3,
            'action-outdoor': 0.4
          },
          skillLikelihoods: {
            'S3.2.1': 0.9, // Computer use
            'S3.2.2': 0.8, // Digital literacy
            'S3.1.1': 0.8  // Learning ability
          }
        },
        {
          value: 'fine-if-needed',
          label: 'Fine with it if I need it for work',
          clusterLikelihoods: {
            'organizer-coordinator': 0.8,
            'helper-people': 0.7,
            'care-support': 0.7,
            'analyst-researcher': 0.6,
            'tech-solver': 0.6,
            'entrepreneur-persuader': 0.6,
            'creative-maker': 0.6,
            'action-outdoor': 0.5
          },
          skillLikelihoods: {
            'S3.2.1': 0.6, // Computer use
            'S3.1.1': 0.7, // Learning ability
            'S4.3.2': 0.7  // Adaptability
          }
        },
        {
          value: 'prefer-minimal',
          label: 'I can do basics, but prefer minimal tech work',
          clusterLikelihoods: {
            'action-outdoor': 0.8,
            'creative-maker': 0.6,
            'care-support': 0.6,
            'helper-people': 0.5,
            'entrepreneur-persuader': 0.4,
            'organizer-coordinator': 0.4,
            'tech-solver': 0.2,
            'analyst-researcher': 0.2
          },
          skillLikelihoods: {
            'S3.2.1': 0.4, // Computer use
            'S3.4.3': 0.7  // Physical work
          }
        },
        {
          value: 'find-it-challenging',
          label: 'I find it challenging but can learn with help',
          clusterLikelihoods: {
            'care-support': 0.7,
            'action-outdoor': 0.6,
            'helper-people': 0.6,
            'creative-maker': 0.5,
            'organizer-coordinator': 0.5,
            'entrepreneur-persuader': 0.4,
            'tech-solver': 0.2,
            'analyst-researcher': 0.3
          },
          skillLikelihoods: {
            'S3.1.1': 0.7, // Learning ability
            'S2.1.1': 0.6, // Self-awareness
            'S9.2.1': 0.6  // Teamwork
          }
        }
      ],
      targetSkills: ['S3.2.1', 'S3.2.2'],
      targetClusters: ['tech-solver', 'analyst-researcher', 'creative-maker'],
      difficulty: 2
    },
    
    {
      question_id: 'stage2_tech_02',
      type: 'scale',
      text: 'Rate your experience creating digital content (posts, videos, graphics, etc.)',
      description: 'Rate from 1 (no experience) to 5 (do it regularly)',
      options: [
        { value: '1', label: '1 - No experience', skillLikelihoods: {} },
        { value: '2', label: '2', skillLikelihoods: {} },
        { value: '3', label: '3 - Some experience', skillLikelihoods: {} },
        { value: '4', label: '4', skillLikelihoods: {} },
        { value: '5', label: '5 - Do it regularly', skillLikelihoods: {} }
      ],
      targetSkills: ['S3.2.2', 'S3.4.5'], // Digital literacy, creativity
      targetClusters: ['creative-maker', 'entrepreneur-persuader', 'tech-solver'],
      difficulty: 1
    },
    
    // ========================================================================
    // Creativity & Innovation
    // ========================================================================
    {
      question_id: 'stage2_creative_01',
      type: 'multiple-choice',
      text: 'When given a creative project or open-ended task, how do you approach it?',
      options: [
        {
          value: 'brainstorm-wild',
          label: 'Brainstorm lots of wild ideas first, narrow down later',
          clusterLikelihoods: {
            'creative-maker': 0.9,
            'entrepreneur-persuader': 0.8,
            'tech-solver': 0.5,
            'helper-people': 0.5,
            'action-outdoor': 0.6,
            'analyst-researcher': 0.3,
            'organizer-coordinator': 0.4,
            'care-support': 0.4
          },
          skillLikelihoods: {
            'S3.4.5': 0.9, // Creativity
            'S1.3.2': 0.7, // Innovation
            'S4.3.1': 0.7  // Initiative
          }
        },
        {
          value: 'research-examples',
          label: 'Research existing examples and build on what works',
          clusterLikelihoods: {
            'analyst-researcher': 0.9,
            'tech-solver': 0.8,
            'organizer-coordinator': 0.7,
            'creative-maker': 0.6,
            'helper-people': 0.5,
            'entrepreneur-persuader': 0.5,
            'care-support': 0.5,
            'action-outdoor': 0.4
          },
          skillLikelihoods: {
            'S1.3.1': 0.8, // Analytical thinking
            'S3.1.1': 0.8, // Learning
            'S3.4.5': 0.6  // Creativity
          }
        },
        {
          value: 'hands-on-iterate',
          label: 'Start making something and iterate as I go',
          clusterLikelihoods: {
            'creative-maker': 0.9,
            'action-outdoor': 0.75,
            'tech-solver': 0.7,
            'entrepreneur-persuader': 0.7,
            'helper-people': 0.5,
            'analyst-researcher': 0.4,
            'organizer-coordinator': 0.5,
            'care-support': 0.4
          },
          skillLikelihoods: {
            'S3.4.5': 0.8, // Creativity
            'S4.3.1': 0.8  // Initiative
          }
        },
        {
          value: 'ask-preferences',
          label: 'Ask what people want and design for their needs',
          clusterLikelihoods: {
            'helper-people': 0.9,
            'care-support': 0.85,
            'entrepreneur-persuader': 0.7,
            'organizer-coordinator': 0.7,
            'creative-maker': 0.6,
            'tech-solver': 0.5,
            'analyst-researcher': 0.5,
            'action-outdoor': 0.4
          },
          skillLikelihoods: {
            'S2.2.1': 0.8, // Empathy
            'S1.0.1': 0.8, // Communication
            'S3.4.5': 0.6  // Creativity
          }
        }
      ],
      targetSkills: ['S3.4.5', 'S1.3.2'],
      targetClusters: ['creative-maker', 'analyst-researcher', 'entrepreneur-persuader'],
      difficulty: 3
    },
    
    // ========================================================================
    // Physical & Practical Skills
    // ========================================================================
    {
      question_id: 'stage2_physical_01',
      type: 'scale',
      text: 'How comfortable are you with hands-on, physical tasks (such as using tools)?',
      description: 'Rate from 1 (prefer not to) to 5 (love physical work)',
      options: [
        { value: '1', label: '1 - Prefer not to', skillLikelihoods: {} },
        { value: '2', label: '2', skillLikelihoods: {} },
        { value: '3', label: '3 - It\'s okay', skillLikelihoods: {} },
        { value: '4', label: '4', skillLikelihoods: {} },
        { value: '5', label: '5 - Love physical work', skillLikelihoods: {} }
      ],
      targetSkills: ['S3.4.3', 'S3.4.4'], // Physical stamina, manual dexterity
      targetClusters: ['action-outdoor', 'creative-maker'],
      difficulty: 1
    },
    
    {
      question_id: 'stage2_physical_02',
      type: 'multiple-choice',
      text: 'Have you done any of these types of activities?',
      description: 'Select the one that you have the most experience with',
      options: [
        {
          value: 'sports-fitness',
          label: 'Sports, fitness training, or coaching',
          clusterLikelihoods: {
            'action-outdoor': 0.9,
            'helper-people': 0.6,
            'entrepreneur-persuader': 0.6,
            'care-support': 0.5,
            'creative-maker': 0.4,
            'organizer-coordinator': 0.5,
            'tech-solver': 0.3,
            'analyst-researcher': 0.2
          },
          skillLikelihoods: {
            'S3.4.3': 0.9, // Physical stamina
            'S9.2.1': 0.7, // Teamwork
            'S2.1.2': 0.8  // Self-discipline
          }
        },
        {
          value: 'building-fixing',
          label: 'Building, fixing, or assembling things',
          clusterLikelihoods: {
            'creative-maker': 0.9,
            'action-outdoor': 0.7,
            'tech-solver': 0.6,
            'entrepreneur-persuader': 0.4,
            'analyst-researcher': 0.4,
            'helper-people': 0.3,
            'organizer-coordinator': 0.4,
            'care-support': 0.3
          },
          skillLikelihoods: {
            'S3.4.4': 0.9, // Manual dexterity
            'P3.1.1': 0.8, // Practical skills
            'S1.3.3': 0.7  // Problem solving
          }
        },
        {
          value: 'performing-arts',
          label: 'Performing arts, music, or dance',
          clusterLikelihoods: {
            'creative-maker': 0.9,
            'entrepreneur-persuader': 0.6,
            'helper-people': 0.5,
            'action-outdoor': 0.5,
            'care-support': 0.4,
            'organizer-coordinator': 0.4,
            'tech-solver': 0.3,
            'analyst-researcher': 0.2
          },
          skillLikelihoods: {
            'S3.4.5': 0.9, // Creativity
            'S2.1.2': 0.6  // Self-discipline
          }
        },
        {
          value: 'none-of-these',
          label: 'None of these really',
          clusterLikelihoods: {
            'analyst-researcher': 0.7,
            'tech-solver': 0.6,
            'organizer-coordinator': 0.6,
            'care-support': 0.6,
            'helper-people': 0.5,
            'entrepreneur-persuader': 0.5,
            'creative-maker': 0.4,
            'action-outdoor': 0.3
          },
          skillLikelihoods: {}
        }
      ],
      targetSkills: ['S3.4.3', 'S3.4.5'],
      targetClusters: ['action-outdoor', 'creative-maker'],
      difficulty: 1
    },
    
    // ========================================================================
    // Leadership & Initiative
    // ========================================================================
    {
      question_id: 'stage2_leadership_01',
      type: 'multiple-choice',
      text: 'In group situations, what role do you naturally take?',
      options: [
        {
          value: 'lead-organize',
          label: 'I often end up leading or organizing things',
          clusterLikelihoods: {
            'entrepreneur-persuader': 0.9,
            'organizer-coordinator': 0.85,
            'helper-people': 0.6,
            'action-outdoor': 0.6,
            'tech-solver': 0.4,
            'creative-maker': 0.5,
            'care-support': 0.5,
            'analyst-researcher': 0.3
          },
          skillLikelihoods: {
            'S9.3.1': 0.9, // Leadership
            'S4.1.3': 0.8, // Planning
            'S4.3.1': 0.8  // Initiative
          }
        },
        {
          value: 'contribute-ideas',
          label: 'I contribute ideas and help make decisions',
          clusterLikelihoods: {
            'creative-maker': 0.8,
            'tech-solver': 0.8,
            'entrepreneur-persuader': 0.75,
            'analyst-researcher': 0.7,
            'helper-people': 0.7,
            'organizer-coordinator': 0.7,
            'care-support': 0.6,
            'action-outdoor': 0.6
          },
          skillLikelihoods: {
            'S3.4.5': 0.7, // Creativity
            'S9.2.1': 0.8, // Teamwork
            'S4.3.1': 0.7  // Initiative
          }
        },
        {
          value: 'support-execute',
          label: 'I support others and help execute the plan',
          clusterLikelihoods: {
            'helper-people': 0.85,
            'care-support': 0.85,
            'organizer-coordinator': 0.7,
            'action-outdoor': 0.7,
            'tech-solver': 0.6,
            'analyst-researcher': 0.5,
            'creative-maker': 0.5,
            'entrepreneur-persuader': 0.4
          },
          skillLikelihoods: {
            'S9.2.1': 0.9, // Teamwork
            'S4.1.1': 0.7, // Organization
            'S2.2.1': 0.7  // Empathy
          }
        },
        {
          value: 'observe-analyze',
          label: 'I observe, analyze, and contribute when needed',
          clusterLikelihoods: {
            'analyst-researcher': 0.9,
            'tech-solver': 0.8,
            'creative-maker': 0.6,
            'organizer-coordinator': 0.5,
            'care-support': 0.5,
            'helper-people': 0.4,
            'entrepreneur-persuader': 0.3,
            'action-outdoor': 0.4
          },
          skillLikelihoods: {
            'S1.3.1': 0.9, // Analytical thinking
            'S9.2.1': 0.6, // Teamwork
            'S2.1.1': 0.7  // Self-awareness
          }
        }
      ],
      targetSkills: ['S9.3.1', 'S9.2.1', 'S4.3.1'], // TODO WHAT
      targetClusters: ['entrepreneur-persuader', 'organizer-coordinator', 'helper-people'],
      difficulty: 2
    },
    
    {
      question_id: 'stage2_leadership_02',
      type: 'scale',
      text: 'How comfortable are you starting projects or activities without being asked?',
      description: 'Rate from 1 (prefer to be assigned) to 5 (love taking initiative)',
      options: [
        { value: '1', label: '1 - Prefer to be assigned', skillLikelihoods: {} },
        { value: '2', label: '2', skillLikelihoods: {} },
        { value: '3', label: '3 - Sometimes', skillLikelihoods: {} },
        { value: '4', label: '4', skillLikelihoods: {} },
        { value: '5', label: '5 - Love taking initiative', skillLikelihoods: {} }
      ],
      targetSkills: ['S4.3.1', 'S9.3.1'], // Initiative, leadership
      targetClusters: ['entrepreneur-persuader', 'creative-maker', 'action-outdoor'],
      difficulty: 2
    },
    
    // ========================================================================
    // Empathy & Care
    // ========================================================================
    {
      question_id: 'stage2_care_01',
      type: 'scale',
      text: 'How much do you enjoy helping or caring for others?',
      description: 'Rate from 1 (not my strength) to 5 (deeply fulfilling)',
      options: [
        { value: '1', label: '1 - Not my strength', skillLikelihoods: {} },
        { value: '2', label: '2', skillLikelihoods: {} },
        { value: '3', label: '3 - It\'s okay', skillLikelihoods: {} },
        { value: '4', label: '4', skillLikelihoods: {} },
        { value: '5', label: '5 - Deeply fulfilling', skillLikelihoods: {} }
      ],
      targetSkills: ['S2.2.1', 'S9.2.2'], // Empathy, caring
      targetClusters: ['care-support', 'helper-people'],
      difficulty: 1
    },
    
    {
      question_id: 'stage2_care_02',
      type: 'multiple-choice',
      text: 'Someone is going through a tough time. How do you naturally respond?',
      options: [
        {
          value: 'listen-be-there',
          label: 'Just listen and be there for them emotionally',
          clusterLikelihoods: {
            'care-support': 0.95,
            'helper-people': 0.9,
            'organizer-coordinator': 0.5,
            'entrepreneur-persuader': 0.4,
            'creative-maker': 0.5,
            'tech-solver': 0.3,
            'analyst-researcher': 0.3,
            'action-outdoor': 0.4
          },
          skillLikelihoods: {
            'S2.2.1': 0.95, // Empathy
            'S1.0.1': 0.8,  // Communication
            'S2.2.2': 0.9   // Active listening
          }
        },
        {
          value: 'offer-solutions',
          label: 'Offer practical solutions or help fix the problem',
          clusterLikelihoods: {
            'tech-solver': 0.85,
            'organizer-coordinator': 0.8,
            'entrepreneur-persuader': 0.75,
            'action-outdoor': 0.7,
            'analyst-researcher': 0.7,
            'helper-people': 0.6,
            'creative-maker': 0.6,
            'care-support': 0.5
          },
          skillLikelihoods: {
            'S1.3.3': 0.8, // Problem solving
            'S4.3.1': 0.7, // Initiative
            'S9.2.2': 0.6  // Helping
          }
        },
        {
          value: 'encourage-perspective',
          label: 'Encourage them and help them see different perspectives',
          clusterLikelihoods: {
            'helper-people': 0.85,
            'entrepreneur-persuader': 0.8,
            'care-support': 0.75,
            'organizer-coordinator': 0.6,
            'tech-solver': 0.5,
            'creative-maker': 0.6,
            'analyst-researcher': 0.5,
            'action-outdoor': 0.5
          },
          skillLikelihoods: {
            'S2.2.1': 0.8, // Empathy
            'S1.0.1': 0.8, // Communication
            'S1.0.2': 0.7  // Persuasion
          }
        },
        {
          value: 'distract-cheer-up',
          label: 'Try to distract them or cheer them up',
          clusterLikelihoods: {
            'action-outdoor': 0.75,
            'creative-maker': 0.7,
            'entrepreneur-persuader': 0.7,
            'helper-people': 0.6,
            'care-support': 0.5,
            'organizer-coordinator': 0.4,
            'tech-solver': 0.4,
            'analyst-researcher': 0.3
          },
          skillLikelihoods: {
            'S9.2.2': 0.7, // Helping
            'S1.0.1': 0.6, // Communication
            'S3.4.5': 0.6  // Creativity
          }
        }
      ],
      targetSkills: ['S2.2.1', 'S2.2.2'],
      targetClusters: ['care-support', 'helper-people', 'tech-solver'],
      difficulty: 2
    },
    
    // ========================================================================
    // Adaptability & Learning
    // ========================================================================
    {
      question_id: 'stage2_adapt_01',
      type: 'multiple-choice',
      text: 'Plans change suddenly. How do you react?',
      options: [
        {
          value: 'excited-opportunity',
          label: 'Excited - new opportunities!',
          clusterLikelihoods: {
            'entrepreneur-persuader': 0.9,
            'creative-maker': 0.85,
            'action-outdoor': 0.8,
            'helper-people': 0.5,
            'tech-solver': 0.5,
            'organizer-coordinator': 0.3,
            'analyst-researcher': 0.3,
            'care-support': 0.4
          },
          skillLikelihoods: {
            'S4.3.2': 0.9, // Adaptability
            'S4.3.1': 0.8, // Initiative
            'S3.4.5': 0.7  // Creativity
          }
        },
        {
          value: 'fine-adjust',
          label: 'Fine - I can adjust and figure it out',
          clusterLikelihoods: {
            'helper-people': 0.8,
            'tech-solver': 0.75,
            'organizer-coordinator': 0.7,
            'care-support': 0.7,
            'entrepreneur-persuader': 0.7,
            'creative-maker': 0.7,
            'analyst-researcher': 0.6,
            'action-outdoor': 0.7
          },
          skillLikelihoods: {
            'S4.3.2': 0.8, // Adaptability
            'S1.3.3': 0.7, // Problem solving
            'S2.1.3': 0.6  // Stress management
          }
        },
        {
          value: 'bit-stressed',
          label: 'Bit stressed but I manage',
          clusterLikelihoods: {
            'organizer-coordinator': 0.8,
            'analyst-researcher': 0.75,
            'care-support': 0.7,
            'tech-solver': 0.6,
            'helper-people': 0.6,
            'creative-maker': 0.5,
            'entrepreneur-persuader': 0.4,
            'action-outdoor': 0.5
          },
          skillLikelihoods: {
            'S2.1.1': 0.8, // Self-awareness
            'S2.1.3': 0.7, // Stress management
            'S4.3.2': 0.6  // Adaptability
          }
        },
        {
          value: 'prefer-stick-plan',
          label: 'Prefer to stick to the original plan if possible',
          clusterLikelihoods: {
            'organizer-coordinator': 0.85,
            'analyst-researcher': 0.8,
            'care-support': 0.6,
            'tech-solver': 0.6,
            'helper-people': 0.5,
            'creative-maker': 0.3,
            'entrepreneur-persuader': 0.2,
            'action-outdoor': 0.4
          },
          skillLikelihoods: {
            'S4.1.3': 0.8, // Planning
            'S4.1.1': 0.7, // Organization
            'S2.1.1': 0.6  // Self-awareness
          }
        }
      ],
      targetSkills: ['S4.3.2', 'S2.1.3'],
      targetClusters: ['entrepreneur-persuader', 'creative-maker', 'organizer-coordinator'],
      difficulty: 2
    },
    
    {
      question_id: 'stage2_adapt_02',
      type: 'scale',
      text: 'How quickly do you typically learn new skills?',
      description: 'Rate from 1 (takes me a while) to 5 (pick things up quickly)',
      options: [
        { value: '1', label: '1 - Takes me a while', skillLikelihoods: {} },
        { value: '2', label: '2', skillLikelihoods: {} },
        { value: '3', label: '3 - Average', skillLikelihoods: {} },
        { value: '4', label: '4', skillLikelihoods: {} },
        { value: '5', label: '5 - Pick things up quickly', skillLikelihoods: {} }
      ],
      targetSkills: ['S3.1.1', 'S4.3.2'], // Learning ability, adaptability
      targetClusters: ['tech-solver', 'creative-maker', 'entrepreneur-persuader'],
      difficulty: 1
    }
  ];
}

/**
 * Filter questions by difficulty for pacing
 */
export function filterQuestionsByDifficulty(
  questions: AdaptiveQuestion[],
  minDifficulty: number,
  maxDifficulty: number
): AdaptiveQuestion[] {
  return questions.filter(q => {
    const diff = q.difficulty || 2;
    return diff >= minDifficulty && diff <= maxDifficulty;
  });
}

/**
 * Get questions that target specific clusters
 */
export function getQuestionsForClusters(
  questions: AdaptiveQuestion[],
  targetClusters: string[]
): AdaptiveQuestion[] {
  return questions.filter(q => {
    if (!q.targetClusters || q.targetClusters.length === 0) return true;
    return q.targetClusters.some(cluster => targetClusters.includes(cluster));
  });
}
