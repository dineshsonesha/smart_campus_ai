import React, { useState, useMemo, useEffect } from 'react';
import { GlowCard } from './GlowCard';
import { TacticalTable } from './TacticalTable';
import { Plus, Camera, User, Trash2, MapPin, Radio, Activity, ShieldAlert, MonitorPlay, Power, Eye, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDevices, DeviceStatus } from '../hooks/useDevices';
import { useClassrooms, RoomType } from '../hooks/useClassrooms';
import { useUsers, UserRole } from '../hooks/useUsers';
import { toast } from 'sonner';

export const DeviceManagement: React.FC = () => {
  const { data: devices, isLoading, createDevice, updateDevice, deleteDevice } = useDevices();
  const { data: classrooms } = useClassrooms();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'CAMERA',
    streamType: 'RTSP' as 'RTSP' | 'HTTP',
    streamUrl: '',
    ipAddress: '',
    classroomId: '',
    assignedUserId: '',
    locationDesc: ''
  });

  // Dynamic Sector Label Logic
  const sectorLabel = useMemo(() => {
    if (!formData.classroomId || !classrooms) return "Sector Designation";
    const selected = classrooms.find(c => c.id === formData.classroomId);
    if (!selected) return "Sector Designation";

    switch (selected.type) {
      case RoomType.CLASSROOM: return "Classroom Number (e.g., P-11)";
      case RoomType.PARKING: return "Parking Zone Label";
      case RoomType.LAB: return "Laboratory Identifier";
      case RoomType.ENTRANCE: return "Entrance/Gate Designation";
      default: return "Sector Designation";
    }
  }, [formData.classroomId, classrooms]);

  // Auto-generate stream URL
  useEffect(() => {
    if (!formData.ipAddress) {
      setFormData(prev => ({ ...prev, streamUrl: '' }));
      return;
    }
    const protocol = formData.streamType === 'RTSP' ? 'rtsp://admin:admin@' : 'http://';
    const suffix = formData.streamType === 'RTSP' ? ':554/live' : '/video';
    setFormData(prev => ({
      ...prev,
      streamUrl: `${protocol}${formData.ipAddress}${suffix}`
    }));
  }, [formData.ipAddress, formData.streamType]);

  const toggleStatus = async (device: any) => {
    const nextStatus = device.status === 'OFF' ? 'ONLINE' : 'OFF';
    try {
      await updateDevice({ id: device.id, data: { status: nextStatus } });
      toast.success(`Node ${device.name} status: ${nextStatus}`);
    } catch (err) { }
  };

  const columns = [
    {
      header: 'Node Identifier',
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full border flex items-center justify-center p-1 transition-colors",
            item.status === 'OFF' ? "bg-white/5 border-white/10 text-white/20" : "bg-neon-blue/10 border-neon-blue/30 text-neon-blue"
          )}>
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <div className={cn("font-bold", item.status === 'OFF' ? "text-white/40" : "text-white")}>{item.name}</div>
            <div className="text-[9px] text-white/20 uppercase tracking-widest">{item.locationDesc || 'NO DESC'}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Tactical Class',
      accessor: (item: any) => (
        <span className="text-[11px] font-bold text-white/60 uppercase">
          {item.category}
        </span>
      )
    },
    {
      header: 'Sector',
      accessor: (item: any) => (
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-white/60 uppercase">{item.classroom?.name}</span>
          <span className="text-[8px] text-white/20 uppercase tracking-tighter">{item.classroom?.type}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (item: any) => (
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full animate-pulse",
            item.status === 'ONLINE' ? "bg-neon-green" : item.status === 'OFF' ? "bg-white/10" : "bg-neon-red"
          )} />
          <span className={cn(
            "text-[9px] font-black uppercase",
            item.status === 'ONLINE' ? "text-neon-green" : "text-white/20"
          )}>
            {item.status}
          </span>
        </div>
      )
    },
    {
      header: 'Tactical Controls',
      accessor: (item: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleStatus(item)}
            className={cn(
              "p-1.5 border transition-all",
              item.status === 'OFF' ? "bg-neon-green/20 border-neon-green/40 text-neon-green" : "bg-white/5 border-white/10 text-white/40 hover:bg-neon-red/20 hover:border-neon-red/40 hover:text-neon-red"
            )}
            title={item.status === 'OFF' ? "Activate Node" : "Deactivate Node"}
          >
            <Power className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => deleteDevice(item.id)} className="p-1.5 bg-white/5 border border-white/10 text-white/40 hover:text-neon-red hover:border-neon-red/40 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.classroomId) return toast.error('Sector Authorization Required');
    try {
      await createDevice(formData);
      setShowModal(false);
      setFormData({ name: '', category: 'CAMERA', streamType: 'RTSP', streamUrl: '', ipAddress: '', classroomId: '', assignedUserId: '', locationDesc: '' });
      toast.success('Tactical Node Deployed Successfully');
    } catch (err) { }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Network Node <span className="text-neon-blue">Registry</span></h2>
          <p className="text-[11px] text-white/20 uppercase tracking-[0.2em] font-bold">Surveillance Asset Authorization & Sector Mapping</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-neon-blue text-black text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-neon-blue/80 transition-all shadow-[0_0_15px_rgba(0,243,255,0.3)]">
          <Plus className="w-4 h-4" />
          Initiate Node Deployment
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 text-left">
          <div className="w-full max-w-2xl bg-black border border-white/10 relative overflow-hidden">
            {/* Tactical Header */}
            <div className="bg-white/5 p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-neon-blue animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">surv_node-deploy-0x</h3>
              </div>
              <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Protocol: Active_Sync</div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="flex items-start gap-4 p-3 bg-neon-blue/5 border border-neon-blue/20">
                <ShieldAlert className="w-5 h-5 text-neon-blue shrink-0 mt-1" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-neon-blue uppercase tracking-widest leading-none">Security Protocol: Initialized</p>
                  <p className="text-[9px] font-bold text-white/40 uppercase leading-tight italic">Sector intelligence fields auto-sync based on local identifiers. Verify all IP mappings before final deployment.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Node Designation */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black text-white/40 tracking-widest flex items-center gap-2">
                    <Radio className="w-3 h-3" /> Node Designation
                  </label>
                  <input required placeholder="e.g., GATE-01" className="w-full bg-white/5 border border-white/10 p-3 text-white text-xs outline-none focus:border-neon-blue transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })} />
                </div>

                {/* Tactical Class */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black text-white/40 tracking-widest flex items-center gap-2">
                    <Eye className="w-3 h-3" /> Tactical Class
                  </label>
                  <select className="w-full bg-white/5 border border-white/10 p-3 text-white text-xs outline-none focus:border-neon-blue uppercase" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    <option value="CAMERA">CAMERA (RGB)</option>
                    <option value="THERMAL">THERMAL (IR)</option>
                    <option value="LIDAR">LIDAR (SPATIAL)</option>
                    <option value="ACOUSTIC">ACOUSTIC (SONAR)</option>
                  </select>
                </div>

                {/* IP Address */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black text-white/40 tracking-widest flex items-center gap-2">
                    <Info className="w-3 h-3" /> Local Intel (IP Address)
                  </label>
                  <input required placeholder="192.168.1.XX" className="w-full bg-white/5 border border-white/10 p-3 text-white text-xs outline-none focus:border-neon-blue font-mono" value={formData.ipAddress} onChange={e => setFormData({ ...formData, ipAddress: e.target.value })} />
                </div>

                {/* Protocol Strategy */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black text-white/40 tracking-widest">Protocol Strategy</label>
                  <div className="flex gap-2">
                    {['RTSP', 'HTTP'].map(p => (
                      <button key={p} type="button" onClick={() => setFormData({ ...formData, streamType: p as any })} className={cn("flex-1 p-2.5 text-[10px] font-black uppercase tracking-widest border transition-all", formData.streamType === p ? "bg-neon-blue text-black border-neon-blue" : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10")}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Description */}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[9px] uppercase font-black text-white/40 tracking-widest flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Physical Placement Context
                  </label>
                  <input placeholder="e.g., 1st Floor near main window / Corridor D" className="w-full bg-white/5 border border-white/10 p-3 text-white text-xs outline-none focus:border-neon-blue italic" value={formData.locationDesc} onChange={e => setFormData({ ...formData, locationDesc: e.target.value })} />
                </div>

                {/* Sector Attribution */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black text-white/40 tracking-widest flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Sector Attribution
                  </label>
                  <select required className="w-full bg-white/5 border border-white/10 p-3 text-white text-xs outline-none focus:border-neon-blue uppercase" value={formData.classroomId} onChange={e => setFormData({ ...formData, classroomId: e.target.value })}>
                    <option value="">SELECT SECTOR</option>
                    {classrooms?.map(c => <option key={c.id} value={c.id}>{c.name} [{c.type}]</option>)}
                  </select>
                </div>

                {/* Automated Dispatch Note */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black text-white/40 tracking-widest flex items-center gap-2">
                    <User className="w-3 h-3" /> Tactical Dispatch
                  </label>
                  <div className="w-full bg-white/5 border border-white/10 p-3 text-neon-blue text-[10px] font-bold uppercase cursor-not-allowed">
                    AUTO-RESOLVE (SHIFT-BASED)
                  </div>
                </div>

                {/* Live Identifier Check */}
                <div className="col-span-2 p-3 bg-black/60 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-[9px] text-white/20 uppercase font-black">
                    <MonitorPlay className="w-3.5 h-3.5" />
                    Dynamic Intel Identifier
                  </div>
                  <div className="text-[10px] font-mono text-neon-blue uppercase">
                    {sectorLabel}: <span className="text-white ml-2">[{classrooms?.find(c => c.id === formData.classroomId)?.name || 'UNRESOLVED'}]</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-white/10 text-white/40 text-[10px] font-black uppercase hover:bg-white/5 transition-all">Abord</button>
                <button type="submit" className="flex-1 py-3 bg-neon-blue text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(0,243,255,0.3)] hover:brightness-110 active:scale-95 transition-all">Deploy Node</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <GlowCard glowColor="blue" title="surv_infrastructure_matrix // live_registries">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center"><Activity className="w-6 h-6 text-neon-blue animate-spin" /></div>
        ) : (
          <TacticalTable data={devices || []} columns={columns} />
        )}
      </GlowCard>
    </div>
  );
};
