import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, Calendar, UserX, RefreshCw, CheckCircle, FileText, Bell, MapPin, Clock, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardHOD() {
  const { user } = useAuthStore();

  const [data, setData] = useState({
    staffCount: 0,
    substitutions: 0,
    completedSubstitutions: 0,
    leaves: 0
  });
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', location: '', audience: 'ALL', poster: '' });
  const [events, setEvents] = useState<any[]>([]);
  const [absentLogs, setAbsentLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, leaveRes, eventRes] = await Promise.all([
          api.get('/substitutions'),
          api.get('/leaves').catch(() => ({ data: [] })),
          api.get('/events').catch(() => ({ data: [] }))
        ]);
        
        const subs = subRes.data || [];
        const pendingSubs = subs.filter((s: any) => s.status === 'PENDING' || s.status === 'Pending').length;
        const completedSubs = subs.filter((s: any) => s.status === 'APPROVED' || s.status === 'Accepted').length;
        
        const leaves = leaveRes.data || [];
        const pendingLeaves = leaves.filter((l: any) => l.status === 'PENDING' || l.status === 'Pending').length;
        
        // Populate absent logs (substitution history)
        // Grouping by fromStaff to show who is absent and who they requested
        setAbsentLogs(subs);

        setData({
          staffCount: 19, // Static for now if /users endpoint doesn't allow HOD to fetch all
          substitutions: pendingSubs,
          completedSubstitutions: completedSubs,
          leaves: pendingLeaves
        });

        // Parse events date
        const fetchedEvents = eventRes.data.map((ev: any) => {
          const d = new Date(ev.date);
          const shortDate = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' }).toUpperCase()}`;
          return { ...ev, shortDate };
        });
        setEvents(fetchedEvents);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Total Staff', value: data.staffCount, desc: 'Active members', icon: Users, color: 'bg-[#eaf2e8] text-[#01949a]' },
    { label: 'Classes Today', value: '18', desc: 'Scheduled', icon: Calendar, color: 'bg-[#eaf2e8] text-[#01949a]' },
    { label: 'Absent Today', value: '2', desc: 'View details →', icon: UserX, color: 'bg-[#eaf2e8] text-[#01949a]' },
    { label: 'Pending Substitutions', value: data.substitutions, desc: 'Requires action', icon: RefreshCw, color: 'bg-[#eaf2e8] text-[#01949a]' },
    { label: 'Completed Substitutions', value: data.completedSubstitutions, desc: 'Today', icon: CheckCircle, color: 'bg-[#eaf2e8] text-[#01949a]' },
    { label: 'Pending Leave Requests', value: data.leaves, desc: 'Requires approval', icon: FileText, color: 'bg-[#eaf2e8] text-[#01949a]' },
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

  const handlePostEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/events', eventForm);
      const d = new Date(eventForm.date);
      const shortDate = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' }).toUpperCase()}`;
      setEvents(prev => [{ ...eventForm, shortDate }, ...prev]);
      setShowEventModal(false);
      alert('Event Posted Successfully!');
      setEventForm({ title: '', date: '', time: '', location: '', audience: 'ALL', poster: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to post event.');
    }
  };

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventForm(prev => ({ ...prev, poster: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] font-bold text-[#017a80] leading-tight tracking-tight">
            Good Morning, {user?.name || 'Dr. Antony Das'}
          </h1>
          <p className="text-[#01949a]/70 font-medium mt-1">Here's an overview of the department.</p>
        </div>
        <div className="hidden lg:block border-l-2 border-[#01949a]/20 pl-6 py-1">
          <p className="text-[#01949a]/80 italic max-w-[200px] text-sm font-medium">
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
                <Card key={i} className="border border-[#dbe8d8] shadow-sm bg-white hover:shadow-md transition-shadow rounded-2xl">
                  <CardContent className="p-5 flex gap-4 items-center">
                    <div className={`p-4 rounded-xl ${stat.color}`}>
                      <Icon className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div>
                      <p className="text-[13px] text-[#01949a]/70 font-bold">{stat.label}</p>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <h3 className="text-2xl font-black text-[#017a80] tracking-tight">{stat.value}</h3>
                      </div>
                      <p className="text-[11px] font-semibold text-[#01949a]/50 mt-1 cursor-pointer hover:text-[#01949a] transition-colors">
                        {stat.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Today's Schedule Area */}
          <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#dbe8d8] flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#01949a] pl-3 text-[#017a80]">
                Today's Schedule
              </h2>
              <Link to="/class-timetables">
                <Button className="text-xs bg-[#017a80] text-white hover:bg-[#015a60] border-0 rounded-lg shadow-sm font-bold">
                  View Full Timetable →
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f4f8f3] text-[#01949a] font-bold text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Class</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Staff</th>
                    <th className="px-6 py-4">Room</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dbe8d8]/50">
                  {schedule.map((row, i) => (
                    <tr key={i} className="hover:bg-[#f4f8f3]/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#017a80]">{row.time}</td>
                      <td className="px-6 py-4 text-[#01949a]/80">{row.class}</td>
                      <td className="px-6 py-4 text-[#01949a]/80">{row.subject}</td>
                      <td className="px-6 py-4 text-[#01949a]/80">{row.staff}</td>
                      <td className="px-6 py-4 text-[#01949a]/80">{row.room}</td>
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
          <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#dbe8d8] flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#01949a] pl-3 text-[#017a80]">
                Recent Activity
              </h2>
              <Link to="/reports">
                <Button variant="ghost" className="text-xs text-[#01949a] hover:text-[#017a80] hover:bg-[#f4f8f3] font-bold">
                  View All
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f4f8f3] text-[#01949a] font-bold text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Activity</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dbe8d8]/50">
                  {activities.map((row, i) => (
                    <tr key={i} className="hover:bg-[#f4f8f3]/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#017a80]">{row.time}</td>
                      <td className="px-6 py-4 text-[#01949a]/80 font-medium">{row.activity}</td>
                      <td className="px-6 py-4 text-[#01949a]/70">{row.details}</td>
                      <td className="px-6 py-4 text-[#01949a]/80">{row.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Absentees & Substitution Logs */}
          <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm overflow-hidden mt-8">
            <div className="p-6 border-b border-[#dbe8d8] flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#01949a] pl-3 text-[#017a80]">
                Substitution & Absentees Log
              </h2>
            </div>
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm text-left relative">
                <thead className="bg-[#f4f8f3] text-[#01949a] font-bold text-xs uppercase sticky top-0 shadow-sm">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Absent Staff</th>
                    <th className="px-6 py-4">Requested Substitute</th>
                    <th className="px-6 py-4">Class & Period</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dbe8d8]/50">
                  {absentLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-[#01949a]/60 font-medium">No logs available</td>
                    </tr>
                  ) : absentLogs.map((log, i) => (
                    <tr key={log._id || i} className="hover:bg-[#f4f8f3]/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#017a80]">
                        {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#d93838]">
                        {log.fromStaff?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#017a80]">
                        {log.toStaff?.name || 'Pending/AI'}
                      </td>
                      <td className="px-6 py-4 text-[#01949a]/80 font-medium">
                        Period {log.timetableSlot?.period} - {log.timetableSlot?.classId?.year} Yr {log.timetableSlot?.classId?.department}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                          log.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          log.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          'bg-red-100 text-red-700 border-red-200'
                        }`}>
                          {log.status}
                        </span>
                      </td>
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
          <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#dbe8d8] flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#01949a] pl-3 text-[#017a80]">
                Notifications
              </h2>
              <Link to="/notifications">
                <Button variant="ghost" className="text-xs text-[#01949a] hover:text-[#017a80] hover:bg-[#f4f8f3] font-bold">
                  View All
                </Button>
              </Link>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
              <div className="p-4 bg-[#f4f8f3] rounded-full mb-4">
                <Bell className="w-8 h-8 text-[#01949a]/40" />
              </div>
              <p className="text-[#017a80] font-bold text-base">No new notifications</p>
              <p className="text-sm text-[#01949a]/60 font-medium mt-1">You're all caught up.</p>
            </div>
          </div>
          
          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl border border-[#dbe8d8] shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#dbe8d8] flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#01949a] pl-3 text-[#017a80]">
                Upcoming Events
              </h2>
              <Button onClick={() => setShowEventModal(true)} variant="outline" className="text-xs text-[#017a80] border-[#01949a] hover:bg-[#017a80] hover:text-white font-bold h-8 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Post Event
              </Button>
            </div>
            <div className="divide-y divide-[#dbe8d8]/50">
              {events.map((ev, i) => (
                <div key={i} className="p-6 flex gap-4 hover:bg-[#f4f8f3]/30 transition-colors">
                  <div className="flex flex-col items-center justify-center text-[#01949a] min-w-[50px]">
                    <span className="text-2xl font-black leading-none">{ev.shortDate?.split(' ')[0] || ev.date?.split('-')[2]}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-70">{ev.shortDate?.split(' ')[1]}</span>
                  </div>
                  <div className="border-l border-[#dbe8d8] pl-4 w-full">
                    <h4 className="font-bold text-[#017a80] text-sm">{ev.title}</h4>
                    <div className="flex items-center gap-2 text-xs font-medium text-[#01949a]/70 mt-1">
                      <Clock className="w-3 h-3" />
                      {ev.time}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-[#01949a]/70 mt-1">
                      <MapPin className="w-3 h-3" />
                      {ev.location}
                    </div>
                    {ev.poster && (
                      <div className="mt-3">
                        <img src={ev.poster} alt="Event Poster" className="w-full h-auto max-h-32 object-cover rounded-xl border border-[#dbe8d8] shadow-sm" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Post Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2f5061]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl relative border border-[#dbe8d8] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button onClick={() => setShowEventModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black text-[#017a80] mb-6">Post New Event</h2>
            <form onSubmit={handlePostEvent} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-[#01949a]">Event Title / Guest Lecture Name</label>
                <input required type="text" className="w-full mt-1 p-3 border border-[#dbe8d8] rounded-xl bg-[#f4f8f3] focus:outline-none focus:border-[#017a80]" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-[#01949a]">Date</label>
                  <input required min={new Date().toISOString().split('T')[0]} type="date" className="w-full mt-1 p-3 border border-[#dbe8d8] rounded-xl bg-[#f4f8f3] focus:outline-none focus:border-[#017a80]" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-bold text-[#01949a]">Time</label>
                  <select required className="w-full mt-1 p-3 border border-[#dbe8d8] rounded-xl bg-[#f4f8f3] focus:outline-none focus:border-[#017a80]" value={eventForm.time} onChange={e => setEventForm({...eventForm, time: e.target.value})}>
                    <option value="" disabled>Select Time</option>
                    <option value="08:30 AM">08:30 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="12:30 PM">12:30 PM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="01:30 PM">01:30 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-[#01949a]">Location / Venue</label>
                <input required type="text" className="w-full mt-1 p-3 border border-[#dbe8d8] rounded-xl bg-[#f4f8f3] focus:outline-none focus:border-[#017a80]" value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-bold text-[#01949a]">Audience</label>
                <select className="w-full mt-1 p-3 border border-[#dbe8d8] rounded-xl bg-[#f4f8f3] focus:outline-none focus:border-[#017a80]" value={eventForm.audience} onChange={e => setEventForm({...eventForm, audience: e.target.value})}>
                  <option value="ALL">All (Staff & Students)</option>
                  <option value="STUDENTS">Students Only</option>
                  <option value="STAFF">Staff Only</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-[#01949a]">Event Poster / Image (Optional)</label>
                <input type="file" accept="image/*" onChange={handlePosterUpload} className="w-full mt-1 p-2 text-sm border border-[#dbe8d8] rounded-xl bg-[#f4f8f3] focus:outline-none file:bg-[#017a80] file:text-white file:border-0 file:px-4 file:py-1 file:rounded-md file:mr-3 file:font-bold hover:file:bg-[#015a60]" />
                {eventForm.poster && (
                  <div className="mt-3">
                    <img src={eventForm.poster} alt="Preview" className="h-24 w-auto rounded-lg border border-[#dbe8d8] shadow-sm" />
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full py-4 text-sm font-bold rounded-xl mt-4 bg-[#017a80] text-white hover:bg-[#015a60]">Post Event</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
