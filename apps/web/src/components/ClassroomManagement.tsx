import React, { useState } from 'react';
import { GlowCard } from './GlowCard';
import { TacticalTable } from './TacticalTable';
import { Plus, Layout, Edit, Trash2, Box } from 'lucide-react';
import { useClassrooms } from '../hooks/useClassrooms';
import { toast } from 'sonner';

export const ClassroomManagement: React.FC = () => {
  const { data: classrooms, isLoading, createClassroom, updateClassroom, deleteClassroom } = useClassrooms();
  const [showModal, setShowModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<any>(null);
  const [name, setName] = useState('');

  const columns = [
    { 
      header: 'Sector Registry', 
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-1 text-neon-blue">
             <Layout className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white">{item.name}</div>
            <div className="text-[9px] text-white/20 uppercase tracking-widest">{item.id}</div>
          </div>
        </div>
      ) 
    },
    { 
      header: 'Node Connectivity', 
      accessor: (item: any) => (
        <div className="flex items-center gap-2">
          <Box className="w-3.5 h-3.5 text-white/20" />
          <span className="text-[11px] font-bold text-white/60">
            {item.devices?.length || 0} Surveillance Nodes
          </span>
        </div>
      ) 
    },
    { 
      header: 'Tactical Status',
      accessor: () => (
        <span className="px-2 py-0.5 bg-neon-blue/10 text-neon-blue text-[10px] font-black uppercase rounded-xs border border-neon-blue/20">
          SECURE
        </span>
      )
    },
    { 
      header: 'Actions',
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <button 
             onClick={() => {
               setEditingClassroom(item);
               setName(item.name);
               setShowModal(true);
             }}
             className="p-1.5 hover:bg-white/5 text-gray-500 hover:text-white transition-all"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Decommission sector ${item.name}? This will unbind all associated nodes.`)) {
                deleteClassroom(item.id);
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
      if (editingClassroom) {
        await updateClassroom({ id: editingClassroom.id, data: { name } });
        toast.success(`Sector ${name} reconfigured`);
      } else {
        await createClassroom({ name });
        toast.success(`Sector ${name} initialized`);
      }
      handleCloseModal();
    } catch (err) {}
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClassroom(null);
    setName('');
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Sector <span className="text-neon-blue">Registry</span></h2>
          <p className="text-[11px] text-white/20 uppercase tracking-[0.2em] font-bold">Manage Classroom Sectors & Surveillance Mapping</p>
        </div>
        <button 
          onClick={() => {
            setEditingClassroom(null);
            setName('');
            setShowModal(true);
          }}
          className="px-4 py-2 bg-neon-blue text-black text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-neon-blue/80 transition-all shadow-[0_0_15px_rgba(0,243,255,0.3)]"
        >
          <Plus className="w-4 h-4" />
          Initialize New Sector
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-left">
          <GlowCard glowColor="blue" title={editingClassroom ? "Tactical Sector Reconfiguration" : "Tactical Sector Initialization"} className="w-full max-w-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-white/40">Sector Designation (Name)</label>
                <input 
                  required
                  autoFocus
                  placeholder="e.g., Room 101, Lab A"
                  className="w-full bg-black/40 border border-white/10 p-2 text-white text-xs outline-none focus:border-neon-blue"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-white/10 text-white/60 text-[10px] font-bold uppercase hover:bg-white/5"
                >
                  Abord
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-neon-blue text-black text-[10px] font-bold uppercase hover:bg-neon-blue/80"
                >
                  {editingClassroom ? "Update" : "Initialize"}
                </button>
              </div>
            </form>
          </GlowCard>
        </div>
      )}

      {/* Main Table */}
      <GlowCard glowColor="blue" title="Institutional Sector Map // Infrastructure">
         {isLoading ? (
            <div className="h-64 flex items-center justify-center text-white/20 animate-pulse font-bold tracking-widest">
               SCANNING CAMPUS SECTORS...
            </div>
         ) : (
           <TacticalTable 
            data={classrooms || []} 
            columns={columns} 
          />
         )}
      </GlowCard>
    </div>
  );
};
