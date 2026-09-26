import { useState, useEffect } from 'react';
import api from '../../services/api';

interface TimetableSlot {
  _id: string;
  day: string;
  period: number;
  subject: { shortName: string; name: string; type: string } | null;
  staff: { name: string } | null;
  classId?: { year: string; department: string };
  isBreak: boolean;
  breakName: string | null;
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

const PERIODS = [
  { id: 'S1', time: '08:30 - 09:20', p: 1 },
  { id: 'S2', time: '09:20 - 10:10', p: 2 },
  { id: 'S3', time: '10:10 - 11:00', p: 3 },
  { id: 'BREAK', time: '', p: -1 },
  { id: 'S4', time: '11:10 - 12:00', p: 4 },
  { id: 'S5', time: '12:00 - 12:50', p: 5 },
  { id: 'LUNCH', time: '', p: -2 },
  { id: 'S6', time: '01:25 - 02:15', p: 6 },
  { id: 'S7', time: '02:15 - 03:05', p: 7 },
  { id: 'BREAK', time: '', p: -3 },
  { id: 'S8', time: '03:15 - 04:05', p: 8 },
];

export default function TimetableGrid({ classId, staffId }: { classId?: string; staffId?: string }) {
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (classId) queryParams.append('classId', classId);
        if (staffId) queryParams.append('staffId', staffId);
        
        const res = await api.get(`/timetables?${queryParams.toString()}`);
        setTimetable(res.data);
      } catch (err) {
        console.error('Failed to fetch timetable:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [classId, staffId]);

  if (loading) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse font-medium">Loading academic schedule...</div>;
  }

  const slotMap: Record<string, Record<number, TimetableSlot>> = {};
  DAYS.forEach(day => { slotMap[day] = {}; });
  timetable.forEach(slot => {
    if (slotMap[slot.day]) {
      slotMap[slot.day][slot.period] = slot;
    }
  });

  const getSubjectColor = (type?: string, name?: string) => {
    if (!type) return 'bg-yellow-50/60 text-yellow-900 border-yellow-200/50';
    switch (type.toUpperCase()) {
      case 'LAB': return 'bg-cyan-50 text-cyan-900 border-cyan-200/50';
      case 'PLACEMENT': return 'bg-pink-100/70 text-pink-900 border-pink-200/50';
      case 'PROJECT': return 'bg-purple-100/60 text-purple-900 border-purple-200/50';
      case 'COMM': return 'bg-emerald-50 text-emerald-900 border-emerald-200/50';
      case 'LIBRARY': return 'bg-[#eaf2e8] text-amber-900 border-[#cde0cc]/50';
      case 'PT': return 'bg-rose-100/60 text-rose-900 border-rose-200/50';
      default: return 'bg-[#eaf2e8] text-[#01949a] border-[#01949a]/10'; // Soft cream for theory
    }
  };

  return (
    <div className="w-full overflow-x-auto bg-[#f4f8f3] rounded-xl shadow-sm border border-black/5">
      <div className="min-w-[1000px]">
        {/* Header Row */}
        <div className="grid grid-cols-[80px_repeat(3,1fr)_50px_repeat(2,1fr)_50px_repeat(2,1fr)_50px_1fr] border-b border-[#dbe8d8] bg-[#eaf2e8]/60">
          <div className="p-3 font-bold text-xs flex items-center justify-center border-r border-[#dbe8d8] text-[#01949a]/70">
            DAY
          </div>
          {PERIODS.map((p, idx) => (
            <div key={idx} className={`p-2 text-center border-r border-[#dbe8d8] last:border-0 flex flex-col items-center justify-center ${p.p < 0 ? 'bg-[#dbe8d8]/30' : ''}`}>
              <span className={`font-bold ${p.p < 0 ? 'text-[10px] tracking-widest text-[#01949a]/60' : 'text-xs text-[#01949a]'}`}>
                {p.id}
              </span>
              {p.time && (
                <span className="text-[9px] text-[#01949a]/70 font-medium mt-0.5">
                  {p.time}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Body Rows */}
        {DAYS.map((day) => (
          <div key={day} className="grid grid-cols-[80px_repeat(3,1fr)_50px_repeat(2,1fr)_50px_repeat(2,1fr)_50px_1fr] border-b border-[#dbe8d8] last:border-0 group hover:bg-white/40 transition-colors">
            <div className="p-3 font-bold text-xs flex items-center justify-center border-r border-[#dbe8d8] bg-[#01949a]/[0.02] group-hover:bg-[#01949a]/5 text-[#01949a]">
              {day}
            </div>
            
            {PERIODS.map((col, idx) => {
              // Static Breaks
              if (col.p === -1 || col.p === -3) {
                return (
                  <div key={idx} className="border-r border-[#dbe8d8] last:border-0 bg-[#dbe8d8]/20 flex items-center justify-center">
                    <span className="text-[9px] font-bold tracking-widest text-[#01949a]/40 rotate-180" style={{ writingMode: 'vertical-rl' }}>BREAK</span>
                  </div>
                );
              }
              if (col.p === -2) {
                return (
                  <div key={idx} className="border-r border-[#dbe8d8] last:border-0 bg-[#dbe8d8]/20 flex items-center justify-center">
                    <span className="text-[9px] font-bold tracking-widest text-[#01949a]/40 rotate-180" style={{ writingMode: 'vertical-rl' }}>LUNCH</span>
                  </div>
                );
              }

              const slot = slotMap[day]?.[col.p];
              
              if (!slot) {
                return (
                  <div key={idx} className="p-3 border-r border-[#dbe8d8] last:border-0 flex items-center justify-center text-black/20 text-[10px] font-medium">
                    -
                  </div>
                );
              }

              return (
                <div 
                  key={idx} 
                  className={`p-2 border-r border-[#dbe8d8] last:border-0 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative group/cell border-b-2 hover:brightness-95 ${getSubjectColor(slot.subject?.type, slot.subject?.shortName)}`}
                >
                  <span className="font-bold text-[11px] leading-tight mb-0.5">{slot.subject?.shortName}</span>
                  {staffId && slot.classId ? (
                    <span className="text-[9px] opacity-75 font-bold px-1 text-center leading-[1.1] line-clamp-2">
                      {slot.classId.year} {slot.classId.department}
                    </span>
                  ) : slot.staff?.name ? (
                    <span className="text-[9px] opacity-75 font-medium px-1 text-center leading-[1.1] line-clamp-2">
                      {slot.staff.name.replace('Mrs. ', '').replace('Mr. ', '').replace('Dr. ', '')}
                    </span>
                  ) : null}
                  
                  {/* Tooltip */}
                  <div className="absolute z-50 bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 min-w-[200px] w-max max-w-[280px] bg-[#017a80] border border-[#01949a] text-white text-xs rounded-xl p-4 shadow-2xl opacity-0 group-hover/cell:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover/cell:translate-y-0 before:content-[''] before:absolute before:-bottom-2 before:left-1/2 before:-translate-x-1/2 before:border-l-[8px] before:border-l-transparent before:border-r-[8px] before:border-r-transparent before:border-t-[8px] before:border-t-[#017a80]">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                      <span className="bg-white/20 text-white px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider">{col.id}</span>
                      <span className="text-[#f4f8f3]/80 font-medium text-[11px]">{col.time}</span>
                    </div>
                    <p className="font-bold text-[13px] mb-1.5 leading-tight">{slot.subject?.name}</p>
                    
                    <div className="space-y-1 mt-2">
                      {slot.staff?.name && (
                        <p className="flex items-center gap-1.5 text-[#f4f8f3]/80 font-medium text-[11px]">
                          <svg className="w-3.5 h-3.5 text-[#f4f8f3]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                          {slot.staff.name}
                        </p>
                      )}
                      {slot.classId && (
                        <p className="flex items-center gap-1.5 text-[#f4f8f3]/80 font-medium text-[11px]">
                          <svg className="w-3.5 h-3.5 text-[#f4f8f3]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                          {slot.classId.year} Year CSBS
                        </p>
                      )}
                      <p className="flex items-center gap-1.5 text-[#f4f8f3]/80 font-medium text-[11px]">
                        <svg className="w-3.5 h-3.5 text-[#f4f8f3]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        CSBS Department Block
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
