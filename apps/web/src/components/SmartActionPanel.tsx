import React, { useMemo } from 'react';
import { useAlertStore } from '@/store/useAlertStore';
import { cn } from '@/lib/utils';
import { Send, CheckCircle, RefreshCcw, User, ShieldCheck, Mail, MapPin, ChevronDown } from 'lucide-react';
import { useAlerts } from '../hooks/useAlerts';
import { useUsers, UserRole } from '../hooks/useUsers';
import { toast } from 'sonner';

export const SmartActionPanel: React.FC = () => {
  const { alerts, selectedAlertId } = useAlertStore();
  const { updateStatus } = useAlerts();
  const { data: users } = useUsers();
  
  const selectedAlert = useMemo(() => 
    alerts.find(a => a.id === selectedAlertId)
  , [alerts, selectedAlertId]);

  const targetPersonnel = useMemo(() => {
    if (!selectedAlert?.targetUserId || !users) return null;
    return users.find(u => u.id === selectedAlert.targetUserId);
  }, [selectedAlert, users]);

  // Suggested personnel based on category if not specifically assigned
  const suggestedPersonnel = useMemo(() => {
    if (!users || !selectedAlert?.device) return [];
    const category = selectedAlert.device.category;
    if (category === 'PARKING') return users.filter(u => u.role === UserRole.WATCHMAN);
    if (category === 'LAB') return users.filter(u => u.role === UserRole.LAB_ASSISTANT);
    if (category === 'CLASSROOM') return users.filter(u => u.role === UserRole.TEACHER);
    return users;
  }, [users, selectedAlert]);

  if (!selectedAlert) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-black/40 relative group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="p-5 rounded-sm border border-dashed border-white/5 bg-white/[0.02] shadow-2xl animate-in zoom-in duration-700">
           <ShieldCheck className="w-12 h-12 text-white/5 group-hover:text-neon-blue/20 transition-colors duration-700" />
        </div>
        <div className="mt-6 space-y-2">
          <h4 className="text-[14px] font-black tracking-[0.3em] uppercase text-white/20 group-hover:text-white/40 transition-colors">Awaiting Input</h4>
          <p className="text-[10px] uppercase font-bold text-white/10 tracking-widest leading-relaxed">Select alert node to initiate tactical response</p>
        </div>
      </div>
    );
  }

  const handleResolve = async () => {
    try {
      await updateStatus({ id: selectedAlert.id, status: 'RESOLVED' });
    } catch (err) {}
  };

  const handleAcknowledge = async () => {
    try {
      await updateStatus({ id: selectedAlert.id, status: 'ACKNOWLEDGED' });
      toast.success('Alert acknowledged and status updated');
    } catch (err) {}
  };

  const handleAssignUser = async (userId: string) => {
    try {
      await updateStatus({ id: selectedAlert.id, status: selectedAlert.status, targetUserId: userId });
      toast.success('Personnel reassigned to tactical lead');
    } catch (err) {}
  };

  const handleSendToStaff = () => {
    if (!targetPersonnel) {
      toast.error('No personnel assigned to this tactical sector');
      return;
    }
    toast.success(`Operational Alert sent to ${targetPersonnel.name} (${targetPersonnel.role})`);
  };

  return (
    <div className="h-full w-full flex flex-col bg-bg-card/40 p-6 space-y-6 overflow-y-auto animate-in slide-in-from-right-4 duration-500 text-left">
      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
           <div className={cn(
             "px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] shadow-lg",
             selectedAlert.severity === 'CRITICAL' ? "bg-neon-red text-black" : 
             selectedAlert.severity === 'HIGH' ? "bg-neon-amber text-black" : "bg-neon-blue text-black"
           )}>
              PROTOCOL {selectedAlert.severity}
           </div>
           <span className="text-white/20 text-[9px] tracking-widest font-mono uppercase">ID: {selectedAlert.id.slice(0, 8)}</span>
        </div>
        <div>
           <h3 className="text-[20px] font-black text-white italic tracking-tighter uppercase leading-none">{selectedAlert.title}</h3>
           <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-3.5 h-3.5 text-white/20" />
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
                 {selectedAlert.classroom?.name || 'Classroom Sector'} // {selectedAlert.device?.category}
              </span>
           </div>
        </div>
      </div>

      {/* Auto-Personnel Finding Module */}
      <div className="p-4 border border-white/5 bg-black/60 rounded-xs space-y-4 shadow-inner">
         <div className="flex flex-col gap-3">
            <span className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black">Tactical Lead Personnel</span>
            
            <div className="relative group/select">
               <select 
                 className="w-full bg-white/[0.03] border border-white/10 p-3 text-white text-[11px] font-bold uppercase tracking-tight outline-none focus:border-neon-blue appearance-none cursor-pointer"
                 value={selectedAlert.targetUserId || ''}
                 onChange={(e) => handleAssignUser(e.target.value)}
               >
                 <option value="" disabled className="bg-bg-primary">SELECT TARGET PERSONNEL</option>
                 {suggestedPersonnel.map(u => (
                   <option key={u.id} value={u.id} className="bg-bg-primary">
                     {u.name} [{u.role}]
                   </option>
                 ))}
                 <option value="" className="bg-bg-primary text-white/20">--- OTHER PERSONNEL ---</option>
                 {users?.filter(u => !suggestedPersonnel.find(s => s.id === u.id)).map(u => (
                   <option key={u.id} value={u.id} className="bg-bg-primary">
                     {u.name} [{u.role}]
                   </option>
                 ))}
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none group-hover/select:text-neon-blue transition-colors" />
            </div>

            {targetPersonnel ? (
              <div className="flex items-center gap-2 text-neon-blue font-black text-[11px] uppercase p-2 bg-neon-blue/5 border border-neon-blue/10 animate-in fade-in zoom-in duration-300">
                 <ShieldCheck className="w-3.5 h-3.5" />
                 DESIGNATED: {targetPersonnel.name}
              </div>
            ) : (
              <div className="text-[10px] font-black text-neon-red uppercase tracking-tight animate-pulse bg-neon-red/5 p-2 border border-neon-red/10">
                 UNASSIGNED - SECTOR VULNERABLE
              </div>
            )}
         </div>
         
         <div className="space-y-3 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 text-[10px] text-white/40 mb-1 tracking-widest uppercase font-black">
               <Mail className="w-3 h-3" />
               Tactical Brief Preview
            </div>
            <div className="bg-white/[0.02] p-4 text-[11px] border-l-2 border-neon-blue shadow-lg leading-relaxed relative overflow-hidden group">
               <div className="absolute inset-0 bg-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <p className="text-white relative z-10">
                  <span className="text-neon-blue font-bold tracking-widest opacity-50 block mb-1">AUTOMATED DISPATCH // INTEL-FETCH</span>
                  "DETECTION ALERT: {selectedAlert.title} in sector {selectedAlert.classroom?.name}. Level {selectedAlert.severity} protocol triggered. Monitoring feed available on your terminal. ACTION REQUIRED."
               </p>
            </div>
         </div>
      </div>

      {/* Execution Control */}
      <div className="mt-auto flex flex-col gap-3">
         <button 
           onClick={handleSendToStaff}
           disabled={!targetPersonnel}
           className={cn(
             "w-full px-4 py-3 border text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group relative overflow-hidden",
             targetPersonnel 
              ? "bg-white/5 border-white/10 text-neon-blue hover:bg-white/10" 
              : "border-white/5 text-white/10 cursor-not-allowed"
           )}
         >
           {targetPersonnel && <div className="absolute inset-0 bg-neon-blue/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />}
           <Send className="w-4 h-4 relative z-10" />
           <span className="relative z-10">Transmit to Personnel</span>
         </button>
         
         <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleAcknowledge}
              disabled={selectedAlert.status === 'ACKNOWLEDGED'}
              className={cn(
                "px-4 py-3 border text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                selectedAlert.status === 'ACKNOWLEDGED' 
                  ? "border-neon-green/20 text-neon-green/40 cursor-default" 
                  : "border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <RefreshCcw className={cn("w-4 h-4", selectedAlert.status !== 'ACKNOWLEDGED' && "animate-spin-slow")} />
              ACK
            </button>
            <button 
              onClick={handleResolve}
              className="px-4 py-3 bg-neon-green text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-neon-green/80 flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:shadow-[0_0_25px_rgba(57,255,20,0.5)]"
            >
              <CheckCircle className="w-4 h-4" />
              Resolve
            </button>
         </div>
      </div>
    </div>
  );
};
