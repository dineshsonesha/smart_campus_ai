import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../lib/api';
import { toast } from 'sonner';

export const DeviceStatus = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  OFF: 'OFF',
} as const;

export type DeviceStatus = typeof DeviceStatus[keyof typeof DeviceStatus];

export interface Device {
  id: string;
  name: string;
  category: string;
  status: DeviceStatus;
  streamUrl?: string;
  ipAddress?: string;
  classroomId: string;
  locationDesc?: string;
  classroom?: {
    id: string;
    name: string;
    type: string;
  };
  createdAt: string;
}

export const useDevices = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['devices'],
    queryFn: () => api.get<Device[]>('/devices'),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Device>) => api.post<Device>('/devices', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Node authorized successfully');
    },
    onError: (error: any) => {
      toast.error(`Authorization failed: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Device> }) => 
      api.put<Device>(`/devices/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Node configuration updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/devices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Node decommissioned');
    },
  });

  return {
    ...query,
    createDevice: createMutation.mutateAsync,
    updateDevice: updateMutation.mutateAsync,
    deleteDevice: deleteMutation.mutateAsync,
  };
};
