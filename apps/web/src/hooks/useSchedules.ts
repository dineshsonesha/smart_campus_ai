import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../lib/api';
import { toast } from 'sonner';

export type Schedule = {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  classroomId: string;
  teacherId: string;
  teacher?: {
    id: string;
    name: string;
  };
};

export const useSchedules = (classroomId?: string) => {
  const api = useApi();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['schedules', classroomId],
    queryFn: () => api.get<Schedule[]>(`/schedules?${classroomId ? `classroom_id=${classroomId}` : ''}`),
    enabled: !!classroomId || classroomId === undefined,
  });

  const createSchedule = useMutation({
    mutationFn: (data: Partial<Schedule>) => api.post<Schedule>('/schedules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update schedule: ${error.message}`);
    },
  });

  const deleteSchedule = useMutation({
    mutationFn: (id: string) => api.delete(`/schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Slot cleared');
    },
  });

  const getCurrentTeacher = async (classroomId: string) => {
    return api.get<any>(`/schedules/current-teacher?classroom_id=${classroomId}`);
  };

  return {
    ...query,
    createSchedule: createSchedule.mutateAsync,
    deleteSchedule: deleteSchedule.mutateAsync,
    getCurrentTeacher,
  };
};
