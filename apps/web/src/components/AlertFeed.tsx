import React from 'react';
import { useAlertStore } from '@/store/useAlertStore';
import { cn, formatDate } from '@/lib/utils';
import { ShieldAlert, Info, AlertTriangle, Zap, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AlertFeed: React.FC = () => {
  const { alerts, selectAlert, selectedAlertId } = useAlertStore();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <Zap className="w-4 h-4 text-neon-red shadow-[0_0_8px_rgba(255,49,49,0.5)]" />;
      case 'HIGH': return <ShieldAlert className="w-4 h-4 text-neon-amber shadow-[0_0_8px_rgba(255,191,0,0.5)]" />;
      case 'MEDIUM': return <AlertTriangle className="w-4 h-4 text-neon-blue shadow-[0_0_8px_rgba(0,243,255,0.5)]" />;
      default: return <Info className="w-4 h-4 text-white/40" />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-bg-card/20 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col">
        <AnimatePresence mode="popLayout" initial={false}>
          {alerts.map((alert) => (
            <motion.div
              layout
              key={alert.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => selectAlert(alert.id)}
              className={cn(
                'group flex items-center gap-4 p-4 cursor-pointer transition-all border-b border-white/5 relative overflow-hidden',
                selectedAlertId === alert.id 
                  ? 'bg-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]' 
                  : 'hover:bg-white/[0.03]'
              )}
            >
              {/* Highlight Bar */}
              {selectedAlertId === alert.id && (
                 <motion.div 
                   layoutId="highlight"
                   className={cn(
                     "absolute left-0 top-0 bottom-0 w-1",
                     alert.severity === 'CRITICAL' ? "bg-neon-red" : 
                     alert.severity === 'HIGH' ? "bg-neon-amber" : "bg-neon-blue"
                   )}
                 />
              )}

              <div className="shrink-0 p-2.5 bg-black/40 rounded-sm border border-white/5 group-hover:border-white/10 transition-colors">
                {getSeverityIcon(alert.severity)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-tighter truncate">
                    {alert.title}
                  </h4>
                  <span className="text-[10px] text-white/20 whitespace-nowrap font-mono">
                    {formatDate(alert.createdAt)}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-white/5 rounded-xs">
                      <MapPin className="w-3 h-3 text-white/20" />
                      <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">
                         {alert.classroom?.name || 'Classroom X'}
                      </span>
                   </div>
                   <p className="text-[10px] text-white/30 truncate leading-relaxed">
                      {alert.description || `Node ${alert.deviceId} reporting activity`}
                   </p>
                </div>
              </div>

              {alert.status === 'PENDING' && (
                <div className={cn(
                  "shrink-0 w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px]",
                  alert.severity === 'CRITICAL' ? "bg-neon-red shadow-neon-red" : 
                  alert.severity === 'HIGH' ? "bg-neon-amber shadow-neon-amber" : "bg-neon-blue shadow-neon-blue"
                )} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {alerts.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-white/5 gap-3 border border-dashed border-white/5 m-4 rounded-sm">
            <div className="p-3 bg-white/[0.02] rounded-full border border-white/5">
               <ShieldAlert className="w-10 h-10 opacity-10" />
            </div>
            <div className="text-center">
               <h5 className="text-[11px] tracking-[0.3em] font-black uppercase text-white/20">System Nominal</h5>
               <p className="text-[9px] uppercase tracking-widest text-white/10 mt-1">Ready for threat detection</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
