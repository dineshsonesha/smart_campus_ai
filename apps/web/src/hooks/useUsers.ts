import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../lib/api';

export const UserRole = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  WATCHMAN: 'WATCHMAN',
  LAB_ASSISTANT: 'LAB_ASSISTANT',
  GUARD: 'GUARD',
  PEON: 'PEON',
  WORKER: 'WORKER',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  shiftStart?: string;
  shiftEnd?: string;
  createdAt: string;
  updatedAt: string;
};

export const useUsers = (role?: UserRole) => {
  const api = useApi();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['users', role],
    queryFn: () => api.get<User[]>(`/users${role ? `?role=${role}` : ''}`),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<User>) => api.post<User>('/users', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => 
      api.put<User>(`/users/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  return {
    ...query,
    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
  };
};
