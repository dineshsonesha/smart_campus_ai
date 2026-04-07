import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../lib/api';
import { toast } from 'sonner';

export const useFaculty = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['faculty'],
    queryFn: () => api.get<any[]>('/faculty'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/faculty', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      toast.success('Personnel enlisted successfully');
    },
    onError: (error: any) => {
      toast.error(`Enlistment failed: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/faculty/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      toast.success('Personnel record updated');
    },
    onError: (error: any) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/faculty/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      toast.success('Personnel record purged');
    },
    onError: (error: any) => {
      toast.error(`Purge failed: ${error.message}`);
    },
  });

  return {
    ...query,
    createFaculty: createMutation.mutateAsync,
    updateFaculty: updateMutation.mutateAsync,
    deleteFaculty: deleteMutation.mutateAsync,
  };
};
