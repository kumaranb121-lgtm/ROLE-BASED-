import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useSocketStore } from '../stores/socketStore';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BookOpen, Calendar, CheckSquare, FileText, Bell, MessageSquare, ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { STUDENT_DATA } from '../data/studentsData';
import api from '../services/api';

export default function DashboardStudent() {
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showODModal, setShowODModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  
  // OD Form State
  const [odForm, setOdForm] = useState({ eventName: '', type: 'Technical', date: '', image: null as File | null });
  // Leave Form State
  const [leaveForm, setLeaveForm] = useState({ reason: '', startDate: '', endDate: '' });

  const assignedFaculty = (() => {
    if (!user || !user.username) return 'Assigned Faculty';
    const rollNo = parseInt(user.username.slice(-3), 10);
    if (isNaN(rollNo)) return 'Manojiya'; // Default fallback
    if (rollNo >= 1 && rollNo <= 20) return 'Manojiya';
    if (rollNo >= 21 && rollNo <= 40) return 'Anitha G';
    return 'Kumaresan E';
  })();

  // Find real student name from hardcoded data
  const realName = (() => {
    if (!user || !user.username) return 'Student';
    const studentInfo = STUDENT_DATA['2nd'].find(s => s.rollNo.toUpperCase() === user.username.toUpperCase());
    if (studentInfo) return studentInfo.name;
    return user.name || 'Student'; // Fallback to DB name if not in 2nd year list
  })();

  useEffect(() => {
    // In a real app we'd fetch actual student data
    setLoading(false);
  }, []);

  const handleApplyOD = (e: React.FormEvent) => {
    e.preventDefault();
    alert('OD Application submitted successfully!');
    setShowODModal(false);
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Leave Application submitted to Faculty Mentor!');
    setShowLeaveModal(false);
  };

  const stats = [
    { label: 'Overall Attendance', value: '0%', icon: CheckSquare, color: 'text-[#01949a]' },
    { label: 'Upcoming Events', value: events.length.toString(), icon: Calendar, color: 'text-[#01949a]' },
    { label: 'Pending Leaves', value: '0', icon: FileText, color: 'text-[#01949a]' },
    { label: 'Approved ODs', value: '0', icon: BookOpen, color: 'text-[#01949a]' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-10 relative">
      {/* Header Section */}
      <div className="flex items-start justify-between bg-transparent">
        <div>
          <h1 className="text-[32px] font-bold text-[#017a80] leading-tight tracking-tight">
            Welcome back, {realName}
          </h1>
          <p className="text-[#01949a]/70 font-medium mt-1">Here's your academic overview.</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Left Column Area */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quick Actions (OD / Leave) */}
            <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm p-6 flex flex-col items-center justify-center text-center space-y-6">
              <h2 className="text-xl font-bold text-[#017a80]">Applications</h2>
              <div className="w-full grid gap-4">
                <Button onClick={() => setShowLeaveModal(true)} className="w-full bg-[#017a80] hover:bg-[#015a60] text-white py-6 rounded-xl font-bold text-lg shadow-sm">
                  Apply for Leave
                </Button>
                <Button onClick={() => setShowODModal(true)} className="w-full bg-[#f4f8f3] border-2 border-[#017a80] text-[#017a80] hover:bg-[#eaf2e8] py-6 rounded-xl font-bold text-lg">
                  Apply for On-Duty (OD)
                </Button>
              </div>
            </div>

            {/* Events List */}
            <div className="bg-[#f4f8f3] rounded-2xl border border-[#dbe8d8] shadow-sm flex flex-col overflow-hidden">
              <div className="p-5 border-b border-[#dbe8d8] bg-white flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#01949a] pl-3 text-[#017a80]">
                  Upcoming Events & Guest Lectures
                </h2>
              </div>
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                {events.length === 0 ? (
                  <>
                    <Calendar className="w-10 h-10 text-[#01949a] mb-3" />
                    <p className="text-[#017a80] font-bold text-sm">No events scheduled</p>
                  </>
                ) : (
                  events.map(ev => (
                    <div key={ev._id} className="w-full bg-white p-3 rounded-lg shadow-sm border border-[#dbe8d8] mb-2 text-left">
                      <p className="font-bold text-[#017a80]">{ev.title}</p>
                      <p className="text-xs text-[#01949a]">{new Date(ev.date).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Area */}
        <div className="w-full xl:w-[320px] 2xl:w-[380px] shrink-0 space-y-6">
          {/* Profile Overview */}
          <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm p-6 text-center">
            <div className="w-20 h-20 bg-[#017a80] text-white rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-4 shadow-md">
              {user?.name?.substring(0,2).toUpperCase() || 'ST'}
            </div>
            <h2 className="text-xl font-bold text-[#017a80]">{realName}</h2>
            <p className="text-sm font-semibold text-[#01949a] mb-2">B.Tech CSBS</p>
            <p className="text-xs text-gray-500 mb-4">{user?.username}</p>
            
            <div className="bg-[#f4f8f3] p-4 rounded-xl border border-[#dbe8d8] mt-4">
              <p className="text-[10px] font-bold text-[#01949a] uppercase tracking-wider mb-1">Assigned Faculty / Advisor</p>
              <div className="flex items-center gap-3 justify-center">
                <div className="w-8 h-8 rounded-full bg-[#017a80] text-white flex items-center justify-center font-bold text-xs">
                  {assignedFaculty.charAt(0)}
                </div>
                <p className="font-bold text-[#017a80]">{assignedFaculty}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OD Modal */}
      {showODModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2f5061]/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl relative border border-[#dbe8d8]">
            <button onClick={() => setShowODModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black text-[#017a80] mb-6">Apply On-Duty</h2>
            <form onSubmit={handleApplyOD} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-[#01949a]">Event Name</label>
                <input required type="text" className="w-full mt-1 p-3 border border-[#dbe8d8] rounded-xl bg-[#f4f8f3] focus:outline-none focus:border-[#017a80]" value={odForm.eventName} onChange={e => setOdForm({...odForm, eventName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-[#01949a]">Event Type</label>
                  <select className="w-full mt-1 p-3 border border-[#dbe8d8] rounded-xl bg-[#f4f8f3] focus:outline-none focus:border-[#017a80]" value={odForm.type} onChange={e => setOdForm({...odForm, type: e.target.value})}>
                    <option>Technical</option>
                    <option>Non-Technical</option>
                    <option>Sports</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-[#01949a]">Date</label>
                  <input required min={new Date().toISOString().split('T')[0]} type="date" className="w-full mt-1 p-3 border border-[#dbe8d8] rounded-xl bg-[#f4f8f3] focus:outline-none focus:border-[#017a80]" value={odForm.date} onChange={e => setOdForm({...odForm, date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-[#01949a]">Poster / Proof (Image)</label>
                <div className="mt-1 border-2 border-dashed border-[#dbe8d8] rounded-xl p-6 flex flex-col items-center justify-center text-[#01949a] cursor-pointer hover:bg-[#f4f8f3]">
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-xs font-bold">Click to upload image</span>
                  <input type="file" accept="image/*" className="hidden" />
                </div>
              </div>
              <Button type="submit" className="w-full py-4 text-sm font-bold rounded-xl mt-4 bg-[#017a80] text-white hover:bg-[#015a60]">Submit to HOD</Button>
            </form>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2f5061]/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl relative border border-[#dbe8d8]">
            <button onClick={() => setShowLeaveModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black text-[#017a80] mb-6">Apply Leave</h2>
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-[#01949a]">Valid Reason</label>
                <textarea required rows={3} className="w-full mt-1 p-3 border border-[#dbe8d8] rounded-xl bg-[#f4f8f3] focus:outline-none focus:border-[#017a80]" placeholder="Why are you taking leave?" value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-[#01949a]">Start Date</label>
                  <input required min={new Date().toISOString().split('T')[0]} type="date" className="w-full mt-1 p-3 border border-[#dbe8d8] rounded-xl bg-[#f4f8f3] focus:outline-none focus:border-[#017a80]" value={leaveForm.startDate} onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-bold text-[#01949a]">End Date</label>
                  <input required min={leaveForm.startDate || new Date().toISOString().split('T')[0]} type="date" className="w-full mt-1 p-3 border border-[#dbe8d8] rounded-xl bg-[#f4f8f3] focus:outline-none focus:border-[#017a80]" value={leaveForm.endDate} onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})} />
                </div>
              </div>
              <p className="text-xs text-center text-[#d93838] font-semibold mt-2">Note: Will be sent to your assigned Faculty Mentor <b>({assignedFaculty})</b> first.</p>
              <Button type="submit" className="w-full py-4 text-sm font-bold rounded-xl mt-4 bg-[#017a80] text-white hover:bg-[#015a60]">Submit Leave</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
