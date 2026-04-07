import { useState } from 'react';
import { GlowCard } from './GlowCard';
import { TacticalTerminal } from './TacticalTerminal';
import { Trash2, Download, Terminal } from 'lucide-react';

export const LogsTerminal: React.FC = () => {
  const [filter, setFilter] = useState('ALL');

  return (
    <div className="p-8 h-[calc(100vh-64px)] flex flex-col space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white/5 border border-white/10 rounded-sm">
             <Terminal className="w-5 h-5 text-neon-green" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">System <span className="text-neon-green">Telemetry</span></h2>
            <p className="text-[11px] text-white/20 uppercase tracking-[0.2em] font-bold">Real-Time Core & Worker Node Output logs</p>
          </div>
        </div>
        
        <div className="flex gap-4">
           <div className="flex bg-white/5 border border-white/10 p-1 rounded-sm gap-1">
              {['ALL', 'INFO', 'WARN', 'ERROR', 'SYSTEM'].map(lvl => (
                <button 
                  key={lvl}
                  onClick={() => setFilter(lvl)}
                  className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${
                    filter === lvl ? 'bg-neon-green text-black' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
           </div>
           <button className="p-2 bg-white/5 border border-white/10 text-white/20 hover:text-neon-red transition-all">
              <Trash2 className="w-4 h-4" />
           </button>
           <button className="px-4 py-2 bg-white/5 border border-white/10 text-white/80 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 hover:text-white transition-all">
              <Download className="w-4 h-4" />
              Download Full Log
           </button>
        </div>
      </div>

      {/* Expanded Terminal Panel */}
      <div className="flex-1 min-h-0">
        <GlowCard glowColor="green" title="Surveillance Core // 0x7FF-TERMINAL" className="h-full">
           <TacticalTerminal />
        </GlowCard>
      </div>

      {/* Stats Meta */}
      <div className="flex items-center justify-between text-[10px] text-white/10 font-mono italic px-4">
         <div className="flex items-center gap-6">
            <span>UPTIME: 124H:12M:08S</span>
            <span>LOG_BUFFER: 8.4MB / 128MB</span>
            <span className="text-neon-green">ACTIVE_STREAMS: 4/4</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-neon-green animate-ping" />
            LIVE-TELEMETRY-SYNC: 100%
         </div>
      </div>
    </div>
  );
};
