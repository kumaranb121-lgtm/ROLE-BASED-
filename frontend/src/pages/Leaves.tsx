import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useSocketStore } from '../stores/socketStore';
import api from '../services/api';
import { Calendar, Check, X, FileText, User, UserX } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Leaves() {
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.get('/leave');
      setLeaves(res.data);
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
        if (notif.type.includes('leave')) {
          fetchData();
        }
      };
      socket.on('new_notification', handleNotif);
      return () => {
        socket.off('new_notification', handleNotif);
      };
    }
  }, [socket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !reason) return;
    try {
      await api.post('/leave', { date, reason });
      setShowModal(false);
      setDate('');
      setReason('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (id: string, status: 'Approved' | 'Declined') => {
    try {
      await api.put(`/leave/${id}`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1000px] mx-auto pb-10">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#EAE0D9] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#FAF6F3] rounded-full text-[#7B1D23]">
            <UserX className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#4A1115]">Leave Management</h1>
            <p className="text-[#7B1D23]/70 font-medium mt-1">Manage leave and absence requests</p>
          </div>
        </div>
        {user?.role !== 'HOD' && (
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-[#4A1115] text-white hover:bg-[#632220] font-bold shadow-md h-10 px-6"
          >
            Apply for Leave
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#EAE0D9] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-5 border-b border-[#EAE0D9] bg-[#FAF6F3]">
          <h2 className="text-lg font-bold text-[#4A1115] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7B1D23]"></span>
            {user?.role === 'HOD' ? 'All Leave Requests' : 'My Leave Requests'}
          </h2>
        </div>
        
        <div className="p-6 overflow-y-auto hide-scrollbar flex-1 space-y-4">
          {leaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#7B1D23]/40 py-20">
              <UserX className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-bold text-[#4A1115] text-lg">No leave requests found.</p>
            </div>
          ) : (
            leaves.map(leave => (
              <div key={leave._id} className="border border-[#EAE0D9] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[#4A1115] font-bold text-lg">
                      {user?.role === 'HOD' && (
                        <>
                          <User className="w-5 h-5 text-[#7B1D23]" />
                          {leave.staff?.name}
                        </>
                      )}
                      {user?.role !== 'HOD' && (
                        <>
                          <Calendar className="w-5 h-5 text-[#7B1D23]" />
                          {new Date(leave.date).toDateString()}
                        </>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      leave.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      leave.status === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                  
                  {user?.role === 'HOD' && (
                    <div className="text-sm font-bold text-[#7B1D23] flex items-center gap-2">
                      <Calendar className="w-4 h-4"/> Requested for: {new Date(leave.date).toDateString()}
                    </div>
                  )}

                  <div className="bg-[#FAF6F3] p-3 rounded-lg border border-[#EAE0D9]">
                    <p className="text-sm font-medium text-[#4A1115] italic">"{leave.reason}"</p>
                  </div>
                </div>

                {user?.role === 'HOD' && leave.status === 'Pending' && (
                  <div className="flex flex-row md:flex-col gap-2 w-full md:w-32 shrink-0">
                    <Button onClick={() => handleAction(leave._id, 'Approved')} size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-10">
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button onClick={() => handleAction(leave._id, 'Declined')} size="sm" variant="outline" className="flex-1 border-[#EAE0D9] text-[#7B1D23] hover:bg-red-50 hover:text-red-600 font-bold h-10">
                      <X className="w-4 h-4 mr-1" /> Decline
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-[#EAE0D9]">
            <div className="p-6 border-b border-[#EAE0D9] bg-[#FAF6F3] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#4A1115] flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-[#EAE0D9] shadow-sm">
                  <FileText className="w-5 h-5 text-[#7B1D23]"/>
                </div>
                Apply for Leave
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#7B1D23]/50 hover:text-[#4A1115] hover:bg-white p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
              <div className="space-y-4">
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
                  <label className="block text-sm font-bold text-[#4A1115] mb-2">Reason <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    rows={4}
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Please provide a valid reason..."
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
