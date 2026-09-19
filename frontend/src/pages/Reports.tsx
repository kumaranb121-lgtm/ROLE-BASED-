import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { BarChart3, Users, Clock, AlertTriangle, FileText } from 'lucide-react';

export default function Reports() {
  const { user } = useAuthStore();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    if (user?.role === 'HOD') {
      api.get('/reports').then(res => setReport(res.data)).catch(console.error);
    }
  }, [user]);

  if (user?.role !== 'HOD') {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-[#7B1D23]/50">
        <AlertTriangle className="w-16 h-16 mb-4" />
        <h2 className="text-xl font-bold text-[#4A1115]">Access Denied</h2>
        <p className="font-medium">Only the HOD can view department reports.</p>
      </div>
    );
  }

  if (!report) {
    return <div className="text-center py-20 text-[#7B1D23] font-bold">Loading Reports...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-10">
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-[#EAE0D9] shadow-sm">
        <div className="p-3 bg-[#FAF6F3] rounded-full text-[#7B1D23]">
          <BarChart3 className="w-8 h-8 stroke-[1.5]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#4A1115]">Department Overview</h1>
          <p className="text-[#7B1D23]/70 font-medium mt-1">Key metrics and statistics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#EAE0D9] shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#7B1D23]/60 uppercase tracking-wider">Total Staff</p>
            <h3 className="text-3xl font-bold text-[#4A1115]">{report.totalStaff}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#EAE0D9] shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-full">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#7B1D23]/60 uppercase tracking-wider">Pending Leaves</p>
            <h3 className="text-3xl font-bold text-[#4A1115]">{report.pendingLeaves}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#EAE0D9] shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-full">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#7B1D23]/60 uppercase tracking-wider">Total Subs</p>
            <h3 className="text-3xl font-bold text-[#4A1115]">{report.totalSubstitutions}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#EAE0D9] shadow-sm flex items-center gap-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-full">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#7B1D23]/60 uppercase tracking-wider">Recent Absentees</p>
            <h3 className="text-3xl font-bold text-[#4A1115]">{report.recentAbsentTotal}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
