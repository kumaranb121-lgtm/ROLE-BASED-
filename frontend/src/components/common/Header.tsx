import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useSocketStore } from '../../stores/socketStore';
import { format } from 'date-fns';
import { Bell, Search, ChevronDown, Menu, LogOut, Calendar, Clock, User, FileText, Repeat, UserCheck, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useAuthStore();
  const socket = useSocketStore(s => s.socket);
  const [time, setTime] = useState(new Date());
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Fetch all users for search
    api.get('/users').then(res => setStaffList(res.data)).catch(console.error);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('notification', (data) => {
        setNotifications(prev => [data, ...prev]);
        // Play notification sound
        const audio = new Audio('/notification/notification.mp3');
        audio.play().catch(e => console.error('Audio play failed', e));
      });
      return () => {
        socket.off('notification');
      };
    }
  }, [socket]);

  return (
    <header className="h-24 bg-[#4A1115] border-b border-white/5 px-8 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <button onClick={toggleSidebar} className="lg:hidden text-[#FAF6F3]">
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:flex relative z-50">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#FAF6F3]/40" />
          <input
            type="text"
            placeholder="Search staff, class, subject or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-[360px] bg-[#632220]/50 border border-white/10 rounded-full pl-11 pr-4 py-2.5 text-sm text-[#FAF6F3] placeholder:text-[#FAF6F3]/40 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-[#632220] transition-all shadow-inner"
          />
          
          {/* Search Dropdown */}
          {isSearchFocused && searchQuery.length > 0 && (
            <div className="absolute top-[calc(100%+10px)] left-0 w-[450px] bg-white rounded-2xl shadow-2xl border border-[#EAE0D9] overflow-hidden">
              <div className="p-3 bg-[#FAF6F3] border-b border-[#EAE0D9]">
                <p className="text-xs font-bold text-[#7B1D23]/60 uppercase tracking-wider">Search Results</p>
              </div>
              <div className="max-h-[400px] overflow-y-auto p-2">
                
                {/* Pages Search */}
                {['Dashboard', 'My Timetable', 'Messages', 'Substitutions', 'Leaves', 'Attendance']
                  .filter(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(page => (
                    <div 
                      key={page}
                      onClick={() => navigate(page === 'Dashboard' ? '/' : `/${page.toLowerCase().replace(' ', '-')}`)}
                      className="p-3 hover:bg-[#FAF6F3] rounded-xl cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><LayoutDashboard className="w-4 h-4"/></div>
                      <div className="text-sm font-bold text-[#4A1115]">{page} Page</div>
                    </div>
                  ))}

                {/* Staff Search */}
                {staffList.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) && s._id !== user?.id)
                  .slice(0, 5)
                  .map(staff => (
                    <div 
                      key={staff._id}
                      onClick={() => navigate('/messages')} // Note: In a real app we'd pass the user ID to the messages route
                      className="p-3 hover:bg-[#FAF6F3] rounded-xl cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-xs">
                        {staff.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#4A1115]">{staff.name}</div>
                        <div className="text-xs text-[#7B1D23]/70 font-medium">{staff.role}</div>
                      </div>
                    </div>
                  ))}

                {staffList.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && 
                 ['Dashboard', 'My Timetable', 'Messages', 'Substitutions', 'Leaves', 'Attendance'].filter(p => p.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <div className="p-8 text-center text-gray-500 font-medium text-sm">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden md:flex items-center gap-6 text-[13px] text-[#FAF6F3]/80 font-bold">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 opacity-70" />
            {format(time, 'EEE, d MMM yyyy')}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 opacity-70" />
            {format(time, 'hh:mm a')}
          </div>
        </div>

        <div className="relative cursor-pointer">
          <Bell className="w-5 h-5 text-[#FAF6F3] hover:text-white transition-colors" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#d93838] rounded-full border-2 border-[#4A1115]" />
          )}
        </div>

        <div className="relative">
          <div 
            className="flex items-center gap-3 pl-6 border-l border-white/10 cursor-pointer"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="w-10 h-10 rounded-full bg-white text-[#4A1115] font-extrabold flex items-center justify-center text-sm shadow-sm border border-white/10">
              {user?.name?.substring(0, 2).toUpperCase() || 'UN'}
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-white leading-tight">{user?.name}</div>
              <div className="text-[11px] font-semibold text-[#FAF6F3]/60 uppercase tracking-wider">{user?.role}</div>
            </div>
            <ChevronDown className={`w-4 h-4 text-[#FAF6F3]/50 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-48 bg-white border border-[#EAE0D9] rounded-xl shadow-xl py-2 z-50">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-[#d93838] hover:bg-[#F2EAE5]/60 flex items-center gap-2 font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
