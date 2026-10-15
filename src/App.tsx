import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { PeopleView } from './components/views/PeopleView';
import { AttendanceView } from './components/views/AttendanceView';
import { DevicesView } from './components/views/DevicesView';
import { ReportsView } from './components/views/ReportsView';
import { SecurityView } from './components/views/SecurityView';
import { SettingsView } from './components/views/SettingsView';
import { HelpView } from './components/views/HelpView';

export type ViewType = 'dashboard' | 'people' | 'attendance' | 'devices' | 'reports' | 'security' | 'settings' | 'help';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'people':
        return <PeopleView />;
      case 'attendance':
        return <AttendanceView />;
      case 'devices':
        return <DevicesView />;
      case 'reports':
        return <ReportsView />;
      case 'security':
        return <SecurityView />;
      case 'settings':
        return <SettingsView />;
      case 'help':
        return <HelpView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {renderView()}
      </main>
    </div>
  );
}