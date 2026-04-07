import React from 'react';
import { useAlertStore } from '@/store/useAlertStore';
import { cn } from '@/lib/utils';
import { Camera, Radio, Maximize2, ShieldAlert } from 'lucide-react';
import { useDevices } from '../hooks/useDevices';

export const CameraGrid: React.FC = () => {
  const { data: devices } = useDevices();
  const { alerts } = useAlertStore();

  const cams = devices?.filter(d => d.category === 'CAMERA') || [];
  const displayCams = cams.slice(0, 4);

  return (
    <div className="grid grid-cols-2 gap-px bg-white/5 h-full w-full">
      {displayCams.map((cam: any) => {
        const hasAlert = alerts.some((a) => a.deviceId === cam.id && a.status === 'PENDING');
        
        return (
          <div 
            key={cam.id} 
            className={cn(
              'group relative flex flex-col bg-bg-primary overflow-hidden transition-all duration-500',
              hasAlert ? 'ring-1 ring-inset ring-neon-red/50' : 'hover:bg-white/[0.02]'
            )}
          >
            {/* Camera Header Overlay */}
            <div className="absolute top-0 left-0 right-0 p-3 z-10 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  hasAlert ? 'bg-neon-red animate-ping' : 'bg-neon-green shadow-[0_0_8px_rgba(57,255,20,0.8)]'
                )} />
                <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">
                  {cam.id.slice(0, 8)} // {cam.name}
                </span>
              </div>
              <div className="flex gap-2">
                <Radio className="w-3 h-3 text-white/20" />
                <Maximize2 className="w-3 h-3 text-white/20 hover:text-white/80 cursor-pointer pointer-events-auto" />
              </div>
            </div>

            {/* Video Placeholder Content */}
            <div className="flex-1 aspect-video relative flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all">
              {/* Scanline Effect per feed */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                 <div className="h-full w-full bg-[repeating-linear-gradient(transparent_0,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_4px)]" />
              </div>

              {/* AI Detection Overlay Simulation */}
              {hasAlert && (
                <div className="absolute inset-0 border-2 border-neon-red/30 flex items-center justify-center">
                   <div className="absolute top-1/4 left-1/3 w-32 h-48 border border-neon-red shadow-[0_0_10px_rgba(255,0,60,0.5)]">
                      <span className="absolute -top-4 left-0 text-[8px] bg-neon-red text-black font-bold px-1 uppercase">
                        DETECTED // HUMAN
                      </span>
                   </div>
                </div>
              )}

              {/* No Feed Icon */}
              <Camera className={cn(
                "w-12 h-12 transition-all duration-700",
                hasAlert ? "text-neon-red/20 scale-110" : "text-white/5 group-hover:text-white/10"
              )} />
              
              {hasAlert && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-neon-red text-black px-2 py-0.5 text-[10px] font-bold uppercase animate-pulse">
                  <ShieldAlert className="w-3 h-3" />
                  Visual Alert Active
                </div>
              )}
            </div>

            {/* Tactical Metadata Footer */}
            <div className="mt-auto px-4 py-2 border-t border-white/5 bg-black/40 flex items-center justify-between text-[9px] text-white/30 font-mono">
               <div className="flex gap-4">
                  <span>FPS: 30.2</span>
                  <span>SYNC: 99%</span>
               </div>
               <div className="uppercase tracking-widest group-hover:text-neon-green transition-colors">
                  Protocol 0x{cam.id.slice(0, 4).toUpperCase()}
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
