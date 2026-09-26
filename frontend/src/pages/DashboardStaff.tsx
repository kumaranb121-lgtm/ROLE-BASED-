import { useAuthStore } from '../stores/authStore';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, UserX, RefreshCw, MessageSquare, BookOpen, Clock, ChevronLeft, ChevronRight, Bell, CalendarX, FileText, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { STUDENT_DATA } from '../data/studentsData';
import api from '../services/api';

export default function DashboardStaff() {
  const { user } = useAuthStore();
  const [isPeriodActive, setIsPeriodActive] = useState(true);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  
  // Track attendance state for 2nd year students
  const [attendanceState, setAttendanceState] = useState<{ [rollNo: string]: boolean }>(
    STUDENT_DATA['2nd'].reduce((acc, student) => {
      acc[student.rollNo] = true; // Default to present
      return acc;
    }, {} as { [rollNo: string]: boolean })
  );

  const handleToggleAttendance = (rollNo: string) => {
    setAttendanceState(prev => ({ ...prev, [rollNo]: !prev[rollNo] }));
  };

  const handleSubmitAttendance = async () => {
    const presentCount = Object.values(attendanceState).filter(v => v).length;
    const absentCount = Object.values(attendanceState).filter(v => !v).length;
    const absentRollNos = Object.entries(attendanceState).filter(([_, v]) => !v).map(([k, _]) => k);
    
    try {
      await api.post('/attendance', {
        classId: '2nd Year CSBS',
        timetableSlot: 'Period 1 (08:30 - 09:20)',
        date: new Date().toISOString(),
        presentCount,
        absentCount,
        absentRollNos
      });
      alert('Attendance marked successfully!');
      setShowAttendanceModal(false);
      setIsPeriodActive(false); // Close it after submission
    } catch (err) {
      console.error(err);
      alert('Failed to submit attendance');
    }
  };

  const stats = [
    { label: "Today's Classes", value: '4', desc: 'Scheduled', icon: Calendar, color: 'bg-[#eaf2e8] text-[#01949a]' },
    { label: 'Total Classes (Week)', value: '18', desc: 'Including labs', icon: BookOpen, color: 'bg-[#eaf2e8] text-[#01949a]' },
    { label: 'Substitutions', value: '0', desc: 'Active', icon: RefreshCw, color: 'bg-[#eaf2e8] text-[#01949a]' },
    { label: 'Leave Status', value: '0', desc: 'Pending', icon: UserX, color: 'bg-[#eaf2e8] text-[#01949a]' },
  ];

  const schedule = [
    { time: '08:30 - 09:20', class: '2nd Year CSBS', subject: 'Data Structures', room: 'CS-204', type: 'Theory', typeColor: 'bg-slate-100 text-slate-700' },
    { time: '09:20 - 10:10', class: '3rd Year CSBS', subject: 'Machine Learning', room: 'CS-301', type: 'Theory', typeColor: 'bg-slate-100 text-slate-700' },
    { time: '11:20 - 12:10', class: '4th Year CSBS', subject: 'Web Technologies Lab', room: 'Lab-1', type: 'Lab', typeColor: 'bg-emerald-100 text-emerald-700' },
    { time: '01:00 - 01:50', class: '3rd Year CSBS', subject: 'Enterprise Systems', room: 'CS-305', type: 'Theory', typeColor: 'bg-slate-100 text-slate-700' },
  ];

  const quickActions = [
    { label: 'Apply Leave', desc: 'Submit leave request', icon: FileText, path: '/leaves' },
    { label: 'Request Substitution', desc: 'Find an available staff', icon: RefreshCw, path: '/substitutions' },
    { label: 'Mark Unavailable', desc: 'Update your availability', icon: CalendarX, path: '/leaves' },
    { label: 'Send Message', desc: 'Chat with HOD / Staff', icon: MessageSquare, path: '/messages' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] font-bold text-[#017a80] leading-tight tracking-tight">
            Good Morning, {user?.name || 'Mrs. Vidhya S'}
          </h1>
          <p className="text-[#01949a]/70 font-medium mt-1">Here's your overview for today.</p>
        </div>
        <div className="hidden lg:block border-l-2 border-[#01949a]/20 pl-6 py-1">
          <p className="text-[#01949a]/80 italic max-w-[200px] text-sm font-medium">
            "Teaching is shaping brighter futures."
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} className="border border-[#dbe8d8] shadow-sm bg-white hover:shadow-md transition-shadow rounded-2xl">
                  <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                    <div className={`p-4 rounded-full ${stat.color}`}>
                      <Icon className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div>
                      <p className="text-[12px] text-[#01949a]/70 font-bold whitespace-nowrap">{stat.label}</p>
                      <h3 className="text-2xl font-black text-[#017a80] tracking-tight mt-1">{stat.value}</h3>
                      <p className="text-[11px] font-semibold text-[#01949a]/50 mt-1">
                        {stat.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Today's Timetable Area */}
          <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#dbe8d8] flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#01949a] pl-3 text-[#017a80]">
                Today's Timetable
              </h2>
              <Link to="/my-timetable">
                <Button className="text-xs bg-[#017a80] text-white hover:bg-[#015a60] border-0 rounded-lg shadow-sm font-bold">
                  View Full Timetable →
                </Button>
              </Link>
            </div>
            {isPeriodActive && (
              <div className="bg-[#eaf2e8] px-6 py-4 border-b border-[#dbe8d8] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#017a80] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#01949a]"></span>
                  </span>
                  <span className="text-[#017a80] font-bold text-sm">Ongoing: 1st Period (08:30 - 09:20)</span>
                </div>
                <Button onClick={() => setShowAttendanceModal(true)} className="text-xs bg-[#017a80] text-white hover:bg-[#015a60] border-0 rounded-lg shadow-sm font-bold h-8">
                  Mark Attendance
                </Button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#017a80] text-white font-bold text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Class</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Room</th>
                    <th className="px-6 py-4">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dbe8d8]/50 bg-white">
                  {schedule.map((row, i) => (
                    <tr key={i} className="hover:bg-[#f4f8f3]/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#017a80]">{row.time}</td>
                      <td className="px-6 py-4 text-[#01949a]/80">{row.class}</td>
                      <td className="px-6 py-4 text-[#01949a]/80">{row.subject}</td>
                      <td className="px-6 py-4 text-[#01949a]/80">{row.room}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${row.typeColor}`}>
                          {row.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div className="bg-[#f4f8f3] rounded-2xl border border-[#dbe8d8] shadow-inner p-6">
              <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#01949a] pl-3 text-[#017a80] mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <Link key={i} to={action.path}>
                      <Card className="border border-[#dbe8d8] shadow-sm bg-white hover:border-[#01949a]/30 hover:shadow-md transition-all cursor-pointer rounded-xl h-full">
                        <CardContent className="p-4 flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div className="p-2.5 rounded-lg bg-[#eaf2e8] text-[#01949a]">
                              <Icon className="w-5 h-5 stroke-[1.5]" />
                            </div>
                            <span className="text-[#01949a]/40 text-lg">→</span>
                          </div>
                          <div>
                            <h4 className="text-[13px] font-bold text-[#017a80]">{action.label}</h4>
                            <p className="text-[11px] font-medium text-[#01949a]/60 mt-0.5">{action.desc}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Schedule Summary Chart */}
            <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm p-6 flex flex-col">
              <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#01949a] pl-3 text-[#017a80] mb-6">
                Today's Schedule Summary
              </h2>
              <div className="flex-1 flex items-center justify-center gap-8">
                {/* CSS Donut Chart */}
                <div className="relative w-32 h-32 rounded-full flex items-center justify-center bg-white shadow-inner" style={{ background: 'conic-gradient(#017a80 0% 75%, #dbe8d8 75% 100%)' }}>
                  <div className="absolute inset-0 m-4 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                    <span className="text-3xl font-black text-[#017a80]">4</span>
                    <span className="text-[10px] font-bold text-[#01949a]/60 uppercase tracking-widest mt-1">Classes</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#017a80]"></div>
                      <span className="text-sm font-bold text-[#017a80]">Theory</span>
                    </div>
                    <span className="font-bold text-[#017a80]">3</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#dbe8d8]"></div>
                      <span className="text-sm font-bold text-[#017a80]">Lab</span>
                    </div>
                    <span className="font-bold text-[#017a80]">1</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 opacity-50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#f4f8f3] border border-[#dbe8d8]"></div>
                      <span className="text-sm font-bold text-[#017a80]">Other</span>
                    </div>
                    <span className="font-bold text-[#017a80]">0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Area */}
        <div className="space-y-8">
          
          {/* Calendar */}
          <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#017a80] mb-6">Calendar</h2>
            <div className="flex items-center justify-between mb-4 text-[#017a80]">
              <ChevronLeft className="w-5 h-5 cursor-pointer hover:text-[#01949a]" />
              <span className="font-bold text-sm">September 2026</span>
              <ChevronRight className="w-5 h-5 cursor-pointer hover:text-[#01949a]" />
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#01949a]/60 mb-2">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-[#017a80]">
              <div className="text-[#01949a]/30 py-2">30</div>
              <div className="text-[#01949a]/30 py-2">31</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">1</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">2</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">3</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">4</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">5</div>
              {/* Row 2 */}
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">6</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">7</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">8</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">9</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">10</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">11</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">12</div>
              {/* Row 3 */}
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">13</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">14</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">15</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">16</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">17</div>
              <div className="bg-[#017a80] text-white rounded-xl shadow-md py-2 font-bold cursor-pointer">18</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">19</div>
              {/* Row 4 */}
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">20</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">21</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">22</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">23</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">24</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">25</div>
              <div className="py-2 hover:bg-[#f4f8f3] rounded-lg cursor-pointer">26</div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#dbe8d8] flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#01949a] pl-3 text-[#017a80]">
                Notifications
              </h2>
              <Button variant="ghost" className="text-xs text-[#01949a] hover:text-[#017a80] hover:bg-[#f4f8f3] font-bold">
                View All
              </Button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
              <Bell className="w-8 h-8 text-[#01949a]/40 mb-3" />
              <p className="text-[#017a80] font-bold text-sm">No new notifications</p>
              <p className="text-xs text-[#01949a]/60 font-medium mt-1">You're all caught up!</p>
            </div>
          </div>
          
          {/* Leave Status */}
          <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm overflow-hidden flex flex-col p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#01949a] pl-3 text-[#017a80]">
                My Leave Status
              </h2>
              <Button variant="ghost" className="text-xs text-[#01949a] hover:text-[#017a80] hover:bg-[#f4f8f3] font-bold">
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div>
                <p className="text-[11px] font-bold text-[#01949a]/70">Total Leaves</p>
                <p className="text-xl font-black text-[#017a80]">12</p>
                <p className="text-[10px] text-[#01949a]/50 mt-1">per year</p>
              </div>
              <div className="border-x border-[#dbe8d8]">
                <p className="text-[11px] font-bold text-[#01949a]/70">Used</p>
                <p className="text-xl font-black text-[#d93838]">3</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#01949a]/70">Remaining</p>
                <p className="text-xl font-black text-emerald-700">9</p>
              </div>
            </div>

            <div className="w-full bg-[#eaf2e8] rounded-full h-3 mb-2 overflow-hidden shadow-inner flex">
              <div className="bg-[#017a80] h-3 rounded-full" style={{ width: '25%' }}></div>
            </div>
            <p className="text-right text-[11px] font-bold text-[#01949a]">25% used</p>
          </div>

        </div>
      </div>

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2f5061]/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-3xl shadow-2xl relative border border-[#dbe8d8] max-h-[90vh] flex flex-col">
            <button onClick={() => setShowAttendanceModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black text-[#017a80] mb-2">Mark Attendance</h2>
            <p className="text-[#01949a] font-bold text-sm mb-6">2nd Year CSBS - 1st Period (08:30 - 09:20)</p>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {STUDENT_DATA['2nd'].map(student => (
                  <div key={student.rollNo} className="flex items-center justify-between p-3 rounded-xl border border-[#dbe8d8] bg-[#f4f8f3]">
                    <div>
                      <p className="font-bold text-[#017a80] text-sm">{student.name}</p>
                      <p className="text-xs text-[#01949a]">{student.rollNo}</p>
                    </div>
                    <button
                      onClick={() => handleToggleAttendance(student.rollNo)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        attendanceState[student.rollNo]
                          ? 'bg-[#017a80] text-white'
                          : 'bg-[#d93838] text-white'
                      }`}
                    >
                      {attendanceState[student.rollNo] ? 'Present' : 'Absent'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-[#dbe8d8] flex justify-between items-center">
              <div className="text-sm font-bold text-[#01949a]">
                Present: <span className="text-[#017a80]">{Object.values(attendanceState).filter(v => v).length}</span> | 
                Absent: <span className="text-[#d93838]">{Object.values(attendanceState).filter(v => !v).length}</span>
              </div>
              <Button onClick={handleSubmitAttendance} className="bg-[#017a80] hover:bg-[#015a60] text-white font-bold px-8">
                Submit Attendance
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
