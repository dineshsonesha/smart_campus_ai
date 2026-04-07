import React, { useEffect } from 'react';
import { CameraGrid } from '@/components/CameraGrid';
import { AlertFeed } from '@/components/AlertFeed';
import { TacticalTerminal } from '@/components/TacticalTerminal'
import { SmartActionPanel } from '@/components/SmartActionPanel';
import { GlowCard } from '@/components/GlowCard';
import { useLogStore } from '@/store/useLogStore';
import { useAlertStore } from '@/store/useAlertStore';
import { useSocket } from '@/hooks/useSocket';
import { useAlerts } from '@/hooks/useAlerts';

export const Dashboard: React.FC = () => {
  const { addLog } = useLogStore();
  const { setAlerts } = useAlertStore();
  const { data: initialAlerts } = useAlerts();
  useSocket(); // Initialize real-time sync

  const hasInitialized = React.useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const timeouts: (ReturnType<typeof setTimeout>)[] = [];

    const sequence = [
      { level: 'SYSTEM' as const, message: 'INITIALIZING SMART-EYE TACTICAL CORE...' },
      { level: 'INFO' as const, message: 'ESTABLISHING SECURE PIPELINE TO SURVEILLANCE NODES...' },
      { level: 'SUCCESS' as const, message: 'CONNECTION ESTABLISHED: 4 NODES ONLINE' },
      { level: 'INFO' as const, message: 'LOADING AI DETECTION MODELS (YOLOV8, MEDIAPIPE)...' },
      { level: 'SUCCESS' as const, message: 'AI INFERENCE ENGINE READY. MONITORING ACTIVE.' },
    ];

    sequence.forEach((log, i) => {
      const t = setTimeout(() => addLog(log), i * 800);
      timeouts.push(t);
    });

    // Seed initial alerts from API if available
    if (initialAlerts) {
      setAlerts(initialAlerts);
    }

    return () => timeouts.forEach(clearTimeout);
  }, [addLog, setAlerts, initialAlerts]);

  return (
    <div className="min-h-screen w-full pt-16 bg-bg-primary relative overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="grid-background" />
      <div className="scanline-overlay" />

      {/* Main Dashboard Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-px bg-white/5 p-4 overflow-hidden h-[calc(100vh-64px)]">
        
        {/* Left Column (8 units) */}
        <div className="lg:col-span-8 flex flex-col gap-px h-full overflow-hidden">
          
          {/* Top-Left: Camera Grid (2/3 Height) */}
          <GlowCard 
            glowColor="blue" 
            title="Surveillance Mainframe // Active Nodes" 
            className="flex-[2] min-h-0"
          >
            <CameraGrid />
          </GlowCard>

          {/* Bottom-Left: Tactical Terminal (1/3 Height) */}
          <GlowCard 
            glowColor="green" 
            title="System Command // Live Telemetry" 
            className="flex-1 min-h-0"
          >
            <TacticalTerminal />
          </GlowCard>
        </div>

        {/* Right Column (4 units) */}
        <div className="lg:col-span-4 flex flex-col gap-px h-full overflow-hidden">
          
          {/* Top-Right: Alert Feed (2/3 Height) */}
          <GlowCard 
            glowColor="red" 
            title="Threat Assessment // Validated Alerts" 
            className="flex-[2] min-h-0"
          >
            <AlertFeed />
          </GlowCard>

          {/* Bottom-Right: Smart Action Center (1/3 Height) */}
          <GlowCard 
            glowColor="amber" 
            title="Strategic Intervention // Decision Matrix" 
            className="flex-1 min-h-0"
          >
            <SmartActionPanel />
          </GlowCard>
        </div>
      </main>

      {/* Audio Element Hidden */}
      <audio id="alert-ping" src="/audio/ping.mp3" preload="auto" />
    </div>
  );
};
