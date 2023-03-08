import { Suspense, useState } from 'react';
import { Button } from 'ui';

import { LobbiesList } from './components/LobbiesList';
import { LobbyForm } from './components/LobbyForm/LobbyForm';

export const Lobbies = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="flex flex-col flex-1 p-6">
      {showCreateForm ? (
        <LobbyForm />
      ) : (
        <Button color="green" className="m-6" onClick={() => setShowCreateForm(true)}>
          Create Lobby
        </Button>
      )}
      <Suspense fallback={<h1>Loading...</h1>}>
        <LobbiesList />
      </Suspense>
    </div>
  );
};
