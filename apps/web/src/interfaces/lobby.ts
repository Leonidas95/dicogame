import { Player } from './player';

export interface Lobby {
  id: string;
  name: string;
  maxPlayers: number;
  isPrivate: boolean;
  numberOfRounds: number;
  players: Player[];
}

export interface CreateLobbyInput {
  name: string;
  playerName: string;
  maxPlayers: number;
  rounds: number;
  isPrivate: boolean;
}
