import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Users, BookOpen, Clock, FileText, ChevronRight } from 'lucide-react';
import { STUDENT_DATA } from '../data/studentsData';

export default function MyClassDashboard() {
  const studentsCount = STUDENT_DATA['2nd'].length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-10">
      <div>
        <h1 className="text-[32px] font-bold text-[#017a80] leading-tight tracking-tight">
          My Class Dashboard
        </h1>
        <p className="text-[#01949a]/70 font-medium mt-1">Overview of 2nd Year CSBS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-[#dbe8d8] shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#eaf2e8] text-[#01949a] rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-bold text-[#01949a]/70">Total Students</p>
            <h3 className="text-3xl font-black text-[#017a80]">{studentsCount}</h3>
          </CardContent>
        </Card>

        <Card className="border border-[#dbe8d8] shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#eaf2e8] text-[#01949a] rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-bold text-[#01949a]/70">Today's Classes</p>
            <h3 className="text-3xl font-black text-[#017a80]">4</h3>
          </CardContent>
        </Card>

        <Card className="border border-[#dbe8d8] shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#eaf2e8] text-[#01949a] rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-bold text-[#01949a]/70">Overall Attendance</p>
            <h3 className="text-3xl font-black text-[#017a80]">94%</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#01949a] pl-3 text-[#017a80] mb-6">
            Quick Links
          </h2>
          <div className="space-y-3">
            <Link to="/class-students" className="flex items-center justify-between p-4 rounded-xl border border-[#dbe8d8] hover:bg-[#f4f8f3] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#eaf2e8] text-[#017a80] rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#017a80]">View Class List</h3>
                  <p className="text-xs font-medium text-[#01949a]/60">Full student directory</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#01949a] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link to="/my-timetable" className="flex items-center justify-between p-4 rounded-xl border border-[#dbe8d8] hover:bg-[#f4f8f3] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#eaf2e8] text-[#017a80] rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#017a80]">Class Timetable</h3>
                  <p className="text-xs font-medium text-[#01949a]/60">View schedule</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#01949a] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link to="/leaves" className="flex items-center justify-between p-4 rounded-xl border border-[#dbe8d8] hover:bg-[#f4f8f3] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#eaf2e8] text-[#017a80] rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#017a80]">Leave Requests</h3>
                  <p className="text-xs font-medium text-[#01949a]/60">Manage your leaves</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#01949a] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#01949a] pl-3 text-[#017a80] mb-6">
            Recent Announcements
          </h2>
          <div className="flex flex-col items-center justify-center text-center py-10">
            <div className="w-16 h-16 bg-[#f4f8f3] rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-[#01949a]/40" />
            </div>
            <p className="font-bold text-[#017a80]">No recent announcements</p>
            <p className="text-sm text-[#01949a]/60">Announcements for your class will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
