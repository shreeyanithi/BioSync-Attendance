import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Smartphone, 
  BarChart3, 
  Shield, 
  Settings, 
  HelpCircle,
  Fingerprint,
  Menu,
  X
} from 'lucide-react';
import { ViewType } from '../App';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'people', label: 'People & Enrollment', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: Calendar },
  { id: 'devices', label: 'Devices', icon: Smartphone },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'security', label: 'Security & Access', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help', label: 'Help / About', icon: HelpCircle },
] as const;

export function Sidebar({ currentView, onViewChange, isOpen, onToggle }: SidebarProps) {
  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-black text-white border-r border-gray-800 transition-all duration-300 z-50 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Toggle Button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Menu className="w-6 h-6 text-white" />
          )}
        </button>
        {isOpen && (
          <div className="flex items-center gap-1">
            <span className="text-[#1E40AF] font-bold text-xl">BIO</span>
            <span className="text-white font-bold text-xl">Sync</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative ${
                isActive 
                  ? 'bg-[#1E40AF] text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              title={!isOpen ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="font-medium">{item.label}</span>}
              
              {/* Tooltip for collapsed state */}
              {!isOpen && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="text-gray-400 text-sm space-y-0.5">
            <p className="font-medium">Enterprise Edition</p>
            <p>v2.4.0</p>
          </div>
        </div>
      )}
    </aside>
  );
}