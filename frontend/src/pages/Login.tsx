import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useSocketStore } from '../stores/socketStore';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Crown, User, GraduationCap, Eye, EyeOff, Lock, ArrowRight, UserCheck, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const ROLE_OPTIONS = [
  { id: 'HOD', label: 'HOD', icon: Crown },
  { id: 'STAFF', label: 'STAFF', icon: User },
  { id: 'CLASS_REPRESENTATIVE', label: 'CLASS REPRESENTATIVE', icon: GraduationCap },
  { id: 'STUDENT', label: 'STUDENT', icon: User },
];

export default function Login() {
  const [role, setRole] = useState('STAFF');
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
      if (user.role !== role && !(role === 'CLASS_REPRESENTATIVE' && user.role === 'CLASS_REPRESENTATIVE')) {
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
    <div className="min-h-screen w-full relative flex flex-col md:flex-row items-center overflow-hidden font-sans bg-[#0c1a25]">
      
      {/* Background Image: Responsive handling */}
      {/* Mobile Background */}
      <div className="absolute inset-0 z-0 md:hidden block">
        <img 
          src="/mobile4.png?v=3" 
          alt="Background Mobile" 
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle overlay for better text readability if needed */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
      </div>

      {/* Desktop Background */}
      <div className="absolute inset-0 z-0 hidden md:block">
        <img 
          src="/pc3.png?v=3" 
          alt="Background Desktop" 
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Main Login Container */}
      {/* Positioned centered on mobile, right-aligned on desktop */}
      <div className="relative z-10 w-full md:w-[60%] lg:w-[50%] xl:w-[45%] md:ml-auto p-6 sm:p-8 flex flex-col justify-center h-full min-h-screen">
        
        <div className="w-full max-w-[500px] mx-auto md:ml-0 md:mr-auto lg:mx-auto">
          
          <div className="text-center md:text-left mb-8 md:mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              Welcome <span className="text-[#56C7C5]">Back</span>
            </h1>
            <div className="h-1 w-12 bg-[#56C7C5] mt-4 mx-auto md:mx-0 rounded-full drop-shadow-md"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 md:space-y-7">
            
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white/90 drop-shadow-md">Select Your Role</label>
              
              {/* Desktop layout: strictly 1 row */}
              <div className="hidden md:grid grid-cols-4 gap-3">
                {ROLE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = role === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRole(opt.id)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300
                        ${isSelected 
                          ? 'bg-gradient-to-b from-[#56C7C5] to-[#258F94] text-white shadow-[0_6px_15px_rgba(86,199,197,0.30),inset_0_2px_4px_rgba(255,255,255,0.3)] border border-[#8DE3DF]/60 scale-105' 
                          : 'bg-white/10 backdrop-blur-md text-white/80 border border-white/20 shadow-sm hover:bg-white/20 hover:text-white hover:shadow-[0_4px_12px_rgba(86,199,197,0.15)]'}`}
                    >
                      <Icon className="w-6 h-6 mb-2" strokeWidth={1.5} />
                      <span className="text-[9px] font-bold tracking-widest text-center uppercase leading-tight px-1">
                        {opt.label.split(' ').map((w, i) => <span key={i}>{w}<br/></span>)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile layout: 2x2 grid */}
              <div className="grid md:hidden grid-cols-2 gap-3">
                {ROLE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = role === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRole(opt.id)}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300
                        ${isSelected 
                          ? 'bg-gradient-to-b from-[#56C7C5] to-[#258F94] text-white shadow-[0_6px_15px_rgba(86,199,197,0.30),inset_0_2px_4px_rgba(255,255,255,0.3)] border border-[#8DE3DF]/60' 
                          : 'bg-white/10 backdrop-blur-md text-white/80 border border-white/20 shadow-sm hover:bg-white/20 hover:shadow-[0_4px_12px_rgba(86,199,197,0.15)]'}`}
                    >
                      <Icon className="w-6 h-6 mb-2" strokeWidth={1.5} />
                      <span className="text-[10px] font-bold tracking-widest text-center uppercase leading-tight">
                        {opt.label.split(' ').map((w, i, arr) => <span key={i}>{w}{i !== arr.length - 1 && <br/>}</span>)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-5 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90 drop-shadow-md">Username / Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-white/70" />
                  </div>
                  <Input 
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-12 bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-[#56C7C5]/50 focus-visible:border-[#8DE3DF]/70 h-14 text-sm rounded-2xl shadow-inner transition-all focus:bg-white/20 focus:shadow-[0_0_15px_rgba(86,199,197,0.2)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90 drop-shadow-md">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/70" />
                  </div>
                  <Input 
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-12 pr-12 bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-[#56C7C5]/50 focus-visible:border-[#8DE3DF]/70 h-14 text-sm rounded-2xl shadow-inner transition-all focus:bg-white/20 focus:shadow-[0_0_15px_rgba(86,199,197,0.2)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-white/70 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="animate-in fade-in slide-in-from-top-1 text-red-200 text-sm text-center bg-red-500/20 backdrop-blur-md py-3 rounded-xl font-medium border border-red-500/30">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full relative overflow-hidden bg-gradient-to-r from-[#258F94] to-[#56C7C5] hover:from-[#207A7F] hover:to-[#4EB3B1] text-white border border-[#8DE3DF]/30 h-14 text-lg font-medium tracking-wide rounded-2xl shadow-[0_6px_20px_rgba(86,199,197,0.30),inset_0_2px_4px_rgba(255,255,255,0.3)] hover:shadow-[0_8px_25px_rgba(86,199,197,0.40),inset_0_2px_4px_rgba(255,255,255,0.4)] active:scale-[0.98] active:shadow-[0_2px_10px_rgba(86,199,197,0.20),inset_0_2px_8px_rgba(0,0,0,0.1)] transition-all group mt-6"
            >
              <span className="relative z-10 flex items-center justify-center">
                Login 
                <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            
          </form>
        </div>
      </div>
    </div>
  );
}
