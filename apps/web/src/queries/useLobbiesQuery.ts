import { useQuery } from '@tanstack/react-query';

import { Lobby } from '../interfaces/lobby';
import { axiosInstance } from '../utils/axiosInstance';

export const useLobbiesQuery = () => {
  const { data, ...rest } = useQuery({
    queryKey: ['lobbies'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Lobby[]>('lobbies');
      return data;
    },
  });

  return { lobbies: data ?? [], ...rest };
};
