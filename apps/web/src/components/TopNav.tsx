import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAlertStore } from '@/store/useAlertStore';
import { ShieldCheck, Satellite, Cpu, LogOut, Activity, LayoutGrid, Users, Calendar, Inbox, Settings, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../providers/AuthContext';

export const TopNav: React.FC = () => {
  const { logout } = useAuth();
  const { alerts } = useAlertStore();
  const alertCount = alerts.length;
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <nav className="h-16 w-full border-b border-white/5 bg-bg-primary/90 backdrop-blur-2xl fixed top-0 left-0 z-50 flex items-center justify-between px-8 shadow-2xl">
      {/* Background Scanning Animation */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent" />
      
      {/* Brand & Tactical HUD */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="relative p-2.5 bg-white/5 rounded-xs border border-white/10 group-hover:border-neon-blue/30 transition-all duration-500 overflow-hidden">
             <Satellite className="w-5 h-5 text-white/40 group-hover:text-neon-blue group-hover:scale-110 transition-all duration-500" />
             <div className="absolute inset-0 bg-neon-blue/5 animate-scan" style={{ height: '2px', top: '0' }} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[14px] font-black uppercase tracking-[0.4em] text-white leading-tight">
              SMART-EYE <span className="text-neon-blue drop-shadow-[0_0_10px_rgba(0,243,255,0.3)]">TACTICAL</span>
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-[8px] text-white/20 font-bold uppercase tracking-[0.2em]">Surv-Node // 09x-D</p>
              <div className="w-1 h-1 rounded-full bg-neon-blue/40" />
              <p className="text-[8px] text-neon-blue font-mono font-bold">{formatTime(time)}</p>
            </div>
          </div>
        </div>
        
        <div className="h-10 w-px bg-white/10 hidden lg:block" />
        
        {/* Navigation Grid */}
        <div className="hidden xl:flex items-center gap-1 p-1 bg-black/20 border border-white/5 rounded-xs">
           <CustomNavLink to="/" label="Hub" icon={<LayoutGrid className="w-3 h-3" />} />
           <CustomNavLink to="/devices" label="Nodes" icon={<Satellite className="w-3 h-3" />} />
           <CustomNavLink to="/classrooms" label="Sectors" icon={<Inbox className="w-3 h-3" />} />
           <CustomNavLink to="/timetable" label="Grid" icon={<Calendar className="w-3 h-3" />} />
           <CustomNavLink to="/users" label="Personnel" icon={<Users className="w-3 h-3" />} />
           <CustomNavLink to="/alerts" label="Archive" icon={<ShieldCheck className="w-3 h-3" />} />
           <CustomNavLink to="/logs" label="Logs" icon={<Terminal className="w-3 h-3" />} />
        </div>
      </div>

      {/* Control Center */}
      <div className="flex items-center gap-6">
        {/* Tactical Scan Indicator */}
        <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-6">
           <div className="flex items-center gap-2 text-white/20">
              <Activity className="w-3 h-3 animate-pulse text-neon-blue" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] font-orbitron">Neural Sync Active</span>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="relative group cursor-pointer p-2 rounded-xs hover:bg-neon-red/10 transition-colors">
              <ShieldCheck className="w-5 h-5 text-white/40 group-hover:text-neon-red transition-colors" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neon-red text-[8px] font-black text-white shadow-[0_0_15px_rgba(255,0,60,0.6)] animate-pulse">
                  {alertCount}
                </span>
              )}
           </div>

           <div className="h-10 w-px bg-white/10" />

           {/* User Profile Block */}
           <div className="flex items-center gap-4 group cursor-pointer pl-2">
              <div className="flex flex-col items-end group-hover:translate-x-[-4px] transition-transform">
                 <span className="text-[10px] font-black text-white group-hover:text-neon-blue transition-colors uppercase tracking-wider">Root_Admin</span>
                 <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">Security L5</span>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="w-10 h-10 rounded-xs bg-black/40 border border-white/10 group-hover:border-neon-blue/50 flex items-center justify-center p-2.5 transition-all relative overflow-hidden">
                   <Cpu className="w-full h-full text-white/40 group-hover:text-neon-blue transition-colors" />
                   <div className="absolute bottom-0 left-0 w-full h-[1px] bg-neon-blue/50 animate-scan" />
                </div>
              </div>
              <button 
                onClick={logout}
                className="p-2 hover:bg-neon-red/10 rounded-xs group/btn transition-colors"
                title="System Shutdown"
              >
                <LogOut className="w-4 h-4 text-white/10 group-hover/btn:text-neon-red transition-colors" />
              </button>
           </div>
        </div>
      </div>
    </nav>
  );
};

const CustomNavLink = ({ to, label, icon }: { to: string, label: string, icon: React.ReactNode }) => {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => cn(
        "px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 rounded-xs flex items-center gap-2",
        isActive 
          ? "bg-white/10 text-neon-blue shadow-[inset_0_0_10px_rgba(0,243,255,0.1)] border border-neon-blue/20" 
          : "text-white/30 hover:text-white hover:bg-white/5"
      )}
    >
      <span className="opacity-40">{icon}</span>
      {label}
    </NavLink>
  );
};
