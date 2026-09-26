import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Repeat, 
  FileText, 
  Layers,
  Bell, 
  MessageSquare, 
  CheckSquare,
  BarChart3,
  Menu,
  LogOut,
  UserCheck,
  GraduationCap
} from 'lucide-react';

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const { user, logout } = useAuthStore();

  const getNavItems = () => {
    switch (user?.role) {
      case 'HOD':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
          { label: 'My Timetable', icon: CalendarDays, path: '/my-timetable' },
          { label: 'Staff Timetables', icon: Users, path: '/staff-timetables' },
          { label: 'Substitutions', icon: Repeat, path: '/substitutions' },
          { label: 'Leave Requests', icon: FileText, path: '/leaves' },
          { label: 'Class Timetables', icon: Layers, path: '/class-timetables' },
          { label: 'Notifications', icon: Bell, path: '/notifications' },
          { label: 'Messages', icon: MessageSquare, path: '/messages' },
          { label: 'Attendance', icon: CheckSquare, path: '/attendance' },
          { label: 'Reports', icon: BarChart3, path: '/reports' },
        ];
      case 'STAFF':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
          { label: 'My Timetable', icon: CalendarDays, path: '/my-timetable' },
          { label: 'Substitutions', icon: Repeat, path: '/substitutions' },
          { label: 'Leave Requests', icon: FileText, path: '/leaves' },
          { label: 'Messages', icon: MessageSquare, path: '/messages' },
          { label: 'Reports', icon: BarChart3, path: '/reports' },
        ];
      case 'CLASS_REPRESENTATIVE':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
          { label: 'My Timetable', icon: CalendarDays, path: '/my-timetable' },
          { label: 'My Class', icon: GraduationCap, path: '/my-class' },
          { label: 'Class Students', icon: Users, path: '/class-students' },
          { label: 'Substitution Requests', icon: Repeat, path: '/substitutions' },
          { label: 'Leave Requests', icon: FileText, path: '/leaves' },
          { label: 'Messages', icon: MessageSquare, path: '/messages' },
        ];
      case 'STUDENT':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
          { label: 'Leave & OD', icon: FileText, path: '/leaves' },
          { label: 'Notifications', icon: Bell, path: '/notifications' },
          { label: 'Messages', icon: MessageSquare, path: '/messages' },
        ];
      default:
        return [];
    }
  };

  const getFooterText = () => {
    switch (user?.role) {
      case 'HOD':
        return ['DISCIPLINE', 'INNOVATION', 'OPPORTUNITY', 'SUCCESS'];
      case 'STAFF':
        return ['PLAN TODAY', 'TEACH TOMORROW', 'MAKE A DIFFERENCE'];
      case 'CLASS_REPRESENTATIVE':
        return ['LEARN', 'COORDINATE', 'GROW'];
      case 'STUDENT':
        return ['STUDY', 'ACHIEVE', 'SUCCEED'];
      default:
        return ['PLAN', 'COORDINATE', 'GROW'];
    }
  };

  const navItems = getNavItems();
  const footerLines = getFooterText();

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#017a80] text-[#f4f8f3] shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full bg-gradient-to-b from-white/5 to-transparent">
        {/* Logo Area */}
        <div className="h-24 flex items-center justify-center border-b border-white/5 px-4">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="College Logo" className="w-10 h-10 rounded-full object-cover shadow-sm border border-white/20" />
            <span className="font-bold tracking-[0.15em] text-sm uppercase text-[#f4f8f3]">
              {user?.role === 'HOD' ? 'HOD PANEL' : user?.role === 'STAFF' ? 'STAFF PORTAL' : user?.role === 'STUDENT' ? 'STUDENT' : 'CLASS REP'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 mt-8 overflow-y-auto hide-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#015a60] text-[#f4f8f3] shadow-md shadow-black/10' 
                    : 'text-[#f4f8f3]/60 hover:bg-[#015a60]/50 hover:text-[#f4f8f3]'
                }`
              }
            >
              <item.icon className="w-5 h-5 stroke-[1.5]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer Area */}
        <div className="p-8 mt-auto pb-10">
          <button 
            onClick={logout}
            className="flex items-center gap-3 text-[#f4f8f3]/50 hover:text-[#f4f8f3] mb-8 text-sm font-medium transition-colors w-full"
          >
            <LogOut className="w-5 h-5 stroke-[1.5]" />
            Logout
          </button>
          
          <div className="h-0.5 bg-white/10 w-8 mb-5 rounded-full" />
          <div className="text-[10px] font-bold tracking-[0.2em] text-[#f4f8f3]/40 space-y-2 uppercase">
            {footerLines.map(line => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
