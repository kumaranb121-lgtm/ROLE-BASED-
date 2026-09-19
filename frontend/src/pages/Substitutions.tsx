import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useSocketStore } from '../stores/socketStore';
import api from '../services/api';
import { Repeat, Calendar, Check, X, FileText, User, BookOpen, Users } from 'lucide-react';
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

  const fetchData = async () => {
    try {
      const [subsRes, staffRes, timeRes] = await Promise.all([
        api.get('/substitutions'),
        api.get('/users/staff'),
        api.get(`/timetables?staffId=${user?.id}`)
      ]);
      setSubstitutions(subsRes.data);
      // Remove self from target staff list
      const staff = staffRes.data.filter((s: any) => s._id !== user?.id);
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
          const freeStaff = res.data.filter((s: any) => s._id !== user?.id);
          setDisplayStaffList(freeStaff);
        } catch (err) {
          console.error('Failed to fetch free staff', err);
          setDisplayStaffList(allStaffList);
        }
      }
    };
    filterStaff();
  }, [selectedSlot, showAllStaff, allStaffList, myTimetables, user?.id]);

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
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#EAE0D9] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#FAF6F3] rounded-full text-[#7B1D23]">
            <Repeat className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#4A1115]">Substitutions</h1>
            <p className="text-[#7B1D23]/70 font-medium mt-1">Manage your class substitutions</p>
          </div>
        </div>
        {user?.role === 'STAFF' && (
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-[#4A1115] text-white hover:bg-[#632220] font-bold shadow-md h-10 px-6"
          >
            New Request
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incoming Requests */}
        <div className="bg-white rounded-2xl border border-[#EAE0D9] shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b border-[#EAE0D9] bg-[#FAF6F3]">
            <h2 className="text-lg font-bold text-[#4A1115] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7B1D23]"></span>
              Incoming Requests
            </h2>
          </div>
          <div className="p-5 overflow-y-auto hide-scrollbar flex-1 space-y-4">
            {substitutions.filter(s => s.toStaff?._id === user?.id).length === 0 ? (
              <p className="text-center text-[#7B1D23]/60 font-medium py-10">No incoming requests.</p>
            ) : (
              substitutions.filter(s => s.toStaff?._id === user?.id).map(sub => (
                <div key={sub._id} className="border border-[#EAE0D9] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-[#4A1115] font-bold">
                      <User className="w-4 h-4 text-[#7B1D23]" />
                      {sub.fromStaff?.name}
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                      sub.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      sub.status === 'Accepted' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="bg-[#FAF6F3] p-3 rounded-lg mb-3 border border-[#EAE0D9]">
                    <p className="text-sm font-bold text-[#4A1115] flex flex-col gap-1.5">
                      <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#7B1D23]/50"/> {sub.timetableSlot?.subject?.name || 'Unknown Subject'}</span>
                      <span className="flex items-center gap-2"><Users className="w-4 h-4 text-[#7B1D23]/50"/> {sub.timetableSlot?.classId?.year} Year - {sub.timetableSlot?.classId?.department}</span>
                      <span className="flex items-center gap-2 text-[#7B1D23]"><Calendar className="w-4 h-4"/> {new Date(sub.date).toDateString()} (Period {sub.timetableSlot?.period})</span>
                    </p>
                  </div>
                  {sub.message && (
                    <p className="text-xs font-medium text-[#7B1D23]/80 italic mb-4 p-3 bg-white border border-[#EAE0D9] rounded-lg">"{sub.message}"</p>
                  )}
                  {sub.status === 'Pending' && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleAction(sub._id, 'accept')} size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-9">
                        <Check className="w-4 h-4 mr-1" /> Accept
                      </Button>
                      <Button onClick={() => handleAction(sub._id, 'decline')} size="sm" variant="outline" className="flex-1 border-[#EAE0D9] text-[#7B1D23] hover:bg-red-50 hover:text-red-600 font-bold h-9">
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
        <div className="bg-white rounded-2xl border border-[#EAE0D9] shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b border-[#EAE0D9] bg-[#FAF6F3]">
            <h2 className="text-lg font-bold text-[#4A1115] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7B1D23]"></span>
              My Requests
            </h2>
          </div>
          <div className="p-5 overflow-y-auto hide-scrollbar flex-1 space-y-4">
            {substitutions.filter(s => s.fromStaff?._id === user?.id).length === 0 ? (
              <p className="text-center text-[#7B1D23]/60 font-medium py-10">You haven't made any requests.</p>
            ) : (
              substitutions.filter(s => s.fromStaff?._id === user?.id).map(sub => (
                <div key={sub._id} className="border border-[#EAE0D9] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow bg-[#FDFBF9]">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-[#4A1115] font-bold">
                      <Repeat className="w-4 h-4 text-[#7B1D23]" />
                      Sent to {sub.toStaff?.name}
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                      sub.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      sub.status === 'Accepted' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="bg-white p-3 border border-[#EAE0D9] rounded-lg mb-3">
                    <p className="text-sm font-bold text-[#4A1115] flex flex-col gap-1.5">
                      <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#7B1D23]/50"/> {sub.timetableSlot?.subject?.name || 'Unknown Subject'}</span>
                      <span className="flex items-center gap-2"><Users className="w-4 h-4 text-[#7B1D23]/50"/> {sub.timetableSlot?.classId?.year} Year - {sub.timetableSlot?.classId?.department}</span>
                      <span className="flex items-center gap-2 text-[#7B1D23]"><Calendar className="w-4 h-4"/> {new Date(sub.date).toDateString()} (Period {sub.timetableSlot?.period})</span>
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
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#EAE0D9]">
            <div className="p-6 border-b border-[#EAE0D9] bg-[#FAF6F3] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#4A1115] flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-[#EAE0D9] shadow-sm">
                  <FileText className="w-5 h-5 text-[#7B1D23]"/>
                </div>
                Request Substitution
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#7B1D23]/50 hover:text-[#4A1115] hover:bg-white p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#4A1115] mb-2">My Timetable Slot <span className="text-red-500">*</span></label>
                  <select 
                    required 
                    value={selectedSlot} 
                    onChange={e => {
                      setSelectedSlot(e.target.value);
                      setSelectedStaff(''); // Reset staff selection when slot changes
                    }}
                    className="w-full bg-[#FAF6F3] border border-[#EAE0D9] rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7B1D23]/20 focus:border-[#7B1D23]/30 transition-all text-[#4A1115]"
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
                    <label className="block text-sm font-bold text-[#4A1115]">Substitute Staff <span className="text-red-500">*</span></label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#7B1D23]/70">
                      <input 
                        type="checkbox" 
                        checked={showAllStaff}
                        onChange={e => setShowAllStaff(e.target.checked)}
                        className="accent-[#7B1D23]"
                      />
                      Show All Staff
                    </label>
                  </div>
                  <select 
                    required 
                    value={selectedStaff} 
                    onChange={e => setSelectedStaff(e.target.value)}
                    className="w-full bg-[#FAF6F3] border border-[#EAE0D9] rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7B1D23]/20 focus:border-[#7B1D23]/30 transition-all text-[#4A1115]"
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
                    <p className="text-[10px] font-bold text-green-600 mt-1.5 ml-1 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Showing {displayStaffList.length} staff currently free for this period
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#4A1115] mb-2">Date <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-[#FAF6F3] border border-[#EAE0D9] rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7B1D23]/20 focus:border-[#7B1D23]/30 transition-all text-[#4A1115]"
                  />
                </div>



                <div>
                  <label className="block text-sm font-bold text-[#4A1115] mb-2">Message (Optional)</label>
                  <textarea 
                    rows={3}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Reason for substitution..."
                    className="w-full bg-[#FAF6F3] border border-[#EAE0D9] rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7B1D23]/20 focus:border-[#7B1D23]/30 transition-all resize-none text-[#4A1115]"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Button type="button" onClick={() => setShowModal(false)} variant="outline" className="flex-1 font-bold h-12 rounded-xl border-[#EAE0D9] hover:bg-[#FAF6F3] text-[#7B1D23]">Cancel</Button>
                <Button type="submit" className="flex-1 bg-[#4A1115] hover:bg-[#632220] text-white font-bold h-12 rounded-xl shadow-md hover:shadow-lg transition-all">Submit Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
