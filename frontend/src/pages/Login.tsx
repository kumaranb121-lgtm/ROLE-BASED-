import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useSocketStore } from '../stores/socketStore';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Crown, User, GraduationCap, Eye, EyeOff, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const ROLE_OPTIONS = [
  { id: 'HOD', label: 'HOD', icon: Crown },
  { id: 'STAFF', label: 'STAFF', icon: User },
  { id: 'CLASS_REPRESENTATIVE', label: 'CLASS REPRESENTATIVE', icon: GraduationCap },
];

export default function Login() {
  const [role, setRole] = useState('HOD');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const login = useAuthStore((s) => s.login);
  const connect = useSocketStore((s) => s.connect);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', {
        username: identifier,
        password
      });
      
      const { user, token } = res.data;
      if (user.role !== role) {
        setError('Selected role does not match user account.');
        return;
      }
      
      login(user, token);
      connect(token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-[url('/Mobile2.png')] md:bg-[url('/PC.png')] flex items-center justify-center p-4">
      
      <div className="w-full max-w-[420px] bg-[#FAF6F3] p-8 rounded-[30px] shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold text-[#4A1115]">Welcome Back</h1>
          <div className="h-[2px] w-12 bg-[#7B1D23] mx-auto mt-3" />
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-[#4A1115]">Select your role</label>
            <div className="grid grid-cols-3 gap-3">
              {ROLE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = role === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRole(opt.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
                      ${isSelected 
                        ? 'bg-[#7B1D23] text-white border-[#7B1D23] shadow-md' 
                        : 'bg-[#F2EAE5] text-[#7B1D23] border-transparent hover:bg-[#EAE0D9]'}`}
                  >
                    <Icon className="w-6 h-6 mb-2" />
                    <span className="text-[9px] font-bold tracking-wider text-center uppercase leading-tight">
                      {opt.label.split(' ').map((w, i) => <span key={i}>{w}<br/></span>)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#4A1115]">Username / Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-[#7B1D23]" />
                </div>
                <Input 
                  required
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="Enter your username or email"
                  className="pl-10 bg-white border-[#EAE0D9] text-[#4A1115] placeholder:text-[#4A1115]/40 focus-visible:ring-[#7B1D23] h-12 rounded-xl shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#4A1115]">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#7B1D23]" />
                </div>
                <Input 
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 bg-white border-[#EAE0D9] text-[#4A1115] placeholder:text-[#4A1115]/40 focus-visible:ring-[#7B1D23] h-12 rounded-xl shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-[#7B1D23]/60 hover:text-[#7B1D23]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center text-sm font-medium">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <div className="w-4 h-4 rounded border-2 border-[#7B1D23] bg-white group-hover:bg-[#F2EAE5] flex items-center justify-center transition-colors">
                <div className="w-2 h-2 rounded-sm bg-[#7B1D23]" />
              </div>
              <span className="text-[#4A1115]">Keep me signed in</span>
            </label>
          </div>

          {error && <div className="text-red-700 text-sm text-center bg-red-100 py-2 rounded-md font-medium border border-red-200">{error}</div>}

          <Button type="submit" className="w-full bg-[#7B1D23] hover:bg-[#5A1218] text-white border-0 h-14 text-base font-bold rounded-xl shadow-md transition-all">
            Sign In 
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
