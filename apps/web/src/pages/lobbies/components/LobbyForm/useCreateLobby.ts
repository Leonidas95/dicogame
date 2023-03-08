import { useCallback, useContext } from 'react';

import { SocketContext } from '../../../../contexts/SocketContext';
import { CreateLobbyInput } from '../../../../interfaces/lobby';

export const useCreateLobby = () => {
  const { makeRequest } = useContext(SocketContext);

  const createLobby = useCallback(
    (data: CreateLobbyInput, callback: (res: any) => void) => {
      makeRequest?.({ method: 'createLobby', data, callback });
    },
    [makeRequest],
  );

  return { createLobby };
};
