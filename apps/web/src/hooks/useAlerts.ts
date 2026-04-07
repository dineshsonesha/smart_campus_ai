import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../lib/api';
import { toast } from 'sonner';

export type Alert = {
  id: string;
  type: string;
  severity: string;
  status: string;
  title: string;
  description?: string;
  imageUrl?: string;
  deviceId: string;
  classroomId: string;
  targetTeacherId?: string;
  classroom?: { name: string };
  device?: { name: string };
  createdAt: string;
};

export const useAlerts = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get<Alert[]>('/alerts'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      api.patch<Alert>(`/alerts/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert status updated');
    },
  });

  return {
    ...query,
    updateStatus: updateStatus.mutateAsync,
  };
};
