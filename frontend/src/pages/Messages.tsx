import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useSocketStore } from '../stores/socketStore';
import api from '../services/api';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Messages() {
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all users to chat with
  useEffect(() => {
    api.get('/users').then((res) => {
      // Filter out self
      setUsers(res.data.filter((u: any) => u._id !== user?.id));
    });
  }, [user]);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      api.get(`/messages/${selectedUser._id}`).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedUser]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for incoming messages
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (msg: any) => {
        // If the message belongs to the currently selected conversation, append it
        if (
          selectedUser &&
          (msg.sender === selectedUser._id || msg.receiver === selectedUser._id)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      };

      socket.on('new_message', handleNewMessage);
      return () => {
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [socket, selectedUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const res = await api.post('/messages', {
        receiver: selectedUser._id,
        content: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-2xl border border-[#EAE0D9] shadow-sm overflow-hidden animate-in fade-in duration-500 max-w-[1200px] mx-auto">
      {/* Sidebar: Users List */}
      <div className="w-80 border-r border-[#EAE0D9] bg-[#FAF6F3] flex flex-col">
        <div className="p-5 border-b border-[#EAE0D9] bg-white">
          <h2 className="text-lg font-bold flex items-center gap-2 border-l-4 border-[#7B1D23] pl-3 text-[#4A1115]">
            <MessageSquare className="w-5 h-5" />
            Conversations
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar p-3 space-y-2">
          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => setSelectedUser(u)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                selectedUser?._id === u._id
                  ? 'bg-[#7B1D23] text-white shadow-md'
                  : 'bg-white text-[#4A1115] hover:bg-[#F2EAE5] border border-[#EAE0D9]'
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  selectedUser?._id === u._id ? 'bg-white/20' : 'bg-[#FAF6F3]'
                }`}
              >
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{u.name}</p>
                <p
                  className={`text-[10px] font-bold tracking-wider uppercase truncate mt-0.5 ${
                    selectedUser?._id === u._id ? 'text-white/70' : 'text-[#7B1D23]/60'
                  }`}
                >
                  {u.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#FDFBF9]">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-5 border-b border-[#EAE0D9] bg-white flex items-center gap-4">
              <div className="p-3 bg-[#FAF6F3] rounded-full text-[#7B1D23]">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#4A1115]">{selectedUser.name}</h2>
                <p className="text-[10px] font-bold tracking-wider uppercase text-[#7B1D23]/60 mt-0.5">
                  {selectedUser.role.replace('_', ' ')}
                </p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#7B1D23]/40">
                  <MessageSquare className="w-12 h-12 mb-3" />
                  <p className="font-bold text-[#4A1115]">No messages yet</p>
                  <p className="text-sm font-medium">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender === user?.id;
                  return (
                    <div
                      key={msg._id || i}
                      className={`flex flex-col ${
                        isMe ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-4 rounded-2xl text-sm shadow-sm ${
                          isMe
                            ? 'bg-[#4A1115] text-white rounded-br-none'
                            : 'bg-white border border-[#EAE0D9] text-[#4A1115] rounded-bl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-[#7B1D23]/50 font-bold mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-5 bg-white border-t border-[#EAE0D9]">
              <form onSubmit={handleSendMessage} className="flex gap-3 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#FAF6F3] border border-[#EAE0D9] rounded-full px-6 py-3.5 text-sm font-medium text-[#4A1115] focus:outline-none focus:ring-2 focus:ring-[#7B1D23]/20 transition-all placeholder:text-[#7B1D23]/40"
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-[#4A1115] text-white hover:bg-[#632220] rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-md transition-all absolute right-1.5 top-1.5"
                >
                  <Send className="w-5 h-5 ml-1" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#7B1D23]/40">
            <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
            <h2 className="text-xl font-bold text-[#4A1115] mb-2">Your Messages</h2>
            <p className="text-sm font-medium max-w-sm">
              Select a conversation from the sidebar to start chatting with staff, HODs, or class representatives.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
