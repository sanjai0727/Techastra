import React from 'react';
import { CompetitionProvider, useCompetition } from './context/CompetitionContext';
import { Header } from './components/Header';
import { OrganizerModal } from './components/OrganizerModal';
import { WelcomePage } from './pages/WelcomePage';
import { RegistrationPage } from './pages/RegistrationPage';
import { RulesPage } from './pages/RulesPage';
import { RoundWorkspacePage } from './pages/RoundWorkspacePage';
import { RoundResultPage } from './pages/RoundResultPage';
import { FinalResultPage } from './pages/FinalResultPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { DisqualifiedPage } from './pages/DisqualifiedPage';
import { ProctoringShield } from './components/ProctoringShield';

const AppContent: React.FC = () => {
  const { state } = useCompetition();

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
      if (state.currentView === 'admin_dashboard') {
        return <AdminDashboardPage />;
      }
      return <DisqualifiedPage />;
    }

    switch (state.currentView) {
      case 'welcome':
        return <WelcomePage />;
      case 'registration':
        return <RegistrationPage />;
      case 'rules':
        return <RulesPage />;
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
      case 'admin_dashboard':
        return <AdminDashboardPage />;
      default:
        return <WelcomePage />;
    }
  };

  const isWorkspace = state.currentView.includes('workspace');

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#c0c0c0] text-black flex flex-col select-none font-sans text-xs">
      <Header />
      <main className={`flex-1 ${isWorkspace ? 'overflow-hidden p-0' : 'overflow-auto p-2'} bg-[#c0c0c0]`}>
        {renderView()}
      </main>
      <footer className="win95-statusbar">
        <div className="win95-status-panel flex-1 truncate">
          Techastra 2026 • Code Rescue Championship Arena • Dept of CSE
        </div>
        <div className="win95-status-panel">
          {state.currentView.toUpperCase().replace('_', ' ')}
        </div>
        <div className="win95-status-panel font-mono font-bold">
          {state.securityState?.isDisqualified ? 'DISQUALIFIED' : 'READY'}
        </div>
      </footer>
      <OrganizerModal />
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
