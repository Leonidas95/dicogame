import { useContext, useEffect, useState } from 'react';
// import { useLocation } from 'react-router-dom';
import { Button } from 'ui';

import { SocketContext } from '../../../contexts/SocketContext';
// import { Lobby as ILobby } from '../../../interfaces/lobby';

export const Lobby = () => {
  // const state = useLocation().state as ILobby;
  const { onNotification } = useContext(SocketContext);

  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    onNotification({
      callback(event, data) {
        // console.log({ event, data });
        if (event === 'playerJoined') {
          setPlayers([...players, data]);
        } else if (event === 'playerLeft') {
          setPlayers([players.filter((player) => data.id !== player.id)]);
        }
      },
    });
  }, []);

  return (
    <div>
      <h1>Waiting for other players...</h1>
      {players.map((player) => (
        <p>
          {player.id} - {player.name}
        </p>
      ))}
      <Button color="green">Start the game</Button>
    </div>
  );
};
