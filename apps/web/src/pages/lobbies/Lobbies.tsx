import { Suspense, useCallback } from 'react';
import { Button } from 'ui';

import { useCreateLobby } from '../../hooks/lobbies/useCreateLobby';
import { Lobby } from '../../interfaces/lobby';

import { LobbiesList } from './components/LobbiesList';

export const Lobbies = () => {
  const { createLobby } = useCreateLobby();

  const createLobbyData = useCallback((lobby: Lobby) => {
    // eslint-disable-next-line no-console
    console.log({ lobby });
  }, []);

  return (
    <div className="flex flex-col flex-1 p-6">
      <Button
        color="green"
        className="m-6"
        onClick={() => {
          createLobby(
            { isPrivate: false, maxPlayers: 6, name: 'coucou', playerName: 'Bob', rounds: 6 },
            createLobbyData,
          );
        }}
      >
        Create Lobby
      </Button>
      <Suspense fallback={<h1>Loading...</h1>}>
        <LobbiesList />
      </Suspense>
    </div>
  );
};
