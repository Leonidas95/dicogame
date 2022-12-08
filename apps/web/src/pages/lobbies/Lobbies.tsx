import { Suspense } from 'react';
import { Button } from 'ui';

import { LobbiesList } from './components/LobbiesList';

export const Lobbies = () => {
  return (
    <div className="flex flex-col flex-1 p-6">
      <Button color="green" className="m-6">
        Create Lobby
      </Button>
      <Suspense fallback={<h1>Loading...</h1>}>
        <LobbiesList />
      </Suspense>
    </div>
  );
};
