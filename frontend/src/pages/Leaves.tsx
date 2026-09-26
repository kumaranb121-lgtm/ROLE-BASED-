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
  const [proofImage, setProofImage] = useState('');

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
      await api.post('/leave', { date, reason, proofImage });
      setShowModal(false);
      setDate('');
      setReason('');
      setProofImage('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
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
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#dbe8d8] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#f4f8f3] rounded-full text-[#01949a]">
            <UserX className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#017a80]">Leave Management</h1>
            <p className="text-[#01949a]/70 font-medium mt-1">Manage leave and absence requests</p>
          </div>
        </div>
        {user?.role !== 'HOD' && (
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-[#017a80] text-white hover:bg-[#015a60] font-bold shadow-md h-10 px-6"
          >
            Apply for Leave
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-5 border-b border-[#dbe8d8] bg-[#f4f8f3]">
          <h2 className="text-lg font-bold text-[#017a80] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#01949a]"></span>
            {user?.role === 'HOD' ? 'All Leave Requests' : 'My Leave Requests'}
          </h2>
        </div>
        
        <div className="p-6 overflow-y-auto hide-scrollbar flex-1 space-y-4">
          {leaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#01949a]/40 py-20">
              <UserX className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-bold text-[#017a80] text-lg">No leave requests found.</p>
            </div>
          ) : (
            leaves.map(leave => (
              <div key={leave._id} className="border border-[#dbe8d8] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[#017a80] font-bold text-lg">
                      {user?.role === 'HOD' && (
                        <>
                          <User className="w-5 h-5 text-[#01949a]" />
                          {leave.staff?.name}
                        </>
                      )}
                      {user?.role !== 'HOD' && (
                        <>
                          <Calendar className="w-5 h-5 text-[#01949a]" />
                          {new Date(leave.date).toDateString()}
                        </>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      leave.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      leave.status === 'Approved' ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                  
                  {user?.role === 'HOD' && (
                    <div className="text-sm font-bold text-[#01949a] flex items-center gap-2">
                      <Calendar className="w-4 h-4"/> Requested for: {new Date(leave.date).toDateString()}
                    </div>
                  )}

                  <div className="bg-[#f4f8f3] p-3 rounded-lg border border-[#dbe8d8]">
                    <p className="text-sm font-medium text-[#017a80] italic">"{leave.reason}"</p>
                  </div>
                  {leave.proofImage && (
                    <div className="mt-2">
                      <p className="text-[10px] font-bold text-[#01949a] uppercase mb-1">Attached Proof:</p>
                      <img src={leave.proofImage} alt="Proof" className="h-20 w-auto rounded border border-[#dbe8d8] shadow-sm cursor-pointer hover:opacity-90" onClick={() => window.open(leave.proofImage, '_blank')} />
                    </div>
                  )}
                </div>

                {user?.role === 'HOD' && leave.status === 'Pending' && (
                  <div className="flex flex-row md:flex-col gap-2 w-full md:w-32 shrink-0">
                    <Button onClick={() => handleAction(leave._id, 'Approved')} size="sm" className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold h-10">
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button onClick={() => handleAction(leave._id, 'Declined')} size="sm" variant="outline" className="flex-1 border-[#dbe8d8] text-[#01949a] hover:bg-red-50 hover:text-slate-600 font-bold h-10">
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
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-[#dbe8d8]">
            <div className="p-6 border-b border-[#dbe8d8] bg-[#f4f8f3] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#017a80] flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-[#dbe8d8] shadow-sm">
                  <FileText className="w-5 h-5 text-[#01949a]"/>
                </div>
                Apply for Leave
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#01949a]/50 hover:text-[#017a80] hover:bg-white p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#017a80] mb-2">Date <span className="text-slate-500">*</span></label>
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-[#f4f8f3] border border-[#dbe8d8] rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#01949a]/20 focus:border-[#01949a]/30 transition-all text-[#017a80]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#017a80] mb-2">Reason / Description <span className="text-slate-500">*</span></label>
                  <textarea 
                    required
                    rows={4}
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Please provide a valid reason or details..."
                    className="w-full bg-[#f4f8f3] border border-[#dbe8d8] rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#01949a]/20 focus:border-[#01949a]/30 transition-all resize-none text-[#017a80]"
                  />
                </div>

                {user?.role === 'STUDENT' || user?.role === 'CLASS_REPRESENTATIVE' ? (
                  <div>
                    <label className="block text-sm font-bold text-[#017a80] mb-2">OD Certificate / Proof Image (Optional)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full bg-[#f4f8f3] border border-[#dbe8d8] rounded-xl px-4 py-2 text-sm font-medium focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#017a80] file:text-white hover:file:bg-[#015a60]"
                    />
                    {proofImage && (
                      <div className="mt-3">
                        <img src={proofImage} alt="Preview" className="h-24 w-auto rounded-lg border border-[#dbe8d8] shadow-sm" />
                      </div>
                    )}
                  </div>
                ) : null}
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
