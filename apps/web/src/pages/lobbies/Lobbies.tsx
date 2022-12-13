import { Suspense, useState } from 'react';
import { Button } from 'ui';

import { LobbiesList } from './components/LobbiesList';
import { LobbyForm } from './components/LobbyForm/LobbyForm';

export const Lobbies = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="flex flex-col flex-1 p-6">
      <Button color="green" className="m-6" onClick={() => setShowCreateForm(true)}>
        Create Lobby
      </Button>
      {showCreateForm && <LobbyForm />}
      <Suspense fallback={<h1>Loading...</h1>}>
        <LobbiesList />
      </Suspense>
    </div>
  );
};
