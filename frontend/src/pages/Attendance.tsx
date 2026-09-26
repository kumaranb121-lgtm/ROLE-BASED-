import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { ClipboardList, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Attendance() {
  const { user } = useAuthStore();
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [myTimetables, setMyTimetables] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  // Form State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [date, setDate] = useState('');
  const [presentCount, setPresentCount] = useState<number>(0);
  const [absentCount, setAbsentCount] = useState<number>(0);
  const [absentRollNos, setAbsentRollNos] = useState('');

  const fetchData = async () => {
    try {
      const [attRes, timeRes, clsRes] = await Promise.all([
        api.get('/attendance'),
        api.get(`/timetables?staffId=${user?.id}`),
        api.get('/timetables/classes')
      ]);
      setAttendanceLogs(attRes.data);
      setMyTimetables(timeRes.data);
      setClasses(clsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/attendance', {
        classId: selectedClass,
        timetableSlot: selectedSlot,
        date,
        presentCount,
        absentCount,
        absentRollNos: absentRollNos.split(',').map(s => s.trim()).filter(Boolean)
      });
      setShowModal(false);
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
            <ClipboardList className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#017a80]">Attendance Log</h1>
            <p className="text-[#01949a]/70 font-medium mt-1">Track student attendance daily</p>
          </div>
        </div>
        {user?.role !== 'HOD' && (
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-[#017a80] text-white hover:bg-[#015a60] font-bold shadow-md h-10 px-6"
          >
            Mark Attendance
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#dbe8d8] bg-[#f4f8f3]">
          <h2 className="text-lg font-bold text-[#017a80] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#01949a]"></span>
            Recent Attendance Records
          </h2>
        </div>
        <div className="p-6">
          {attendanceLogs.length === 0 ? (
            <p className="text-center text-[#01949a]/60 py-10 font-bold">No attendance records found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendanceLogs.map((log) => (
                <div key={log._id} className="border border-[#dbe8d8] rounded-xl p-5 shadow-sm bg-[#ffffff]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-[#017a80]">{log.classId?.year} Year - {log.classId?.department}</h3>
                      <p className="text-sm font-medium text-[#01949a]">{new Date(log.date).toDateString()}</p>
                    </div>
                    {log.absentCount > 10 ? (
                      <AlertTriangle className="w-6 h-6 text-slate-500" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-[#dbe8d8] space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-[#01949a]/70">Subject:</span>
                      <span className="font-bold text-[#017a80]">{log.timetableSlot?.subject?.name} (Period {log.timetableSlot?.period})</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-[#01949a]/70">Present:</span>
                      <span className="font-bold text-slate-600">{log.presentCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-[#01949a]/70">Absent:</span>
                      <span className="font-bold text-slate-600">{log.absentCount}</span>
                    </div>
                  </div>
                  
                  {log.absentRollNos?.length > 0 && (
                    <div className="text-xs font-bold text-[#01949a]/60">
                      Absentees: <span className="text-slate-500">{log.absentRollNos.join(', ')}</span>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-[#dbe8d8] text-xs font-bold text-[#017a80]">
                    Marked by: {log.markedBy?.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-[#dbe8d8]">
            <div className="p-6 border-b border-[#dbe8d8] bg-[#f4f8f3] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#017a80]">Mark Attendance</h2>
              <button onClick={() => setShowModal(false)} className="text-[#01949a]/50 hover:text-[#017a80]">X</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#017a80] mb-2">Class</label>
                <select required value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full bg-[#f4f8f3] border border-[#dbe8d8] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#01949a]/20">
                  <option value="">Select Class...</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.year} Year - {c.department}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#017a80] mb-2">Timetable Slot</label>
                <select required value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} className="w-full bg-[#f4f8f3] border border-[#dbe8d8] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#01949a]/20">
                  <option value="">Select Slot...</option>
                  {myTimetables.filter(t => !t.isBreak).map(t => (
                    <option key={t._id} value={t._id}>{t.day} - Period {t.period}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#017a80] mb-2">Date</label>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[#f4f8f3] border border-[#dbe8d8] rounded-xl px-4 py-3 text-sm" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-[#017a80] mb-2">Present Count</label>
                  <input type="number" min="0" required value={presentCount} onChange={e => setPresentCount(Number(e.target.value))} className="w-full bg-[#f4f8f3] border border-[#dbe8d8] rounded-xl px-4 py-3 text-sm" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-[#017a80] mb-2">Absent Count</label>
                  <input type="number" min="0" required value={absentCount} onChange={e => setAbsentCount(Number(e.target.value))} className="w-full bg-[#f4f8f3] border border-[#dbe8d8] rounded-xl px-4 py-3 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#017a80] mb-2">Absent Roll Nos (comma separated)</label>
                <input type="text" value={absentRollNos} onChange={e => setAbsentRollNos(e.target.value)} placeholder="e.g. 101, 105" className="w-full bg-[#f4f8f3] border border-[#dbe8d8] rounded-xl px-4 py-3 text-sm" />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full bg-[#017a80] hover:bg-[#015a60] text-white font-bold h-12 rounded-xl">Submit Attendance</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
