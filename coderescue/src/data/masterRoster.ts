export interface MasterRosterEntry {
  registrationCode: string;
  name: string;
  college: string;
  department: string;
  year: string;
  venue: string;
}

export const OFFICIAL_MASTER_ROSTER: MasterRosterEntry[] = [
  {
    registrationCode: 'SYM2026-0036',
    name: 'RAMATHATCHANA M',
    college: 'R.M.D Engineering College',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0037',
    name: 'Muniyappan V',
    college: 'Simats University',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0040',
    name: 'Divagar R N',
    college: 'VelTech MultiTech Dr Rangarajan Dr Sakuntala Engineering College',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0091',
    name: 'Madhu mitha B',
    college: 'Vel Tech Multi Tech Dr Rangarajan Dr Sakhunthala Engineering College',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0100',
    name: 'Gurunathan M',
    college: 'New Prince Shri Bhavani College Engineering and Technology',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0110',
    name: 'Gunal K',
    college: 'New Prince Shri Bhavani College Engineering and Technology',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0114',
    name: 'Goutham.v',
    college: 'New Prince Shri Bhavani College Engineering and Technology',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0116',
    name: 'Abdul Kalam asath M',
    college: 'New Prince Shri Bhavani College of Engineering and Technology',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0117',
    name: 'Dinesh kumar',
    college: 'New Prince Shri Bhavani College of Engineering and Technology',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0119',
    name: 'J balaji',
    college: 'New Prince Shri Bhavani Engineering and Technology',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0120',
    name: 'Arunachalam K L',
    college: 'New Prince Shri Bhavani College of Engineering and Technology',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0142',
    name: 'Parvesh',
    college: 'Vel Tech MultiTech Dr.Rangarajan Dr.Shakunthala Engineering College',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0147',
    name: 'Praganya Dharshini D',
    college: 'Vel Tech Multi Tech Dr.Rangarajan Dr.Sakunthala Engineering College',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0152',
    name: 'Sanjay',
    college: 'Vel Tech Multi Tech Dr.Rangarajan Dr.Sakunthala Engineering College',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0157',
    name: 'Navaneeth',
    college: 'Vel Tech Multi Tech Dr Rangarajan Dr Sakunthala Engineering College',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'SYM2026-0160',
    name: 'Silambarasan.S',
    college: 'Crescent Institute of Science and Technology',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  },
  {
    registrationCode: 'CR-2026-001',
    name: 'Test Contestant Automaton',
    college: 'Dr. M.G.R. Educational and Research Institute',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    venue: 'IBM Lab • Day 1 (Oct 8, 2026)'
  }
];

export function findMasterContestant(rawToken: string): MasterRosterEntry | null {
  if (!rawToken) return null;
  const token = rawToken.trim().toUpperCase();
  const normalized = token.startsWith('SYM2026-')
    ? token
    : (/^\d+$/.test(token) ? `SYM2026-${token.padStart(4, '0')}` : token);

  return (
    OFFICIAL_MASTER_ROSTER.find(
      (m) =>
        m.registrationCode.toUpperCase() === normalized ||
        m.registrationCode.toUpperCase() === token
    ) || null
  );
}
