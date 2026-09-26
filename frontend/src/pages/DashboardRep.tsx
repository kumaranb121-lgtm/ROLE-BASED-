import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useSocketStore } from '../stores/socketStore';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BookOpen, Users, RefreshCw, FileText, Bell, MessageSquare, CalendarCheck, Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function DashboardRep() {
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  const [repClass, setRepClass] = useState<any>(null);
  const [todayTimetable, setTodayTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.role === 'CLASS_REPRESENTATIVE') {
          // Find class for rep
          const [timetablesRes, notifRes] = await Promise.all([
            api.get('/timetables'),
            api.get('/notifications')
          ]);
          
          setNotifications(notifRes.data.filter((n: any) => !n.isRead));
          const allTimetables = timetablesRes.data;
          
          const uniqueClasses = Array.from(new Set(allTimetables.map((t: any) => t.classId?._id)))
            .map(id => allTimetables.find((t: any) => t.classId?._id === id)?.classId)
            .filter(Boolean) as any[];
            
          const yearMatch = user.name.split(' ')[0]; // "1st", "2nd", etc
          const foundClass = uniqueClasses.find(c => c.year === yearMatch);
          
          if (foundClass) {
            setRepClass(foundClass);
            
            // Get today's day string (e.g. MON)
            const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            let currentDay = days[new Date().getDay()];
            if (currentDay === 'SUN' || currentDay === 'SAT') currentDay = 'MON'; // fallback for weekends
            
            // Filter today's timetable
            const todayClassTimetable = allTimetables
              .filter((t: any) => t.classId?._id === foundClass._id && t.day === currentDay && !t.isBreak)
              .sort((a: any, b: any) => a.period - b.period);
              
            setTodayTimetable(todayClassTimetable);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('new_notification', (data) => {
        setNotifications((prev) => [data, ...prev]);
      });

      return () => {
        socket.off('new_notification');
      };
    }
  }, [socket]);

  const stats = [
    { label: 'Total Subjects Today', value: todayTimetable.length.toString(), icon: BookOpen, color: 'text-[#01949a]' },
    { label: 'Total Students', value: '62', icon: Users, color: 'text-[#01949a]' }, // Keeping static until student endpoint available
    { label: 'Substitutions This Week', value: '0', icon: RefreshCw, color: 'text-[#01949a]' },
    { label: 'Leave Requests', value: '0', icon: FileText, color: 'text-[#01949a]' },
  ];

  const quickActions = [
    { label: 'My Timetable', icon: BookOpen, path: '/my-timetable' },
    { label: 'Request Substitution', icon: RefreshCw, path: '/substitutions' },
    { label: 'Apply Leave', icon: FileText, path: '/leaves' },
    { label: 'Send Message', icon: MessageSquare, path: '/messages' },
  ];

  const formatPeriodTime = (period: number) => {
    const times: Record<number, string> = {
      1: '08:30 - 09:20',
      2: '09:20 - 10:10',
      3: '10:10 - 11:00',
      4: '11:10 - 12:00',
      5: '12:00 - 12:50',
      6: '01:25 - 02:15',
      7: '02:15 - 03:05',
      8: '03:15 - 04:05',
    };
    return times[period] || '';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-10">
      {/* Header Section */}
      <div className="flex items-start justify-between bg-transparent">
        <div>
          <h1 className="text-[32px] font-bold text-[#017a80] leading-tight tracking-tight">
            Good Morning, {user?.name || 'First Year Rep'}
          </h1>
          <p className="text-[#01949a]/70 font-medium mt-1">Here's your class overview for today.</p>
        </div>
        <div className="hidden md:block border-l-2 border-[#01949a]/20 pl-6 py-1">
          <p className="text-[#01949a]/80 italic max-w-[200px] text-sm font-medium">
            "A well-informed class builds a better tomorrow."
          </p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* Left Column Area (65%) */}
        <div className="flex-1 space-y-8 min-w-0">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} className="border-0 shadow-sm bg-[#f4f8f3] rounded-[20px] overflow-hidden">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="p-4 rounded-full bg-white shadow-sm border border-[#dbe8d8]">
                      <Icon className={`w-7 h-7 stroke-[1.5] ${stat.color}`} />
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-[11px] text-[#017a80]/70 font-bold max-w-[80px] leading-tight mb-1">{stat.label}</p>
                      <h3 className="text-[32px] font-black text-[#017a80] tracking-tight leading-none">{stat.value}</h3>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Today's Timetable Area */}
          <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#dbe8d8] flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#01949a] pl-3 text-[#017a80]">
                Today's Timetable
              </h2>
              <Link to="/my-timetable">
                <Button className="text-xs bg-[#017a80] text-white hover:bg-[#015a60] border-0 rounded-lg shadow-sm font-bold h-8 px-4">
                  View Full Timetable →
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#015a60] text-white font-medium text-xs">
                  <tr>
                    <th className="px-6 py-3.5 whitespace-nowrap">Time</th>
                    <th className="px-6 py-3.5">Subject</th>
                    <th className="px-6 py-3.5">Faculty</th>
                    <th className="px-6 py-3.5">Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dbe8d8] bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-[#01949a]/60 font-medium">Loading schedule...</td>
                    </tr>
                  ) : todayTimetable.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-[#01949a]/60 font-medium">No classes scheduled for today!</td>
                    </tr>
                  ) : (
                    todayTimetable.map((slot, i) => (
                      <tr key={i} className="hover:bg-[#f4f8f3] transition-colors">
                        <td className="px-6 py-4 font-medium text-[#017a80] whitespace-nowrap">{formatPeriodTime(slot.period)}</td>
                        <td className="px-6 py-4 text-[#01949a]/90 font-medium">{slot.subject?.name || slot.subject?.shortName}</td>
                        <td className="px-6 py-4 text-[#01949a]/80">{slot.staff?.name || '-'}</td>
                        <td className="px-6 py-4 text-[#01949a]/80">{repClass?.classroom || 'TBA'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* My Class Info */}
            <div className="bg-[#f4f8f3] rounded-2xl border border-[#dbe8d8] shadow-sm flex flex-col overflow-hidden">
              <div className="p-5 border-b border-[#dbe8d8] bg-white">
                <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#01949a] pl-3 text-[#017a80]">
                  My Class Overview
                </h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#dbe8d8]/50">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-[#01949a]" />
                    <span className="font-bold text-[#017a80] text-sm">Year</span>
                  </div>
                  <span className="font-medium text-[#01949a] text-sm">{repClass?.year || '1st'} Year</span>
                </div>
                
                <div className="flex items-center justify-between pb-3 border-b border-[#dbe8d8]/50">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-[#01949a]" />
                    <span className="font-bold text-[#017a80] text-sm">Total Students</span>
                  </div>
                  <span className="font-medium text-[#01949a] text-sm">62</span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-[#dbe8d8]/50">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-[#01949a]" />
                    <span className="font-bold text-[#017a80] text-sm">Sections</span>
                  </div>
                  <span className="font-medium text-[#01949a] text-sm">1</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-[#01949a]" />
                    <span className="font-bold text-[#017a80] text-sm">My Role</span>
                  </div>
                  <span className="font-medium text-[#01949a] text-sm">Class Representative</span>
                </div>
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-[#f4f8f3] rounded-2xl border border-[#dbe8d8] shadow-sm flex flex-col overflow-hidden">
              <div className="p-5 border-b border-[#dbe8d8] bg-white flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#01949a] pl-3 text-[#017a80]">
                  Important Announcements
                </h2>
                <span className="text-xs font-bold text-[#01949a] cursor-pointer hover:underline">View All</span>
              </div>
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                <Megaphone className="w-10 h-10 text-[#01949a] mb-3" />
                <p className="text-[#017a80] font-bold text-sm">No announcements at the moment</p>
                <p className="text-xs text-[#01949a]/70 font-medium mt-1">Stay tuned for updates!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Area (35%) */}
        <div className="w-full xl:w-[320px] 2xl:w-[380px] shrink-0 space-y-6">
          
          {/* Calendar Widget */}
          <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#017a80] mb-4">Calendar</h2>
            <div className="bg-[#f4f8f3] rounded-xl p-4 border border-[#dbe8d8]">
              <div className="flex justify-between items-center mb-4">
                <ChevronLeft className="w-4 h-4 text-[#01949a] cursor-pointer" />
                <span className="font-bold text-[#017a80] text-sm">September 2026</span>
                <ChevronRight className="w-4 h-4 text-[#01949a] cursor-pointer" />
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-[10px] font-bold text-[#01949a]/60">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-3 text-center text-sm">
                {/* Mock calendar days for visual parity */}
                <div className="text-[#01949a]/30">30</div>
                <div className="text-[#01949a]/30">31</div>
                {[...Array(30)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`font-medium ${i + 1 === 18 ? 'bg-[#017a80] text-white rounded-md flex items-center justify-center w-7 h-7 mx-auto' : 'text-[#017a80] flex items-center justify-center w-7 h-7 mx-auto'}`}
                  >
                    {i + 1}
                  </div>
                ))}
                <div className="text-[#01949a]/30">1</div>
                <div className="text-[#01949a]/30">2</div>
                <div className="text-[#01949a]/30">3</div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-[#f4f8f3] rounded-2xl border border-[#dbe8d8] shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-[#dbe8d8] flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#01949a] pl-3 text-[#017a80]">
                Notifications
              </h2>
              <span className="text-xs font-bold text-[#01949a] cursor-pointer hover:underline">View All</span>
            </div>
            <div className="p-8 flex flex-col items-center text-center">
              <Bell className="w-10 h-10 text-[#01949a] mb-3 stroke-[1.5]" />
              {notifications.length > 0 ? (
                <>
                  <p className="text-[#017a80] font-bold text-lg">{notifications.length}</p>
                  <p className="text-xs text-[#01949a]/70 font-medium mt-1">New Notifications</p>
                </>
              ) : (
                <>
                  <p className="text-[#017a80] font-bold text-sm">No new notifications</p>
                  <p className="text-xs text-[#01949a]/70 font-medium mt-1">You're all caught up!</p>
                </>
              )}
            </div>
          </div>
          
          {/* Quick Links Grid */}
          <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#dbe8d8]">
              <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#01949a] pl-3 text-[#017a80]">
                Quick Links
              </h2>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3 bg-[#f4f8f3]">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <Link key={i} to={action.path}>
                    <Card className="border border-[#dbe8d8] bg-[#eaf2e8] hover:bg-white hover:border-[#01949a]/30 transition-all cursor-pointer rounded-xl h-full flex flex-col">
                      <CardContent className="p-4 flex flex-row items-center gap-3">
                        <Icon className="w-5 h-5 text-[#01949a]" />
                        <span className="text-xs font-bold text-[#017a80] flex-1">{action.label}</span>
                        <span className="text-[#01949a]/50 font-bold text-xs">→</span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
