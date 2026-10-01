// ============================================================================
// DEMO DATA — TECHASTRA 2026 CODE RESCUE ADMIN COMMAND CENTER
// Scored according to official 35-mark competition:
// Round 1 = 10 Marks max | Round 2 = 20 Marks max | Round 3 = 5 Marks max | Total = 35 Marks
// ============================================================================

import { Participant } from '../types';

export const DEMO_PARTICIPANTS: Participant[] = [
    {
        id: 'CR-0001',
        name: 'Aarav Sundaram',
        college: 'Dr. M.G.R. Educational and Research Institute',
        department: 'CSE',
        year: 'III',
        currentRound: 'R1',
        currentQuestion: 'Q7',
        score: 7, // 7 / 10
        totalScore: 7, // 7 / 35
        time: '08:32',
        status: 'ACTIVE',
        strikes: 0,
        lastEvent: 'Code executed: Q7 test cases passed (+1 Mark)',
        scores: { round1: 7, round2: 0, round3: 0, total: 7 },
        sessionActive: true,
        submissionsCount: 7,
        securityEventsCount: 0,
    },
    {
        id: 'CR-0002',
        name: 'Bhavani Ramesh',
        college: 'Anna University (CEG)',
        department: 'CSE',
        year: 'III',
        currentRound: 'R1',
        currentQuestion: 'Q9',
        score: 9, // 9 / 10
        totalScore: 9, // 9 / 35
        time: '03:15',
        status: 'ACTIVE',
        strikes: 1,
        lastEvent: 'Window blur detected (Strike 1)',
        scores: { round1: 9, round2: 0, round3: 0, total: 9 },
        sessionActive: true,
        submissionsCount: 9,
        securityEventsCount: 1,
    },
    {
        id: 'CR-0003',
        name: 'Chetan Karthik',
        college: 'Chennai Institute of Technology',
        department: 'IT',
        year: 'IV',
        currentRound: 'R2',
        currentQuestion: 'Q4',
        score: 6, // 6 / 20
        totalScore: 13, // 7 + 6 = 13 / 35
        time: '12:14',
        status: 'FLAGGED',
        strikes: 2,
        lastEvent: 'Fullscreen exit & Tab switch detected',
        scores: { round1: 7, round2: 6, round3: 0, total: 13 },
        sessionActive: false,
        submissionsCount: 11,
        securityEventsCount: 2,
    },
    {
        id: 'CR-0004',
        name: 'Divya Narayanan',
        college: 'SRM Institute of Science and Technology',
        department: 'CSE',
        year: 'IV',
        currentRound: 'R2',
        currentQuestion: 'Q8',
        score: 16, // 16 / 20
        totalScore: 26, // 10 + 16 = 26 / 35
        time: '07:45',
        status: 'QUALIFIED',
        strikes: 0,
        lastEvent: 'Round 2 work order Q8 passed',
        scores: { round1: 10, round2: 16, round3: 0, total: 26 },
        sessionActive: true,
        submissionsCount: 16,
        securityEventsCount: 0,
    },
    {
        id: 'CR-0005',
        name: 'Eashwar Pradeep',
        college: 'SSN College of Engineering',
        department: 'AI & DS',
        year: 'III',
        currentRound: 'R1',
        currentQuestion: 'Q4',
        score: 3, // 3 / 10
        totalScore: 3, // 3 / 35
        time: '09:20',
        status: 'ACTIVE',
        strikes: 0,
        lastEvent: 'Code submitted: SyntaxError on line 14',
        scores: { round1: 3, round2: 0, round3: 0, total: 3 },
        sessionActive: true,
        submissionsCount: 5,
        securityEventsCount: 0,
    },
    {
        id: 'CR-0006',
        name: 'Farida Begum',
        college: 'Vellore Institute of Technology (VIT)',
        department: 'ECE',
        year: 'II',
        currentRound: 'R2',
        currentQuestion: 'Q5',
        score: 10, // 10 / 20
        totalScore: 18, // 8 + 10 = 18 / 35
        time: '11:02',
        status: 'ACTIVE',
        strikes: 0,
        lastEvent: 'Code executed: Q5 mutable default resolved',
        scores: { round1: 8, round2: 10, round3: 0, total: 18 },
        sessionActive: true,
        submissionsCount: 12,
        securityEventsCount: 0,
    },
    {
        id: 'CR-0007',
        name: 'Gowtham Raj',
        college: 'PSG College of Technology',
        department: 'CSE',
        year: 'IV',
        currentRound: 'R3',
        currentQuestion: 'Q1', // R3 has ONLY Q1
        score: 5, // 5 / 5
        totalScore: 30, // 9 + 16 + 5 = 30 / 35
        time: '18:04',
        status: 'ACTIVE',
        strikes: 0,
        lastEvent: 'Flagship module rescued: all test suites verified',
        scores: { round1: 9, round2: 16, round3: 5, total: 30 },
        sessionActive: true,
        submissionsCount: 19,
        securityEventsCount: 0,
    },
    {
        id: 'CR-0008',
        name: 'Harini Balaji',
        college: 'SASTRA Deemed University',
        department: 'IT',
        year: 'III',
        currentRound: 'R1',
        currentQuestion: 'Q2',
        score: 1, // 1 / 10
        totalScore: 1, // 1 / 35
        time: '12:50',
        status: 'ELIMINATED',
        strikes: 0,
        lastEvent: 'Round 1 incomplete',
        scores: { round1: 1, round2: 0, round3: 0, total: 1 },
        sessionActive: false,
        submissionsCount: 2,
        securityEventsCount: 0,
    },
    {
        id: 'CR-0009',
        name: 'Imran Khan',
        college: 'B.S. Abdur Rahman Crescent Institute',
        department: 'CSE',
        year: 'III',
        currentRound: 'R3',
        currentQuestion: 'Q1', // R3 has ONLY Q1
        score: 4, // 4 / 5
        totalScore: 28, // 8 + 16 + 4 = 28 / 35
        time: '04:12',
        status: 'QUALIFIED',
        strikes: 0,
        lastEvent: 'Round 3 completed with 4/5 assertions passed',
        scores: { round1: 8, round2: 16, round3: 4, total: 28 },
        sessionActive: true,
        submissionsCount: 22,
        securityEventsCount: 0,
    },
    {
        id: 'CR-0010',
        name: 'Janani Venkatesh',
        college: 'Thiagarajar College of Engineering',
        department: 'CSE',
        year: 'IV',
        currentRound: 'R2',
        currentQuestion: 'Q6',
        score: 12, // 12 / 20
        totalScore: 21, // 9 + 12 = 21 / 35
        time: '09:40',
        status: 'ACTIVE',
        strikes: 0,
        lastEvent: 'Q6 target pair logic submitted',
        scores: { round1: 9, round2: 12, round3: 0, total: 21 },
        sessionActive: true,
        submissionsCount: 15,
        securityEventsCount: 0,
    },
];
