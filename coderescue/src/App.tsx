import React from 'react';
import { CompetitionProvider, useCompetition } from './context/CompetitionContext';
import { Header } from './components/Header';
import { WelcomePage } from './pages/WelcomePage';
import { RegistrationPage } from './pages/RegistrationPage';
import { RulesPage } from './pages/RulesPage';
import { RoundWorkspacePage } from './pages/RoundWorkspacePage';
import { RoundResultPage } from './pages/RoundResultPage';
import { FinalResultPage } from './pages/FinalResultPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { DisqualifiedPage } from './pages/DisqualifiedPage';
import { WaitingRoomPage } from './pages/WaitingRoomPage';
import { ProctoringShield } from './components/ProctoringShield';

const AppContent: React.FC = () => {
  const { state } = useCompetition();

  const isEventNotStarted = Boolean(state.schedule?.startTime && !state.schedule?.isStarted);

  const renderView = () => {
    if (state.currentView === 'disqualified') {
      return <DisqualifiedPage />;
    }

    if (state.securityState?.isDisqualified) {
      if (state.currentView === 'welcome') {
        return <WelcomePage />;
      }
      if (state.currentView === 'leaderboard') {
        return <LeaderboardPage />;
      }
      if (state.currentView === 'rules') {
        return <RulesPage />;
      }
      return <DisqualifiedPage />;
    }

    // Gatekeeper: Lock all workspace views before official event start time
    if (isEventNotStarted && (state.currentView.includes('workspace') || state.currentView === 'waiting_room')) {
      return <WaitingRoomPage />;
    }

    switch (state.currentView) {
      case 'welcome':
        return <WelcomePage />;
      case 'registration':
        return <RegistrationPage />;
      case 'rules':
        return <RulesPage />;
      case 'waiting_room':
        return <WaitingRoomPage />;
      case 'round1_workspace':
      case 'round2_workspace':
      case 'round3_workspace':
        return <RoundWorkspacePage />;
      case 'round1_result':
        return <RoundResultPage round={1} />;
      case 'round2_result':
        return <RoundResultPage round={2} />;
      case 'final_result':
        return <FinalResultPage />;
      case 'leaderboard':
        return <LeaderboardPage />;
      default:
        return <WelcomePage />;
    }
  };

  const isWorkspace = state.currentView.includes('workspace');
  const isFullBleed = isWorkspace || state.currentView === 'disqualified' || state.currentView === 'waiting_room';

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#c0c0c0] text-black flex flex-col select-none font-sans text-sm">
      <Header />
      <main className={`flex-1 ${isFullBleed ? 'overflow-hidden p-0' : 'overflow-auto p-2 sm:p-4 flex flex-col justify-start items-center'} bg-[#c0c0c0]`}>
        {renderView()}
      </main>
      <footer className="win95-statusbar">
        <div className="win95-status-panel flex-1 truncate">
          Techastra 2026 • Code Rescue Championship Arena • Dept of CSE &amp; Dept of Cyber Security
        </div>
        <div className="win95-status-panel">
          {state.currentView.toUpperCase().replace('_', ' ')}
        </div>
        <div className="win95-status-panel font-mono font-bold">
          {state.securityState?.isDisqualified ? 'DISQUALIFIED' : 'READY'}
        </div>
      </footer>
      <ProctoringShield />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CompetitionProvider>
      <AppContent />
    </CompetitionProvider>
  );
};

export default App;
