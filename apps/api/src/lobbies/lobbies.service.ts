import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

import { CreateLobbyDto } from './dto/create-lobby.dto';
import { JoinLobbyDto } from './dto/join-lobby.dto';
import { UpdateLobbyDto } from './dto/update-lobby.dto';
import { Lobby } from './lobby.class';
import { Player } from './players/player.class';

@Injectable()
export class LobbiesService {
  private readonly _lobbies: Map<string, Lobby>;

  constructor() {
    this._lobbies = new Map();
  }

  getLobbies(): Lobby[] {
    return Array.from(this._lobbies, ([, lobby]) => lobby);
  }

  getLobby(id: string): Lobby | null {
    if (!this._lobbies.has(id)) {
      return null;
    }

    return this._lobbies.get(id);
  }

  getLobbyAndPlayerFromSocket(socket: Socket): { lobby?: Lobby; player?: Player } {
    const roomId = [...socket.rooms].find((socketRoomId) => socketRoomId !== socket.id);
    const lobby = this.getLobby(roomId);
    const player = lobby?.players.find(({ id }) => id === socket.id);

    return { lobby, player };
  }

  createLobby(data: CreateLobbyDto, socket: Socket) {
    const { name, maxPlayers, isPrivate, playerName, rounds } = data;
    const lobby = new Lobby(name, maxPlayers, isPrivate, rounds);

    lobby.on('close', () => {
      this._lobbies.delete(lobby.id);
    });

    this._lobbies.set(lobby.id, lobby);

    lobby.addPlayer(socket, playerName);

    return lobby;
  }

  updateLobby(dto: UpdateLobbyDto, socket: Socket) {
    const { isPrivate, maxPlayers, name, rounds } = dto;
    const { lobby, player } = this.getLobbyAndPlayerFromSocket(socket);

    if (lobby.isPlayerAuthor(player)) {
      lobby.isPrivate = isPrivate;
      lobby.maxPlayers = maxPlayers;
      lobby.name = name;
      lobby.numberOfRounds = rounds;
    }
  }

  joinLobby(dto: JoinLobbyDto, socket: Socket) {
    const { lobbyId, playerName } = dto;
    const lobby = this.getLobby(lobbyId);

    if (lobby) {
      lobby.addPlayer(socket, playerName);
    }
  }

  // eslint-disable-next-line
  startGame(socket: Socket) {}
}
