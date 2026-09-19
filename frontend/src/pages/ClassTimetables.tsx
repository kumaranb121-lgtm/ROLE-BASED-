import { useState, useEffect } from 'react';
import TimetableGrid from '../components/common/TimetableGrid';
import { Calendar } from 'lucide-react';
import api from '../services/api';

export default function ClassTimetables() {
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    api.get('/timetables').then(res => {
      const timetables = res.data;
      const uniqueClasses = Array.from(new Set(timetables.map((t: any) => t.classId?._id)))
        .map(id => timetables.find((t: any) => t.classId?._id === id)?.classId)
        .filter(Boolean)
        .sort((a: any, b: any) => a.year.localeCompare(b.year)); // 2nd, 3rd, 4th
      
      setClasses(uniqueClasses as any[]);
    });
  }, []);

  const scrollToClass = (id: string) => {
    const el = document.getElementById(`class-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-10">
      {/* Header and Quick Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-[#EAE0D9]">
        <div>
          <h1 className="text-[32px] font-bold text-[#4A1115] leading-tight">Class Timetables</h1>
          <p className="text-[#7B1D23]/70 font-medium">View and manage timetables for all years.</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-[10px] font-bold tracking-[0.15em] text-[#7B1D23]/50 text-right uppercase leading-tight border-r border-[#EAE0D9] pr-6 hidden sm:block">
            Better Timetables<br/>For a Better Tomorrow.
          </div>
          <div className="flex bg-white p-1.5 rounded-xl border border-[#EAE0D9] shadow-sm">
            {classes.map((c: any) => (
              <button
                key={`nav-${c._id}`}
                onClick={() => scrollToClass(c._id)}
                className="px-6 py-2 rounded-lg text-sm font-bold text-[#4A1115] hover:bg-[#FAF6F3] transition-colors"
              >
                {c.year} Year
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timetable Vertical Stack */}
      <div className="space-y-10 mt-6">
        {classes.length > 0 ? (
          classes.map((c: any) => (
            <div 
              key={c._id} 
              id={`class-${c._id}`}
              className="bg-white rounded-2xl border border-[#EAE0D9] shadow-sm overflow-hidden"
            >
              {/* Card Header (Beige gradient matching image) */}
              <div className="bg-gradient-to-r from-[#F2EAE5] to-[#FAF6F3] px-6 py-4 border-b border-[#EAE0D9] flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-[#4A1115]">
                    {c.year} Year {c.department}
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#7B1D23]/70 mt-1">
                    <span>Classroom: <strong className="text-[#4A1115]">{c.classroom}</strong></span>
                    <span className="text-[#EAE0D9]">|</span>
                    <span>Advisor: <strong className="text-[#4A1115]">{c.advisor?.name || 'Unassigned'}</strong></span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-[#EAE0D9]/50 px-4 py-2 rounded-lg border border-[#7B1D23]/10 shadow-inner">
                  <Calendar className="w-4 h-4 text-[#7B1D23]" />
                  <span className="text-xs font-bold text-[#4A1115]">
                    W.E.F {new Date(c.effectiveFrom || '2026-07-01').toLocaleDateString('en-GB').replace(/\//g, '.')}
                  </span>
                </div>
              </div>
              
              {/* Render the Grid */}
              <div className="p-4 bg-[#FAF6F3]/30">
                <TimetableGrid classId={c._id} />
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-muted-foreground bg-white rounded-xl border border-[#EAE0D9] shadow-sm font-medium">
            Loading classes...
          </div>
        )}
      </div>
    </div>
  );
}
