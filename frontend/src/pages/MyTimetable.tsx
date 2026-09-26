import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import TimetableGrid from '../components/common/TimetableGrid';
import { CalendarDays } from 'lucide-react';
import api from '../services/api';

export default function MyTimetable() {
  const { user } = useAuthStore();
  const [repClassId, setRepClassId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'CLASS_REPRESENTATIVE') {
      // Find which class this rep belongs to
      api.get('/timetables').then(res => {
        const timetables = res.data;
        const uniqueClasses = Array.from(new Set(timetables.map((t: any) => t.classId?._id)))
          .map(id => timetables.find((t: any) => t.classId?._id === id)?.classId)
          .filter(Boolean) as any[];
        
        // User name is like "2nd Year Rep"
        const yearMatch = user.name.split(' ')[0]; // "2nd"
        const foundClass = uniqueClasses.find(c => c.year === yearMatch);
        if (foundClass) {
          setRepClassId(foundClass._id);
        }
      });
    }
  }, [user]);

  const isRep = user?.role === 'CLASS_REPRESENTATIVE';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-10">
      {/* Banner */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r shadow-lg border ${isRep ? 'from-[#017a80] via-[#017a80] to-[#01949a] border-[#01949a]/30' : 'from-[#017a80] via-[#015a60] to-[#01949a] border-[#01949a]/30'}`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent mix-blend-overlay"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#015a60] rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="relative z-10 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
              <CalendarDays className="w-8 h-8 text-[#dbe8d8]" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                My Timetable
              </h1>
              <p className="text-[#dbe8d8]/80 font-medium mt-1 text-sm sm:text-base">
                Welcome, {user?.name || 'User'}. Here is your academic schedule.
              </p>
            </div>
          </div>
          
          <div className="bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/5 text-right hidden sm:block shadow-inner">
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-tight">
              {isRep ? 'Class Portal' : 'Staff Portal'}
            </p>
            <p className="text-sm font-bold text-[#dbe8d8]">
              CSBS Department
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#dbe8d8] shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-[#017a80] flex items-center gap-2 mb-2">
          Weekly Allocation
        </h2>
        
        {/* Render grid conditionally based on role */}
        {isRep ? (
          repClassId ? <TimetableGrid classId={repClassId} /> : <div className="p-8 text-center text-[#01949a]/60 font-medium">Locating your class schedule...</div>
        ) : (
          <TimetableGrid staffId={user?.id} />
        )}
      </div>
    </div>
  );
}
