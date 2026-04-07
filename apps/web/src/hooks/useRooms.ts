import { useQuery } from '@tanstack/react-query';
import { useApi } from '../lib/api';

export const useRooms = () => {
  const api = useApi();

  return useQuery({
    queryKey: ['rooms'],
    queryFn: () => api.get<any[]>('/rooms'),
  });
};
