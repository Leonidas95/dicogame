import { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { SocketContext } from '../../../contexts/SocketContext';
import { Lobby } from '../../../interfaces/lobby';

type Props = { lobby: Lobby };

export const LobbyItem = ({ lobby }: Props) => {
  const navigate = useNavigate();
  const { makeRequest } = useContext(SocketContext);

  const handleClick = useCallback(() => {
    makeRequest({
      method: 'joinLobby',
      data: { lobbyId: lobby.id, playerName: 'Dude' },
      callback() {
        navigate(lobby.id, { state: lobby });
      },
    });
  }, []);

  return (
    <div
      onClick={handleClick}
      className="flex flex-col space-y-2 bg-green-100 p-4 w-96 h-20 border border-green-200 rounded-lg hover:cursor-pointer"
    >
      <div className="flex justify-between">
        <p className="text-lg">{lobby.name}</p>
        <p className="text-md">{lobby.numberOfRounds} rounds</p>
      </div>
      <p className="text-sm text-gray-500">
        {lobby.players.length} / {lobby.maxPlayers}
      </p>
    </div>
  );
};
