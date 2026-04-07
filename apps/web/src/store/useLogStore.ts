import { create } from 'zustand';

export type LogLevel = 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'SYSTEM';

export interface TerminalLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source?: string;
}

interface LogState {
  logs: TerminalLog[];
  addLog: (log: Omit<TerminalLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  addLog: (log) =>
    set((state) => ({
      logs: [
        {
          ...log,
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
        },
        ...state.logs,
      ].slice(0, 100),
    })),
  clearLogs: () => set({ logs: [] }),
}));
