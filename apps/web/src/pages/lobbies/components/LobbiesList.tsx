import { useLobbiesQuery } from '../../../queries/useLobbiesQuery';

import { LobbyItem } from './LobbyItem';

export const LobbiesList = () => {
  const { lobbies } = useLobbiesQuery();

  return (
    <ul className="flex flex-col items-center justify-center gap-2 ">
      {lobbies.map((lobby) => (
        <li key={lobby.id}>
          <LobbyItem lobby={lobby} />
        </li>
      ))}
    </ul>
  );
};
