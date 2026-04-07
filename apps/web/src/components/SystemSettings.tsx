import React from 'react';
import { GlowCard } from './GlowCard';
import { Save, Cpu, Database, Share2 } from 'lucide-react';

export const SystemSettings: React.FC = () => {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">System <span className="text-gray-500">Configuration</span></h2>
          <p className="text-[11px] text-white/20 uppercase tracking-[0.2em] font-bold">Inference Parameters & Environmental Protocols</p>
        </div>
        <button className="px-6 py-2 bg-white/5 border border-white/10 text-white/80 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 hover:text-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          <Save className="w-4 h-4" />
          Update Parameters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Detection Logic */}
        <GlowCard glowColor="green" title="Inference Core // Threshold Logic">
           <div className="p-6 space-y-4">
              <ConfigItem 
                label="Confidence Threshold" 
                value="0.65" 
                unit="Score"
                description="Minimum confidence score for YOLOv8 object detection."
              />
              <ConfigItem 
                label="Consistency Window" 
                value="6" 
                unit="Frames"
                description="Number of frames a threat must persist before validation."
              />
              <ConfigItem 
                label="Throttling Cooldown" 
                value="300" 
                unit="Seconds"
                description="Time between repeat notifications for the same device/type."
              />
           </div>
        </GlowCard>

        {/* AI Engine Config */}
        <GlowCard glowColor="blue" title="Neural Processor // Model Config">
           <div className="p-6 space-y-4">
              <ConfigItem 
                label="Processing Frame rate" 
                value="3" 
                unit="FPS"
                description="Frequency of frames extracted for AI analysis."
              />
              <ConfigItem 
                label="Inference Resolution" 
                value="640x640" 
                unit="PX"
                description="Internal resolution for neural network processing."
              />
              <ConfigItem 
                label="Gemini Model" 
                value="Gemini-3-Pro" 
                unit="LLM"
                description="Language model used for contextual alert generation."
              />
           </div>
        </GlowCard>
      </div>

      {/* Hardware Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatusBox icon={<Cpu />} label="CPU Usage" value="12.4%" />
         <StatusBox icon={<Database />} label="Redis Cache" value="Active / 4MB" />
         <StatusBox icon={<Share2 />} label="API Latency" value="14ms" />
      </div>
    </div>
  );
};

const ConfigItem = ({ label, value, unit, description }: any) => (
  <div className="group space-y-2 border-b border-white/5 pb-4 last:border-0 hover:border-white/10 transition-colors">
     <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
        <div className="flex items-center gap-2">
           <span className="text-neon-green font-bold text-[14px]">{value}</span>
           <span className="text-[9px] text-white/20 font-bold uppercase">{unit}</span>
        </div>
     </div>
     <p className="text-[9px] text-white/10 font-mono italic">{description}</p>
  </div>
);

const StatusBox = ({ icon, label, value }: any) => (
  <div className="bg-bg-card/20 border border-white/5 p-4 flex items-center gap-4">
     <div className="p-2 bg-white/5 text-white/20">
        {React.cloneElement(icon, { size: 16 })}
     </div>
     <div>
        <div className="text-[9px] font-bold uppercase text-white/20">{label}</div>
        <div className="text-[13px] font-black text-white/80">{value}</div>
     </div>
  </div>
);
