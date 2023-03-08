import { useLocation } from 'react-router-dom';

import { Lobby as ILobby } from '../../../interfaces/lobby';

export const Lobby = () => {
  const state = useLocation().state as ILobby;

  return <div>{JSON.stringify(state)}</div>;
};
