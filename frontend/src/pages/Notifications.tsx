import { useState, useEffect } from 'react';
import { useSocketStore } from '../stores/socketStore';
import { Card, CardContent } from '../components/ui/card';
import { Bell, Calendar as CalendarIcon, CheckCircle, Clock, Info, MapPin, X } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';

export default function Notifications() {
  const { socket } = useSocketStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNewNotification = (data: any) => {
        setNotifications(prev => [data, ...prev]);
      };
      socket.on('new_notification', handleNewNotification);
      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [socket]);

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      try {
        await api.patch(`/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }

    if (notif.type === 'EVENT' && notif.relatedId) {
      try {
        const res = await api.get(`/events/${notif.relatedId}`);
        setSelectedEvent(res.data);
      } catch (err) {
        console.error('Error fetching event details:', err);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'EVENT': return <CalendarIcon className="w-6 h-6" />;
      case 'high_absenteeism': return <Info className="w-6 h-6" />;
      default: return <Bell className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#017a80]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[800px] mx-auto pb-10">
      <div className="flex items-center gap-3 border-b border-[#dbe8d8] pb-4">
        <div className="p-3 bg-[#f4f8f3] rounded-xl text-[#017a80]">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#017a80]">Notifications</h1>
          <p className="text-sm font-medium text-[#01949a]/70 mt-1">Stay updated with department alerts and events</p>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#dbe8d8] p-12 text-center shadow-sm">
            <Bell className="w-12 h-12 text-[#01949a]/20 mx-auto mb-4" />
            <p className="text-lg font-bold text-[#017a80]">You're all caught up!</p>
            <p className="text-sm text-[#01949a]/60 font-medium mt-1">No new notifications to show right now.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <Card 
              key={notif._id} 
              className={`border transition-all cursor-pointer ${
                notif.isRead 
                  ? 'bg-white border-[#dbe8d8] opacity-75' 
                  : 'bg-[#f4f8f3] border-[#01949a]/30 shadow-md'
              }`}
              onClick={() => handleNotificationClick(notif)}
            >
              <CardContent className="p-5 flex gap-4">
                <div className={`p-3 rounded-full h-fit flex-shrink-0 ${
                  notif.isRead ? 'bg-[#eaf2e8] text-[#01949a]/60' : 'bg-[#017a80] text-white'
                }`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className={`font-bold ${notif.isRead ? 'text-[#017a80]/80' : 'text-[#017a80]'}`}>
                      {notif.title || (notif.type === 'EVENT' ? 'New Event Posted' : 'Notification')}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#01949a]/50 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {format(new Date(notif.createdAt), 'MMM d, h:mm a')}
                    </div>
                  </div>
                  <p className={`mt-1.5 text-sm ${notif.isRead ? 'text-[#01949a]/70 font-medium' : 'text-[#01949a] font-semibold'}`}>
                    {notif.content || notif.message}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#d93838] self-center flex-shrink-0" />
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2f5061]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-lg shadow-2xl relative border border-[#dbe8d8] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6 border-b border-[#dbe8d8] pb-4">
              <div className="p-3 bg-[#eaf2e8] rounded-xl text-[#01949a]">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#017a80] leading-tight">{selectedEvent.title}</h2>
                <p className="text-xs font-bold text-[#01949a]/60 uppercase tracking-wider mt-1">Department Event</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[#017a80] bg-[#f4f8f3] p-4 rounded-xl border border-[#dbe8d8]">
                <CalendarIcon className="w-5 h-5 opacity-70" />
                <span className="font-bold">{selectedEvent.date}</span>
              </div>
              <div className="flex items-center gap-3 text-[#017a80] bg-[#f4f8f3] p-4 rounded-xl border border-[#dbe8d8]">
                <Clock className="w-5 h-5 opacity-70" />
                <span className="font-bold">{selectedEvent.time}</span>
              </div>
              <div className="flex items-center gap-3 text-[#017a80] bg-[#f4f8f3] p-4 rounded-xl border border-[#dbe8d8]">
                <MapPin className="w-5 h-5 opacity-70" />
                <span className="font-bold">{selectedEvent.location}</span>
              </div>
              
              {selectedEvent.poster && (
                <div className="mt-6 border border-[#dbe8d8] rounded-xl overflow-hidden shadow-sm">
                  <p className="text-xs font-bold text-[#01949a]/70 uppercase tracking-wider bg-[#f4f8f3] p-3 border-b border-[#dbe8d8]">Event Poster</p>
                  <img src={selectedEvent.poster} alt="Event Poster" className="w-full h-auto object-contain bg-black/5" />
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-end">
              <button onClick={() => setSelectedEvent(null)} className="px-6 py-2.5 bg-[#017a80] text-white rounded-xl font-bold hover:bg-[#015a60] transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
