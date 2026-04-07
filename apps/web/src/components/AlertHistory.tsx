import React, { useState } from 'react';
import { GlowCard } from './GlowCard';
import { TacticalTable } from './TacticalTable';
import { Download, Search, Zap, Calendar } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { useAlerts } from '../hooks/useAlerts';

export const AlertHistory: React.FC = () => {
  const { data: rawAlerts, isLoading } = useAlerts();
  const [searchTerm, setSearchTerm] = useState('');

  const alerts = rawAlerts?.filter(a => 
    a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const columns = [
    { header: 'Alert ID', accessor: 'id' as const },
    { 
      header: 'Tactical Issue', 
      accessor: (item: any) => (
        <div className="flex items-center gap-2 font-bold uppercase text-white/90">
           {item.type.replace('_', ' ')}
        </div>
      ) 
    },
    { 
      header: 'Severity', 
      accessor: (item: any) => (
        <div className="flex items-center gap-2">
           <div className={cn(
             "w-2 h-2 rounded-full",
             item.severity === 'CRITICAL' ? 'bg-neon-red shadow-[0_0_8px_rgba(255,0,60,1)]' :
             item.severity === 'HIGH' ? 'bg-neon-amber' :
             item.severity === 'MEDIUM' ? 'bg-neon-blue' : 'bg-gray-500'
           )} />
           {item.severity}
        </div>
      ) 
    },
    { header: 'Surveillance Node', accessor: (item: any) => item.device?.name || 'N/A' },
    { header: 'Timestamp', accessor: (item: any) => formatDate(item.createdAt) },
    { 
      header: 'Resolution Status', 
      accessor: (item: any) => (
        <span className={cn(
          "px-2 py-0.5 text-[9px] font-black uppercase rounded-xs border",
          item.status === 'RESOLVED' ? "border-neon-green/30 text-neon-green/80" : 
          item.status === 'ACKNOWLEDGED' ? "border-neon-blue/30 text-neon-blue/80" : "border-white/10 text-white/30"
        )}>
          {item.status}
        </span>
      ) 
    },
    { header: 'Assigned Faculty', accessor: 'faculty' as const }
  ];

  const handleExport = () => {
    const headers = columns.map(c => c.header).join(',');
    const rows = alerts.map(a => `${a.id},${a.type},${a.severity},${a.device?.name},${a.createdAt},${a.status}`).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `smart-eye-alerts-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Alert <span className="text-neon-red">Archive</span></h2>
          <p className="text-[11px] text-white/20 uppercase tracking-[0.2em] font-bold">Historical Forensic Data & Resolution Analysis</p>
        </div>
        <div className="flex gap-4">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-neon-red transition-colors" />
              <input 
                type="text" 
                placeholder="Search Incident ID or Type..." 
                className="bg-bg-card border border-white/10 text-white/80 text-[11px] uppercase tracking-widest pl-10 pr-4 py-2 font-bold outline-none focus:border-neon-red/50"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <button 
             onClick={handleExport}
             className="px-4 py-2 bg-white/5 border border-white/10 text-white/80 text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-white/10 transition-all hover:text-neon-red"
           >
             <Download className="w-4 h-4" />
             Tactical CSV Export
           </button>
        </div>
      </div>

      <GlowCard glowColor="red" title="Incidence Logs // Forensic Historical Data">
         {isLoading ? (
           <div className="h-64 flex items-center justify-center text-white/20 animate-pulse font-bold tracking-widest">
              GATHERING FORENSIC DATA...
           </div>
         ) : (
           <TacticalTable 
            data={alerts} 
            columns={columns} 
            onRowClick={(a) => console.log('Drill down alert:', a.id)}
          />
         )}
       </GlowCard>

      {/* Forensic Meta */}
      <div className="flex items-center justify-between text-[10px] text-white/20 font-mono italic">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <Calendar className="w-3 h-3 text-neon-red" />
               Archive View: 30-Day Forensic Window
            </div>
            <span>Records Processed: 12,482</span>
         </div>
         <div className="flex items-center gap-2 animate-pulse">
            <Zap className="w-3 h-3 text-neon-red" />
            LIVE-SYNC: ACTIVE
         </div>
      </div>
    </div>
  );
};
