import React, { useState } from 'react';
import { GlowCard } from './GlowCard';
import { Plus, User, Trash2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClassrooms, RoomType } from '../hooks/useClassrooms';
import { useSchedules } from '../hooks/useSchedules';
import { useUsers, UserRole } from '../hooks/useUsers';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const SLOTS = [
  { id: 1, start: '07:30', end: '08:30' },
  { id: 2, start: '08:30', end: '09:30' },
  { id: 3, start: '09:30', end: '10:30' },
  { id: 4, start: '10:30', end: '11:30' },
  { id: 5, start: '11:30', end: '12:30' },
  { id: 6, start: '12:30', end: '13:30' },
  { id: 7, start: '13:30', end: '14:30' },
  { id: 8, start: '14:30', end: '15:30' },
  { id: 9, start: '15:30', end: '16:30' },
];

export const TimetableManagement: React.FC = () => {
  const { data: allClassrooms } = useClassrooms();
  
  // Requirement: Timetable is only for teachers to send alerts for classrooms
  const classrooms = React.useMemo(() => 
    allClassrooms?.filter(c => c.type === RoomType.CLASSROOM) || [], 
    [allClassrooms]
  );

  const { data: teachers } = useUsers(UserRole.TEACHER);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const { data: schedules, isLoading, createSchedule, deleteSchedule } = useSchedules(selectedClassroomId || undefined);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    teacherId: '',
    dayOfWeek: 'MONDAY',
    startTime: '07:30',
    endTime: '08:30'
  });

  // Set default classroom once loaded
  React.useEffect(() => {
    if (classrooms?.length && !selectedClassroomId) {
      setSelectedClassroomId(classrooms[0].id);
    }
  }, [classrooms, selectedClassroomId]);

  const getScheduleForCell = (day: string, startTime: string) => {
    return schedules?.find(s => s.dayOfWeek === day && s.startTime === startTime);
  };

  const handleCellClick = (day: string, slot: any) => {
    const existing = getScheduleForCell(day, slot.start);
    if (existing) {
       if (window.confirm(`Clear teacher ${existing.teacher?.name} from this slot?`)) {
          deleteSchedule(existing.id);
       }
    } else {
       setFormData({ ...formData, dayOfWeek: day, startTime: slot.start, endTime: slot.end });
       setShowAddModal(true);
    }
  };

  const selectedClassroom = classrooms?.find(c => c.id === selectedClassroomId);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Tactical <span className="text-neon-amber">Timetable</span></h2>
          <p className="text-[11px] text-white/20 uppercase tracking-[0.2em] font-bold">Synchronize Surveillance with Academic Operations</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-3 bg-bg-card border border-white/10 px-4 py-2">
              <span className="text-[10px] font-bold text-white/40 uppercase">Sector:</span>
              <select 
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
                className="bg-transparent text-white/80 text-[11px] uppercase tracking-widest font-bold outline-none cursor-pointer"
              >
                {classrooms?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
           </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-left">
          <GlowCard glowColor="amber" title="Operational Mission Assignment" className="w-full max-w-sm">
            <form onSubmit={async (e) => {
              e.preventDefault();
              await createSchedule({ ...formData, classroomId: selectedClassroomId });
              setShowAddModal(false);
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-white/40">Responsible Teacher</label>
                <select 
                  required
                  className="w-full bg-black/40 border border-white/10 p-2 text-white text-xs outline-none focus:border-neon-amber"
                  value={formData.teacherId}
                  onChange={e => setFormData({...formData, teacherId: e.target.value})}
                >
                  <option value="">Select Teacher...</option>
                  {teachers?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                 <div className="p-2 border border-white/10 bg-black/20 text-center">
                    <div className="text-[8px] text-white/20 uppercase font-bold">Day</div>
                    <div className="text-[10px] text-neon-amber font-black">{formData.dayOfWeek}</div>
                 </div>
                 <div className="p-2 border border-white/10 bg-black/20 text-center">
                    <div className="text-[8px] text-white/20 uppercase font-bold">Start</div>
                    <div className="text-[10px] text-white font-black">{formData.startTime}</div>
                 </div>
                 <div className="p-2 border border-white/10 bg-black/20 text-center">
                    <div className="text-[8px] text-white/20 uppercase font-bold">End</div>
                    <div className="text-[10px] text-white font-black">{formData.endTime}</div>
                 </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-white/10 text-white/60 text-[10px] font-bold uppercase hover:bg-white/5"
                >
                  Abord
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-neon-amber text-black text-[10px] font-bold uppercase hover:bg-neon-amber/80"
                >
                  Confirm Mission
                </button>
              </div>
            </form>
          </GlowCard>
        </div>
      )}

      {/* Weekly Grid */}
      <GlowCard glowColor="amber" title={`Weekly Operational Matrix // ${selectedClassroom?.name || 'SYNCING...'}`}>
        <div className="grid grid-cols-[100px_repeat(5,1fr)] bg-white/5 gap-px border-b border-white/5 overflow-hidden rounded-sm shadow-2xl">
          {/* Header Row */}
          <div className="h-10 bg-black/40 flex items-center justify-center">
             <Calendar className="w-3 h-3 text-white/20" />
          </div>
          {DAYS.map(day => (
            <div key={day} className="h-10 flex items-center justify-center text-[10px] font-black tracking-widest text-white/40 uppercase bg-black/40 border-l border-white/5">
              {day}
            </div>
          ))}

          {/* Time Slots */}
          {isLoading ? (
            <div className="col-span-6 h-64 flex items-center justify-center text-white/20 animate-pulse font-bold tracking-widest bg-black/20 font-mono">
               SYNCHRONIZING OPERATIONAL GRID...
            </div>
          ) : (
            SLOTS.map((slot) => (
              <React.Fragment key={slot.id}>
                {/* Time Label */}
                <div className="h-20 flex flex-col items-center justify-center bg-black/20 border-t border-white/5 select-none">
                   <span className="text-[10px] font-black text-white/60">{slot.start}</span>
                   <span className="text-[10px] text-white/10 font-bold">→ {slot.end}</span>
                </div>
                
                {/* Day Cells */}
                {DAYS.map(day => {
                  const schedule = getScheduleForCell(day, slot.start);
                  return (
                    <div 
                      key={`${day}-${slot.id}`} 
                      className={cn(
                        "h-20 bg-bg-primary/40 border-l border-t border-white/5 group relative transition-all duration-300",
                        schedule ? "bg-neon-amber/5 hover:bg-neon-amber/10 cursor-pointer" : "hover:bg-white/[0.03] cursor-crosshair"
                      )}
                      onClick={() => handleCellClick(day, slot)}
                    >
                      {schedule ? (
                        <div className="absolute inset-0.5 border border-neon-amber/20 bg-black/20 p-2 flex flex-col justify-center animate-in fade-in zoom-in-95 duration-500">
                           <div className="flex items-center gap-1.5 text-[9px] font-black text-neon-amber uppercase tracking-tight">
                              <User className="w-2.5 h-2.5" />
                              {schedule.teacher?.name}
                           </div>
                           <div className="text-[8px] text-white/20 mt-1 font-mono uppercase tracking-widest">
                              Assigned Teacher
                           </div>
                           <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-2.5 h-2.5 text-neon-red/40" />
                           </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <Plus className="w-3 h-3 text-white/10" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))
          )}
        </div>
      </GlowCard>

      {/* Tactical Meta */}
      <div className="flex items-center justify-between text-[9px] text-white/10 font-mono italic">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-neon-amber/40 animate-pulse" />
               Active Synchronization Protocol
            </div>
         </div>
         <div className="flex items-center gap-2 uppercase tracking-[0.2em]">
            Sector Classification: ACADEMIC_GRID_REDACTED
         </div>
      </div>
    </div>
  );
};
