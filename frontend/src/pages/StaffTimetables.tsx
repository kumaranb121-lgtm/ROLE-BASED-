import { useState, useEffect } from 'react';
import TimetableGrid from '../components/common/TimetableGrid';
import { Calendar, Users } from 'lucide-react';
import api from '../services/api';

export default function StaffTimetables() {
  const [staffList, setStaffList] = useState<any[]>([]);

  useEffect(() => {
    // Fetch timetables to figure out which staff have allocations
    api.get('/timetables').then(res => {
      const timetables = res.data;
      
      const uniqueStaff = Array.from(new Set(timetables.filter((t:any) => t.staff).map((t: any) => t.staff?._id)))
        .map(id => timetables.find((t: any) => t.staff?._id === id)?.staff)
        .filter(Boolean)
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      
      setStaffList(uniqueStaff as any[]);
    });
  }, []);

  const scrollToStaff = (id: string) => {
    const el = document.getElementById(`staff-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-10">
      {/* Header and Quick Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-[#EAE0D9]">
        <div>
          <h1 className="text-[32px] font-bold text-[#4A1115] leading-tight">Staff Timetables</h1>
          <p className="text-[#7B1D23]/70 font-medium">View individual timetables for all department staff.</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-[10px] font-bold tracking-[0.15em] text-[#7B1D23]/50 text-right uppercase leading-tight border-r border-[#EAE0D9] pr-6 hidden sm:block">
            Better Coordination<br/>For a Stronger Tomorrow.
          </div>
          
          <div className="flex bg-white p-1.5 rounded-xl border border-[#EAE0D9] shadow-sm max-w-sm overflow-x-auto custom-scrollbar">
            {/* Provide a quick scroll for the first 3 staff as tabs, or a dropdown if too many. Let's just do a few tabs to show layout consistency */}
            {staffList.slice(0, 3).map((s: any) => (
              <button
                key={`nav-${s._id}`}
                onClick={() => scrollToStaff(s._id)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-[#4A1115] hover:bg-[#FAF6F3] transition-colors whitespace-nowrap"
              >
                {s.name.split(' ')[0]} {s.name.split(' ')[1]}
              </button>
            ))}
            {staffList.length > 3 && (
              <div className="px-4 py-2 text-xs font-bold text-[#7B1D23]/50 flex items-center whitespace-nowrap">
                + {staffList.length - 3} more
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timetable Vertical Stack */}
      <div className="space-y-10 mt-6">
        {staffList.length > 0 ? (
          staffList.map((staff: any) => (
            <div 
              key={staff._id} 
              id={`staff-${staff._id}`}
              className="bg-white rounded-2xl border border-[#EAE0D9] shadow-sm overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-[#F2EAE5] to-[#FAF6F3] px-6 py-4 border-b border-[#EAE0D9] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white text-[#4A1115] font-extrabold flex items-center justify-center text-sm shadow-sm border border-[#EAE0D9]">
                    {staff.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#4A1115]">
                      {staff.name}
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#7B1D23]/70 mt-1">
                      <span>Department: <strong className="text-[#4A1115]">CSBS</strong></span>
                      <span className="text-[#EAE0D9]">|</span>
                      <span>Role: <strong className="text-[#4A1115]">Faculty</strong></span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-[#EAE0D9]/50 px-4 py-2 rounded-lg border border-[#7B1D23]/10 shadow-inner">
                  <Users className="w-4 h-4 text-[#7B1D23]" />
                  <span className="text-xs font-bold text-[#4A1115]">
                    Staff Portal View
                  </span>
                </div>
              </div>
              
              {/* Render the Grid for this specific staff */}
              <div className="p-4 bg-[#FAF6F3]/30">
                <TimetableGrid staffId={staff._id} />
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-muted-foreground bg-white rounded-xl border border-[#EAE0D9] shadow-sm font-medium">
            Loading staff timetables...
          </div>
        )}
      </div>
    </div>
  );
}
