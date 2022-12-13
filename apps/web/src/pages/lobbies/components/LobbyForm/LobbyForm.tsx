import { useCallback } from 'react';
import { Button } from 'ui';

import { Lobby } from '../../../../interfaces/lobby';

import { useCreateLobby } from './useCreateLobby';

export const LobbyForm = () => {
  const { createLobby } = useCreateLobby();

  const createLobbyData = useCallback((lobby: Lobby) => {
    // eslint-disable-next-line no-console
    console.log({ lobby });
  }, []);

  return (
    <form>
      <div className="mb-6">
        <label htmlFor="lobbyName" className="block mb-2 text-sm font-medium text-gray-900">
          Lobby name
        </label>
        <input
          type="text"
          id="lobbyName"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder="Lobby name"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="playername" className="block mb-2 text-sm font-medium text-gray-900">
          Player name
        </label>
        <input
          type="text"
          id="playername"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder="Player name"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="maxPlayers" className="block mb-2 text-sm font-medium text-gray-900">
          Max players
        </label>
        <input
          type="number"
          id="maxPlayers"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder="Max players"
          defaultValue={3}
          min="2"
          max="10"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="rounds" className="block mb-2 text-sm font-medium text-gray-900">
          Rounds
        </label>
        <input
          type="number"
          id="rounds"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder="Rounds"
          defaultValue={4}
          min="2"
          max="10"
          required
        />
      </div>
      <div className="mb-6">
        <label className="inline-flex relative items-center mb-4 cursor-pointer">
          <input type="checkbox" value="" className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-900">Private lobby</span>
        </label>
      </div>
      <Button
        color="green"
        type="submit"
        onClick={(e) => {
          e.preventDefault(), createLobby({}, createLobbyData);
        }}
      >
        Create
      </Button>
    </form>
  );
};
