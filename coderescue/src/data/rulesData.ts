export interface RuleSection {
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
      'The competition consists of 3 progressive rounds: Bug Hunt (Round 1), Logic Breaker (Round 2), and Code Rescue (Round 3).',
      'Each round features a strict, non-negotiable countdown timer.',
      'Only participants who achieve the qualification threshold in a round can advance to the next round.',
      'Difficulty progresses from Basic syntax errors to Advanced multi-bug systems.'
    ]
  },
  {
    title: '3. Coding & Evaluation Standards',
    icon: 'Code',
    points: [
      'Participants must write, debug, and submit their own code within the embedded environment.',
      'Submissions are evaluated against both visible test cases and comprehensive hidden edge-case suites.',
      'Programs must adhere strictly to the specified input, output, and return types.',
      'Correctness, runtime performance, and timely submissions are primary scoring factors.'
    ]
  },
  {
    title: '4. Strictly Prohibited Activities (Zero Tolerance)',
    icon: 'ShieldAlert',
    points: [
      'Use of AI assistance or code-generation tools is STRICTLY FORBIDDEN: ChatGPT, GitHub Copilot, Gemini, Claude, Cursor AI, or any browser extensions.',
      'Copying code from other contestants or external online repositories is prohibited.',
      'Verbal or electronic communication with other participants during rounds is grounds for immediate disqualification.',
      'Switching tabs, opening unauthorized developer tools, or tampering with contest storage will be logged.'
    ]
  },
  {
    title: '5. Time Limits & Submission Policy',
    icon: 'Clock',
    points: [
      'Round 1 (Bug Hunt): 20 Minutes (10 questions, 100 points)',
      'Round 2 (Logic Breaker): 25 Minutes (5 questions, 100 points)',
      'Round 3 (Code Rescue): 40 Minutes (1 comprehensive system, 100 points)',
      'When the timer reaches 00:00, editing is disabled and current solutions are auto-finalized.',
      'No extra time is granted for late submissions.'
    ]
  },
  {
    title: '6. Scoring & Tie-Breaker Criteria',
    icon: 'Trophy',
    points: [
      'Maximum attainable score across all 3 rounds: 300 points.',
      'In case of tied total scores, earlier final submission timestamp and cumulative execution time will serve as definitive tie-breakers.',
      'The decision of event coordinators and technical judges is final and binding.'
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
