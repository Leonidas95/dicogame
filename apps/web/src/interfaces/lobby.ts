import { Player } from './player';

export interface Lobby {
  id: string;
  name: string;
  maxPlayers: number;
  isPrivate: boolean;
  numberOfRounds: number;
  players: Player[];
}
