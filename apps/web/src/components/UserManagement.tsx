import React, { useState } from 'react';
import { GlowCard } from './GlowCard';
import { TacticalTable } from './TacticalTable';
import { Plus, User as UserIcon, Mail, Shield, Phone, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUsers, UserRole, type User } from '../hooks/useUsers';
import { toast } from 'sonner';

export const UserManagement: React.FC = () => {
  const { data: users, isLoading, createUser, updateUser, deleteUser } = useUsers();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Helper to format hour (0-23) to "HH:mm"
  const formatHourToTimeStr = (hour: number | string | undefined | null): string => {
    if (hour === undefined || hour === null || hour === '') return '08:00';
    const h = parseInt(hour.toString(), 10);
    return `${h.toString().padStart(2, '0')}:00`;
  };

  // Helper to parse "HH:mm" to hour (0-23)
  const parseTimeStrToHour = (timeStr: string): number => {
    return parseInt(timeStr.split(':')[0], 10) || 0;
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: UserRole.TEACHER as UserRole,
    shiftStart: '08:00',
    shiftEnd: '16:00'
  });

  const columns = [
    { 
      header: 'Identified Personnel', 
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-1 text-neon-green">
             <UserIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white">{item.name}</div>
            <div className="text-[9px] text-white/20 uppercase tracking-widest">{item.id.slice(0, 8)}</div>
          </div>
        </div>
      ) 
    },
    { 
      header: 'Tactical Role', 
      accessor: (item: any) => (
        <div className="flex flex-col">
          <div className={cn(
            "flex items-center gap-2 font-black text-[10px] tracking-tighter",
            item.role === UserRole.ADMIN ? "text-neon-red" : "text-neon-green"
          )}>
            <Shield className="w-3 h-3" />
            {item.role}
          </div>
          {item.shiftStart && (
            <div className="text-[9px] text-white/30 font-mono">
              SHIFT: {item.shiftStart}-{item.shiftEnd}
            </div>
          )}
        </div>
      ) 
    },
    { header: 'Communication Node', accessor: (item: any) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[11px] text-white/60">
            <Mail className="w-3 h-3 text-white/20" />
            {item.email}
          </div>
          {item.phone && (
            <div className="flex items-center gap-2 text-[9px] text-white/20">
              <Phone className="w-3 h-3" />
              {item.phone}
            </div>
          )}
        </div>
    ) },
    { 
      header: 'Tactical Options',
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setEditingUser(item);
              setFormData({ 
                name: item.name, 
                email: item.email, 
                phone: item.phone || '', 
                role: item.role,
                shiftStart: formatHourToTimeStr(item.shiftStart),
                shiftEnd: formatHourToTimeStr(item.shiftEnd)
              });
              setShowModal(true);
            }}
            className="p-1.5 hover:bg-white/5 text-gray-500 hover:text-white transition-all"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Purge personnel record ${item.id}?`)) {
                deleteUser(item.id);
              }
            }}
            className="p-1.5 hover:bg-white/5 text-gray-500 hover:text-neon-red transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<User> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        shiftStart: parseTimeStrToHour(formData.shiftStart),
        shiftEnd: parseTimeStrToHour(formData.shiftEnd)
      };

      if (editingUser) {
        await updateUser({ id: editingUser.id, data: payload });
      } else {
        await createUser(payload);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', phone: '', role: UserRole.TEACHER, shiftStart: '08:00', shiftEnd: '16:00' });
      toast.success('Personnel Data Synchronized');
    } catch (err) {}
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Personnel <span className="text-neon-green">Directory</span></h2>
          <p className="text-[11px] text-white/20 uppercase tracking-[0.2em] font-bold">Authorized Staff & Faculty Access Management</p>
        </div>
        <button 
          onClick={() => {
            setEditingUser(null);
            setFormData({ name: '', email: '', phone: '', role: UserRole.TEACHER, shiftStart: '08:00', shiftEnd: '16:00' });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-neon-green text-black text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-neon-green/80 transition-all shadow-[0_0_15px_rgba(57,255,20,0.3)]"
        >
          <Plus className="w-4 h-4" />
          Enlist New Personnel
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-left">
          <GlowCard glowColor="green" title={editingUser ? "Edit Personnel Profile" : "Personnel Enlistment Protocol"} className="w-full max-w-sm">
            <form onSubmit={handleSubmit} className="p-2 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Full Name</label>
                <input required className="w-full bg-black/40 border border-white/10 p-2.5 text-white text-xs outline-none focus:border-neon-green" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Email Node</label>
                <input required type="email" className="w-full bg-black/40 border border-white/10 p-2.5 text-white text-xs outline-none focus:border-neon-green" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Tactical Role</label>
                  <select className="w-full bg-black/40 border border-white/10 p-2 text-white text-xs outline-none focus:border-neon-green" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                    {Object.values(UserRole).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Phone</label>
                  <input className="w-full bg-black/40 border border-white/10 p-2 text-white text-xs outline-none focus:border-neon-green" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              {formData.role !== UserRole.TEACHER && formData.role !== UserRole.ADMIN && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Shift Start</label>
                    <input type="time" className="w-full bg-black/40 border border-white/10 p-2 text-white text-xs outline-none focus:border-neon-green" value={formData.shiftStart} onChange={e => setFormData({...formData, shiftStart: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Shift End</label>
                    <input type="time" className="w-full bg-black/40 border border-white/10 p-2 text-white text-xs outline-none focus:border-neon-green" value={formData.shiftEnd} onChange={e => setFormData({...formData, shiftEnd: e.target.value})} />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-white/10 text-white/60 text-[10px] font-bold uppercase hover:bg-white/5 transition-colors">Abord</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-neon-green text-black text-[10px] font-black uppercase hover:bg-neon-green/80 transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                  {editingUser ? "Sync Profil" : "Enlist"}
                </button>
              </div>
            </form>
          </GlowCard>
        </div>
      )}

      {/* Main Table */}
      <GlowCard glowColor="green" title="Faculty Database // Permission Grid">
         {isLoading ? (
           <div className="h-64 flex items-center justify-center text-white/20 animate-pulse font-bold tracking-widest">
              SYNCHRONIZING PERSONNEL DATA...
           </div>
         ) : (
           <TacticalTable 
            data={users || []} 
            columns={columns} 
          />
         )}
      </GlowCard>
    </div>
  );
};
