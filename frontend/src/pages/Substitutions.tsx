import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useSocketStore } from '../stores/socketStore';
import api from '../services/api';
import { Repeat, Calendar, Check, X, FileText, User, BookOpen, Users, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Substitutions() {
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  const [substitutions, setSubstitutions] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [allStaffList, setAllStaffList] = useState<any[]>([]);
  const [displayStaffList, setDisplayStaffList] = useState<any[]>([]);
  const [myTimetables, setMyTimetables] = useState<any[]>([]);
  const [showAllStaff, setShowAllStaff] = useState(false);

  // Form State
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [availableDates, setAvailableDates] = useState<{dateStr: string, display: string}[]>([]);

  const fetchData = async () => {
    try {
      const [subsRes, staffRes, timeRes] = await Promise.all([
        api.get('/substitutions'),
        api.get('/users/staff'),
        api.get(`/timetables?staffId=${user?.id}`)
      ]);
      setSubstitutions(subsRes.data);
      // Remove self from target staff list and remove nameless staff
      const staff = staffRes.data.filter((s: any) => s._id !== user?.id && s.name && s.name.trim() !== '');
      setAllStaffList(staff);
      setDisplayStaffList(staff);
      setMyTimetables(timeRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    if (socket) {
      const handleNotif = (notif: any) => {
        if (notif.type.includes('substitution')) {
          fetchData();
        }
      };
      socket.on('new_notification', handleNotif);
      return () => {
        socket.off('new_notification', handleNotif);
      };
    }
  }, [socket]);

  useEffect(() => {
    const filterStaff = async () => {
      if (showAllStaff || !selectedSlot) {
        setDisplayStaffList(allStaffList);
        return;
      }
      const slot = myTimetables.find(t => t._id === selectedSlot);
      if (slot) {
        try {
          const res = await api.get(`/users/free-staff?day=${slot.day}&period=${slot.period}`);
          const freeStaff = res.data.filter((s: any) => s._id !== user?.id && s.name && s.name.trim() !== '');
          setDisplayStaffList(freeStaff);
        } catch (err) {
          console.error('Failed to fetch free staff', err);
          setDisplayStaffList(allStaffList);
        }
      }
    };
    filterStaff();
  }, [selectedSlot, showAllStaff, allStaffList, myTimetables, user?.id]);

  // Generate future dates matching the selected slot's day
  useEffect(() => {
    if (!selectedSlot) {
      setAvailableDates([]);
      setDate('');
      return;
    }
    const slot = myTimetables.find(t => t._id === selectedSlot);
    if (!slot) return;

    const daysMap: Record<string, number> = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6,
      'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6
    };
    const targetDay = daysMap[slot.day.toUpperCase()];
    
    if (targetDay !== undefined) {
      const dates = [];
      const today = new Date();
      // Generate next 4 occurrences of that day
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        if (d.getDay() === targetDay) {
          // Format as YYYY-MM-DD
          const dateStr = d.toISOString().split('T')[0];
          dates.push({
            dateStr,
            display: d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
          });
          if (dates.length >= 4) break;
        }
      }
      setAvailableDates(dates);
      if (dates.length > 0) setDate(dates[0].dateStr);
    }
  }, [selectedSlot, myTimetables]);

  const handleAutoAllocate = async () => {
    if (!selectedSlot || !date) return;
    if (displayStaffList.length === 0) {
      alert('No free staff available for this period!');
      return;
    }
    // Pick a random free staff
    const randomIndex = Math.floor(Math.random() * displayStaffList.length);
    const autoStaff = displayStaffList[randomIndex]._id;
    
    try {
      await api.post('/substitutions', {
        toStaff: autoStaff,
        timetableSlot: selectedSlot,
        date,
        message: message || 'Auto-allocated substitution request.'
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || !selectedSlot || !date) return;
    try {
      await api.post('/substitutions', {
        toStaff: selectedStaff,
        timetableSlot: selectedSlot,
        date,
        message
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (id: string, action: 'accept' | 'decline') => {
    try {
      await api.post(`/substitutions/${id}/${action}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-10">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#dbe8d8] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#f4f8f3] rounded-full text-[#01949a]">
            <Repeat className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#017a80]">Substitutions</h1>
            <p className="text-[#01949a]/70 font-medium mt-1">Manage your class substitutions</p>
          </div>
        </div>
        {user?.role === 'STAFF' && (
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-[#017a80] text-white hover:bg-[#015a60] font-bold shadow-md h-10 px-6"
          >
            New Request
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incoming Requests */}
        <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b border-[#dbe8d8] bg-[#f4f8f3]">
            <h2 className="text-lg font-bold text-[#017a80] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#01949a]"></span>
              Incoming Requests
            </h2>
          </div>
          <div className="p-5 overflow-y-auto hide-scrollbar flex-1 space-y-4">
            {substitutions.filter(s => s.toStaff?._id === user?.id).length === 0 ? (
              <p className="text-center text-[#01949a]/60 font-medium py-10">No incoming requests.</p>
            ) : (
              substitutions.filter(s => s.toStaff?._id === user?.id).map(sub => (
                <div key={sub._id} className="border border-[#dbe8d8] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-[#017a80] font-bold">
                      <User className="w-4 h-4 text-[#01949a]" />
                      {sub.fromStaff?.name}
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                      sub.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      sub.status === 'Accepted' ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="bg-[#f4f8f3] p-3 rounded-lg mb-3 border border-[#dbe8d8]">
                    <p className="text-sm font-bold text-[#017a80] flex flex-col gap-1.5">
                      <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#01949a]/50"/> {sub.timetableSlot?.subject?.name || 'Unknown Subject'}</span>
                      <span className="flex items-center gap-2"><Users className="w-4 h-4 text-[#01949a]/50"/> {sub.timetableSlot?.classId?.year} Year - {sub.timetableSlot?.classId?.department}</span>
                      <span className="flex items-center gap-2 text-[#01949a]"><Calendar className="w-4 h-4"/> {new Date(sub.date).toDateString()} (Period {sub.timetableSlot?.period})</span>
                    </p>
                  </div>
                  {sub.message && (
                    <p className="text-xs font-medium text-[#01949a]/80 italic mb-4 p-3 bg-white border border-[#dbe8d8] rounded-lg">"{sub.message}"</p>
                  )}
                  {sub.status === 'Pending' && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleAction(sub._id, 'accept')} size="sm" className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold h-9">
                        <Check className="w-4 h-4 mr-1" /> Accept
                      </Button>
                      <Button onClick={() => handleAction(sub._id, 'decline')} size="sm" variant="outline" className="flex-1 border-[#dbe8d8] text-[#01949a] hover:bg-red-50 hover:text-slate-600 font-bold h-9">
                        <X className="w-4 h-4 mr-1" /> Decline
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Requests */}
        <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b border-[#dbe8d8] bg-[#f4f8f3]">
            <h2 className="text-lg font-bold text-[#017a80] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#01949a]"></span>
              My Requests
            </h2>
          </div>
          <div className="p-5 overflow-y-auto hide-scrollbar flex-1 space-y-4">
            {substitutions.filter(s => s.fromStaff?._id === user?.id).length === 0 ? (
              <p className="text-center text-[#01949a]/60 font-medium py-10">You haven't made any requests.</p>
            ) : (
              substitutions.filter(s => s.fromStaff?._id === user?.id).map(sub => (
                <div key={sub._id} className="border border-[#dbe8d8] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow bg-[#ffffff]">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-[#017a80] font-bold">
                      <Repeat className="w-4 h-4 text-[#01949a]" />
                      Sent to {sub.toStaff?.name}
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                      sub.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      sub.status === 'Accepted' ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="bg-white p-3 border border-[#dbe8d8] rounded-lg mb-3">
                    <p className="text-sm font-bold text-[#017a80] flex flex-col gap-1.5">
                      <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#01949a]/50"/> {sub.timetableSlot?.subject?.name || 'Unknown Subject'}</span>
                      <span className="flex items-center gap-2"><Users className="w-4 h-4 text-[#01949a]/50"/> {sub.timetableSlot?.classId?.year} Year - {sub.timetableSlot?.classId?.department}</span>
                      <span className="flex items-center gap-2 text-[#01949a]"><Calendar className="w-4 h-4"/> {new Date(sub.date).toDateString()} (Period {sub.timetableSlot?.period})</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#dbe8d8]">
            <div className="p-6 border-b border-[#dbe8d8] bg-[#f4f8f3] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#017a80] flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-[#dbe8d8] shadow-sm">
                  <FileText className="w-5 h-5 text-[#01949a]"/>
                </div>
                Request Substitution
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#01949a]/50 hover:text-[#017a80] hover:bg-white p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#017a80] mb-2">My Timetable Slot <span className="text-slate-500">*</span></label>
                  <select 
                    required 
                    value={selectedSlot} 
                    onChange={e => {
                      setSelectedSlot(e.target.value);
                      setSelectedStaff(''); // Reset staff selection when slot changes
                    }}
                    className="w-full bg-[#f4f8f3] border border-[#dbe8d8] rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#01949a]/20 focus:border-[#01949a]/30 transition-all text-[#017a80]"
                  >
                    <option value="">Select slot to give up...</option>
                    {myTimetables.filter(t => !t.isBreak).map(t => (
                      <option key={t._id} value={t._id}>
                        {t.day} - Period {t.period} ({t.subject?.shortName}) - {t.classId?.year} Yr
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-[#017a80]">Substitute Staff <span className="text-slate-500">*</span></label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#01949a]/70">
                      <input 
                        type="checkbox" 
                        checked={showAllStaff}
                        onChange={e => setShowAllStaff(e.target.checked)}
                        className="accent-[#01949a]"
                      />
                      Show All Staff
                    </label>
                  </div>
                  <select 
                    required 
                    value={selectedStaff} 
                    onChange={e => setSelectedStaff(e.target.value)}
                    className="w-full bg-[#f4f8f3] border border-[#dbe8d8] rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#01949a]/20 focus:border-[#01949a]/30 transition-all text-[#017a80]"
                    disabled={!selectedSlot && !showAllStaff}
                  >
                    <option value="">
                      {!selectedSlot && !showAllStaff ? 'Select a slot first...' : 'Select a staff member...'}
                    </option>
                    {displayStaffList.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                  {!showAllStaff && selectedSlot && (
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1 ml-1">
                        <Check className="w-3 h-3" /> Showing {displayStaffList.length} staff currently free for this period
                      </p>
                      {displayStaffList.length > 0 && (
                        <button 
                          type="button" 
                          onClick={handleAutoAllocate}
                          className="text-[10px] bg-[#01949a]/10 hover:bg-[#01949a]/20 text-[#017a80] font-bold px-2 py-1 rounded-md flex items-center gap-1 transition-colors border border-[#01949a]/20"
                        >
                          <Sparkles className="w-3 h-3" /> Let AI Decide
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#017a80] mb-2">Select Date <span className="text-slate-500">*</span></label>
                  <select 
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    disabled={!selectedSlot || availableDates.length === 0}
                    className="w-full bg-[#f4f8f3] border border-[#dbe8d8] rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#01949a]/20 focus:border-[#01949a]/30 transition-all text-[#017a80]"
                  >
                    <option value="">{selectedSlot ? 'Select an upcoming date...' : 'Select a slot first...'}</option>
                    {availableDates.map((d, i) => (
                      <option key={i} value={d.dateStr}>{d.display}</option>
                    ))}
                  </select>
                </div>



                <div>
                  <label className="block text-sm font-bold text-[#017a80] mb-2">Message (Optional)</label>
                  <textarea 
                    rows={3}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Reason for substitution..."
                    className="w-full bg-[#f4f8f3] border border-[#dbe8d8] rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#01949a]/20 focus:border-[#01949a]/30 transition-all resize-none text-[#017a80]"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Button type="button" onClick={() => setShowModal(false)} variant="outline" className="flex-1 font-bold h-12 rounded-xl border-[#dbe8d8] hover:bg-[#f4f8f3] text-[#01949a]">Cancel</Button>
                <Button type="submit" className="flex-1 bg-[#017a80] hover:bg-[#015a60] text-white font-bold h-12 rounded-xl shadow-md hover:shadow-lg transition-all">Submit Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
