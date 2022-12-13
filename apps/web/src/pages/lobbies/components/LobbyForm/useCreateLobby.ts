import { useCallback, useContext } from 'react';

import { SocketContext } from '../../../../contexts/SocketContext';

interface CreateLobby {
  name: string;
  playerName: string;
  maxPlayers: number;
  rounds: number;
  isPrivate: boolean;
}

export const useCreateLobby = () => {
  const { makeRequest } = useContext(SocketContext);

  const createLobby = useCallback(
    (data: CreateLobby, callback: (res: any) => void) => {
      makeRequest?.({ method: 'createLobby', data, callback });
    },
    [makeRequest],
  );

  return { createLobby };
};
