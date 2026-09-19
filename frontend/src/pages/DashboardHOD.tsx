import { useAuthStore } from '../stores/authStore';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, Calendar, UserX, RefreshCw, CheckCircle, FileText, Bell, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardHOD() {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Total Staff', value: '19', desc: 'Active members', icon: Users, color: 'bg-[#F2EAE5] text-[#7B1D23]' },
    { label: 'Classes Today', value: '18', desc: 'Scheduled', icon: Calendar, color: 'bg-[#F2EAE5] text-[#7B1D23]' },
    { label: 'Absent Today', value: '2', desc: 'View details →', icon: UserX, color: 'bg-[#F2EAE5] text-[#7B1D23]' },
    { label: 'Pending Substitutions', value: '3', desc: 'Requires action', icon: RefreshCw, color: 'bg-[#F2EAE5] text-[#7B1D23]' },
    { label: 'Completed Substitutions', value: '5', desc: 'Today', icon: CheckCircle, color: 'bg-[#F2EAE5] text-[#7B1D23]' },
    { label: 'Pending Leave Requests', value: '2', desc: 'Requires approval', icon: FileText, color: 'bg-[#F2EAE5] text-[#7B1D23]' },
  ];

  const schedule = [
    { time: '08:30 - 09:20', class: '2nd Year CSBS', subject: 'Data Structures', staff: 'Dr. Antonidoss A', room: 'CS-204', status: 'Completed', statusColor: 'bg-emerald-100 text-emerald-700' },
    { time: '09:20 - 10:10', class: '3rd Year CSBS', subject: 'Machine Learning', staff: 'Mrs. Anitha G', room: 'CS-301', status: 'Ongoing', statusColor: 'bg-blue-100 text-blue-700' },
    { time: '10:10 - 11:00', class: '4th Year CSBS', subject: 'Cloud Computing', staff: 'Dr. Kumaresan E', room: 'CS-402', status: 'Upcoming', statusColor: 'bg-gray-100 text-gray-600' },
    { time: '11:20 - 12:10', class: '2nd Year CSBS', subject: 'Java Programming', staff: 'Mr. Mohan D', room: 'CS-205', status: 'Upcoming', statusColor: 'bg-gray-100 text-gray-600' },
    { time: '01:00 - 01:50', class: '3rd Year CSBS', subject: 'Web Technologies', staff: 'Mrs. Vidhya S', room: 'Lab-1', status: 'Upcoming', statusColor: 'bg-gray-100 text-gray-600' },
  ];

  const activities = [
    { time: '10:05 AM', activity: 'Attendance', details: 'Dr. Antonidoss A marked present', by: 'Dr. Antonidoss A' },
    { time: '09:58 AM', activity: 'Substitution', details: 'Mrs. Anitha G accepted a substitution request', by: 'Mrs. Anitha G' },
    { time: '09:40 AM', activity: 'Leave Request', details: 'New leave request submitted', by: 'Mrs. Manodhiya S' },
    { time: '09:20 AM', activity: 'Timetable', details: 'Timetable updated', by: 'HOD' },
    { time: '08:30 AM', activity: 'Class Report', details: 'Classroom issue reported by class representative', by: '3rd Year Rep' },
  ];

  const events = [
    { date: '18 SEP', title: 'Department Meeting', time: '11:30 AM - 12:30 PM', location: 'HOD Room' },
    { date: '19 SEP', title: 'Timetable Review', time: '02:00 PM - 03:00 PM', location: 'Conference Hall' },
    { date: '21 SEP', title: 'Internal Assessment', time: '09:00 AM - 05:00 PM', location: 'All Classes' },
    { date: '22 SEP', title: 'Faculty Feedback Meeting', time: '11:00 AM - 12:00 PM', location: 'Conference Hall' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] font-bold text-[#4A1115] leading-tight tracking-tight">
            Good Morning, {user?.name || 'Dr. Antony Das'}
          </h1>
          <p className="text-[#7B1D23]/70 font-medium mt-1">Here's an overview of the department.</p>
        </div>
        <div className="hidden lg:block border-l-2 border-[#7B1D23]/20 pl-6 py-1">
          <p className="text-[#7B1D23]/80 italic max-w-[200px] text-sm font-medium">
            "Better coordination today for a stronger tomorrow."
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} className="border border-[#EAE0D9] shadow-sm bg-white hover:shadow-md transition-shadow rounded-2xl">
                  <CardContent className="p-5 flex gap-4 items-center">
                    <div className={`p-4 rounded-xl ${stat.color}`}>
                      <Icon className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div>
                      <p className="text-[13px] text-[#7B1D23]/70 font-bold">{stat.label}</p>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <h3 className="text-2xl font-black text-[#4A1115] tracking-tight">{stat.value}</h3>
                      </div>
                      <p className="text-[11px] font-semibold text-[#7B1D23]/50 mt-1 cursor-pointer hover:text-[#7B1D23] transition-colors">
                        {stat.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Today's Schedule Area */}
          <div className="bg-white rounded-2xl border border-[#EAE0D9] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#EAE0D9] flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#7B1D23] pl-3 text-[#4A1115]">
                Today's Schedule
              </h2>
              <Link to="/class-timetables">
                <Button className="text-xs bg-[#4A1115] text-white hover:bg-[#632220] border-0 rounded-lg shadow-sm font-bold">
                  View Full Timetable →
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#FAF6F3] text-[#7B1D23] font-bold text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Class</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Staff</th>
                    <th className="px-6 py-4">Room</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE0D9]/50">
                  {schedule.map((row, i) => (
                    <tr key={i} className="hover:bg-[#FAF6F3]/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#4A1115]">{row.time}</td>
                      <td className="px-6 py-4 text-[#7B1D23]/80">{row.class}</td>
                      <td className="px-6 py-4 text-[#7B1D23]/80">{row.subject}</td>
                      <td className="px-6 py-4 text-[#7B1D23]/80">{row.staff}</td>
                      <td className="px-6 py-4 text-[#7B1D23]/80">{row.room}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-[#EAE0D9] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#EAE0D9] flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#7B1D23] pl-3 text-[#4A1115]">
                Recent Activity
              </h2>
              <Button variant="ghost" className="text-xs text-[#7B1D23] hover:text-[#4A1115] hover:bg-[#FAF6F3] font-bold">
                View All
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#FAF6F3] text-[#7B1D23] font-bold text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Activity</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE0D9]/50">
                  {activities.map((row, i) => (
                    <tr key={i} className="hover:bg-[#FAF6F3]/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#4A1115]">{row.time}</td>
                      <td className="px-6 py-4 text-[#7B1D23]/80 font-medium">{row.activity}</td>
                      <td className="px-6 py-4 text-[#7B1D23]/70">{row.details}</td>
                      <td className="px-6 py-4 text-[#7B1D23]/80">{row.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar Area */}
        <div className="space-y-8">
          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-[#EAE0D9] shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#EAE0D9] flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#7B1D23] pl-3 text-[#4A1115]">
                Notifications
              </h2>
              <Button variant="ghost" className="text-xs text-[#7B1D23] hover:text-[#4A1115] hover:bg-[#FAF6F3] font-bold">
                View All
              </Button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
              <div className="p-4 bg-[#FAF6F3] rounded-full mb-4">
                <Bell className="w-8 h-8 text-[#7B1D23]/40" />
              </div>
              <p className="text-[#4A1115] font-bold text-base">No new notifications</p>
              <p className="text-sm text-[#7B1D23]/60 font-medium mt-1">You're all caught up.</p>
            </div>
          </div>
          
          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl border border-[#EAE0D9] shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#EAE0D9] flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#7B1D23] pl-3 text-[#4A1115]">
                Upcoming Events
              </h2>
              <Button variant="ghost" className="text-xs text-[#7B1D23] hover:text-[#4A1115] hover:bg-[#FAF6F3] font-bold">
                View All
              </Button>
            </div>
            <div className="divide-y divide-[#EAE0D9]/50">
              {events.map((ev, i) => (
                <div key={i} className="p-6 flex gap-4 hover:bg-[#FAF6F3]/30 transition-colors">
                  <div className="flex flex-col items-center justify-center text-[#7B1D23]">
                    <span className="text-2xl font-black leading-none">{ev.date.split(' ')[0]}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-70">{ev.date.split(' ')[1]}</span>
                  </div>
                  <div className="border-l border-[#EAE0D9] pl-4">
                    <h4 className="font-bold text-[#4A1115] text-sm">{ev.title}</h4>
                    <div className="flex items-center gap-2 text-xs font-medium text-[#7B1D23]/70 mt-1">
                      <Clock className="w-3 h-3" />
                      {ev.time}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-[#7B1D23]/70 mt-1">
                      <MapPin className="w-3 h-3" />
                      {ev.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
