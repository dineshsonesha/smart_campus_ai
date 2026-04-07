import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthContext';
import { Shield, Lock, Mail, ChevronRight, Activity, Cpu, Globe } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      login(data.token, data.user);
      toast.success('Access Granted', {
        description: 'Welcome to the Smart-Eye Analytics Hub',
      });
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error('Access Denied', {
        description: err.message || 'Invalid credentials provided',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-bg-primary overflow-hidden font-mono">
      {/* Left Side: AI Campus Monitoring Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-black/40 border-r border-accent-blue/20 flex-col items-center justify-center overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,243,255,0.05)_0%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#00f3ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Decorative Elements */}
        <div className="relative z-10 text-center px-12">
          <div className="mb-8 inline-block p-4 border border-accent-blue/30 bg-accent-blue/5 rounded-full animate-pulse shadow-[0_0_30px_rgba(0,243,255,0.2)]">
            <Shield className="w-16 h-16 text-accent-blue" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tighter uppercase italic">
            Smart-Eye <span className="text-accent-blue">AI</span>
          </h1>
          <p className="text-gray-400 text-lg mb-12 max-w-md mx-auto normal-case">
            Unified Campus Monitoring & Real-time Vision Intelligence System. Secure access for tactical oversight.
          </p>

          <div className="grid grid-cols-3 gap-6 text-xs text-accent-blue/60 uppercase">
            <div className="p-3 border border-accent-blue/10 bg-accent-blue/5 rounded">
              <Activity className="w-4 h-4 mx-auto mb-2" />
              Real-time Feeds
            </div>
            <div className="p-3 border border-accent-blue/10 bg-accent-blue/5 rounded">
              <Cpu className="w-4 h-4 mx-auto mb-2" />
              Edge Analysis
            </div>
            <div className="p-3 border border-accent-blue/10 bg-accent-blue/5 rounded">
              <Globe className="w-4 h-4 mx-auto mb-2" />
              Spatial Mapping
            </div>
          </div>
        </div>

        {/* HUD Elements */}
        <div className="absolute top-10 left-10 p-4 border-l border-t border-accent-blue/30 text-[10px] text-accent-blue/40">
          NODE: 0x44.AP <br />
          LOC: CAMPUS_A
        </div>
        <div className="absolute bottom-10 right-10 p-4 border-r border-b border-accent-blue/30 text-[10px] text-accent-blue/40 text-right">
          STATUS: OPERATIONAL <br />
          VERSION: 3.14.HUD
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-grid-pattern relative">
        {/* Overlay Glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-blue/5 blur-[100px] rounded-full" />
        
        <div className="w-full max-w-md relative z-10">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight italic flex items-center gap-3">
              <span className="w-8 h-[2px] bg-accent-blue" />
              Auth Interface
            </h2>
            <p className="text-gray-500 uppercase text-xs tracking-widest">
              Please initialize admin credentials to proceed
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 group-focus-within:text-accent-blue transition-colors">
                Designation ID (Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-accent-blue transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full bg-black/20 border border-white/5 rounded-lg py-4 pl-12 pr-4 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition-all placeholder:text-gray-700 font-sans"
                  required
                />
              </div>
            </div>

            <div className="group space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 group-focus-within:text-accent-blue transition-colors">
                Terminal Access Code (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-accent-blue transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/20 border border-white/5 rounded-lg py-4 pl-12 pr-4 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition-all placeholder:text-gray-700 font-sans"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full group mt-8 bg-accent-blue hover:bg-cyan-400 disabled:bg-gray-700 text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-lg shadow-accent-blue/20"
            >
              {isSubmitting ? (
                <Activity className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  INITIALIZE SESSION
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between opacity-30">
            <div className="text-[8px] uppercase tracking-tighter text-gray-500">
              SECURE ENCRYPTION: AES-256 <br />
              PROTOCOL: SHA-TACTICAL
            </div>
            <div className="text-[8px] uppercase tracking-tighter text-gray-500 text-right">
              ID: SMART_EYE_CAMPUS_SYSTEM <br />
              © 2024 DEEP-MIND OVERSEE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
