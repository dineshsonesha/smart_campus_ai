import React, { useEffect, useRef } from 'react';
import { useLogStore } from '@/store/useLogStore';
import { cn } from '@/lib/utils';

export const TacticalTerminal: React.FC = () => {
  const { logs } = useLogStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0; // Descending order implementation
    }
  }, [logs]);

  const levelStyles = {
    INFO: 'text-gray-400',
    SUCCESS: 'text-neon-green',
    WARN: 'text-neon-amber',
    ERROR: 'text-neon-red animate-pulse',
    SYSTEM: 'text-neon-blue font-bold',
  };

  return (
    <div 
      ref={scrollRef}
      className="h-full w-full bg-black/40 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto custom-scrollbar"
    >
      <div className="flex flex-col gap-1.5 pt-2">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 group animate-in fade-in slide-in-from-left-4 duration-300">
            <span className="text-white/20 shrink-0">[{log.timestamp}]</span>
            <span className={cn('shrink-0 w-16 uppercase', levelStyles[log.level])}>
              {log.level}
            </span>
            <span className="text-gray-300 group-hover:text-white transition-colors">
              {log.message}
            </span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-white/10 italic py-4 animate-pulse">
            INITIALIZING TACTICAL DATA STREAM...
          </div>
        )}
      </div>
    </div>
  );
};
