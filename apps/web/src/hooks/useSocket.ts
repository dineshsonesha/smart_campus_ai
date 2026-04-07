import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAlertStore } from '../store/useAlertStore';
import { useLogStore } from '../store/useLogStore';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const useSocket = () => {
  const addAlert = useAlertStore((state) => state.addAlert);
  const updateAlert = useAlertStore((state) => state.updateAlert);
  const addLog = useLogStore((state) => state.addLog);

  useEffect(() => {
    if (!socket) {
      socket = io(SOCKET_URL);
    }

    socket.on('connect', () => {
      console.log('📡 Connected to Tactical Hub');
      addLog({ level: 'SUCCESS', message: 'REAL-TIME TACTICAL CONNECTION ESTABLISHED' });
      socket?.emit('subscribe:alerts');
    });

    socket.on('alert:new', (alert: any) => {
      addAlert(alert);
      addLog({ 
        level: 'ERROR', 
        message: `CRITICAL: ${alert.type} detected at Node ${alert.deviceId}` 
      });
      
      // Play alert sound
      const audio = document.getElementById('alert-ping') as HTMLAudioElement;
      if (audio) audio.play().catch(() => {});
    });

    socket.on('alert:updated', (data: { id: string, status: any }) => {
      updateAlert(data.id, { status: data.status });
      addLog({ 
        level: 'INFO', 
        message: `PROTOCOL UPDATE: Alert ${data.id} status changed to ${data.status}` 
      });
    });

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('alert:new');
        socket.off('alert:updated');
      }
    };
  }, [addAlert, updateAlert, addLog]);

  return socket;
};
