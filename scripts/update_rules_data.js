const fs = require('fs');

const rulesDataCode = `export interface RuleSection {
  title: string;
  icon: string;
  points: string[];
}

export const competitionRules: RuleSection[] = [
  {
    title: '1. Eligibility & Registration',
    icon: 'UserCheck',
    points: [
      'The event is open to registered university and college students.',
      'Each participant may register only once as an individual contestant.',
      'Participants must present a valid college / student ID card upon verification.'
    ]
  },
  {
    title: '2. Event Format & Round Structure',
    icon: 'Layers',
    points: [
      'The competition consists of exactly 3 progressive rounds: Bug Hunt (Round 1), Logic Breaker (Round 2), and Code Rescue (Round 3).',
      'Each round features an authoritative, non-negotiable countdown timer.',
      'Round 1: 15 Minutes (10 Questions, 1 Mark each = 10 Marks Max).',
      'Round 2: 20 Minutes (10 Questions, 2 Marks each = 20 Marks Max).',
      'Round 3: 25 Minutes (1 Question, 5 Marks = 5 Marks Max).',
      'Total Competition: 60 Minutes, 35 Marks Maximum.'
    ]
  },
  {
    title: '3. Round Timers & Strict Isolation Policy',
    icon: 'Clock',
    points: [
      'Each round has its own authoritative countdown timer: Round 1 (15:00), Round 2 (20:00), Round 3 (25:00).',
      'Unused time from any round CANNOT and WILL NOT be carried over to subsequent rounds.',
      'When the round countdown reaches 00:00, submissions are locked and the round concludes.'
    ]
  },
  {
    title: '4. Strictly Prohibited Activities (Zero Tolerance)',
    icon: 'ShieldAlert',
    points: [
      'Use of AI assistance or code-generation tools is STRICTLY FORBIDDEN: ChatGPT, GitHub Copilot, Gemini, Claude, Cursor AI, or browser extensions.',
      'Copying code from other contestants or external online repositories is prohibited.',
      'Switching tabs, unfocusing the window, or exiting fullscreen mode is monitored and logged in real-time by Admin telemetry.'
    ]
  },
  {
    title: '5. Scoring & Evaluation',
    icon: 'Trophy',
    points: [
      'Round 1: 10 Questions × 1 Mark = 10 Marks.',
      'Round 2: 10 Questions × 2 Marks = 20 Marks.',
      'Round 3: 1 Flagship Work Order × 5 Marks = 5 Marks.',
      'Total Maximum Score: 35 Marks.',
      'The decisions of the Chief Coordinators and Technical Judges are final.'
    ]
  }
];

export const prohibitedAiTools = [
  'OpenAI ChatGPT',
  'Google Gemini',
  'Anthropic Claude',
  'GitHub Copilot',
  'Cursor / Superwhisper',
  'Other AI / LLM generation utilities'
];
`;

fs.writeFileSync('E:/projects/techastra-coderescue/src/data/rulesData.ts', rulesDataCode, 'utf8');
console.log('Successfully updated rulesData.ts');
