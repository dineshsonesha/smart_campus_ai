import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../lib/api';

export const RoomType = {
  CLASSROOM: 'CLASSROOM',
  LAB: 'LAB',
  PARKING: 'PARKING',
  OFFICE: 'OFFICE',
  CANTEEN: 'CANTEEN',
  MAIN_GATE: 'MAIN_GATE',
  ENTRANCE: 'ENTRANCE',
} as const;

export type RoomType = typeof RoomType[keyof typeof RoomType];

export type Classroom = {
  id: string;
  name: string;
  type: RoomType;
  createdAt: string;
  updatedAt: string;
};

export const useClassrooms = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => api.get<Classroom[]>('/classrooms'),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Classroom>) => api.post<Classroom>('/classrooms', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classrooms'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/classrooms/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classrooms'] }),
  });

  return {
    ...query,
    createClassroom: createMutation.mutateAsync,
    deleteClassroom: deleteMutation.mutateAsync,
  };
};
