// Shared types and constants for Smart-Eye Campus

export const APP_NAME = "Smart-Eye Campus";

export enum DeviceStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  MAINTENANCE = "MAINTENANCE",
  ERROR = "ERROR",
}

export enum AlertSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface User {
  id: string;
  name: string;
  role: string;
}

export interface Device {
  id: string;
  name: string;
  status: DeviceStatus;
  lastActive: string;
}
