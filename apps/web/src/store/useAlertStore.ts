import { create } from 'zustand';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Alert = {
  id: string;
  type: string;
  severity: AlertSeverity;
  title: string;
  description?: string;
  deviceId: string;
  classroomId: string;
  targetUserId?: string;
  classroom?: { name: string };
  device?: { 
    name: string; 
    category: string; 
    assignedUserId?: string;
    assignedUser?: { name: string; role: string };
  };
  createdAt: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED' | 'ACKNOWLEDGED';
};

interface AlertState {
  alerts: Alert[];
  selectedAlertId: string | null;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, data: Partial<Alert>) => void;
  selectAlert: (id: string | null) => void;
  setAlerts: (alerts: Alert[]) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  selectedAlertId: null,
  addAlert: (alert) => 
    set((state) => ({ 
      alerts: [alert, ...state.alerts].slice(0, 50) 
    })),
  updateAlert: (id, data) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, ...data } : a)),
    })),
  selectAlert: (id) => set({ selectedAlertId: id }),
  setAlerts: (alerts) => set({ alerts }),
}));
