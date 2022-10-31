import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

import { CreateLobbyDto } from './dto/create-lobby.dto';
import { JoinLobbyDto } from './dto/join-lobby.dto';
import { Lobby } from './lobby.class';

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

  createLobby(data: CreateLobbyDto, socket: Socket) {
    const { name, maxPlayers, isPrivate, playerName } = data;
    const lobby = new Lobby(name, maxPlayers, isPrivate);

    lobby.on('close', () => {
      this._lobbies.delete(lobby.id);
    });

    this._lobbies.set(lobby.id, lobby);

    lobby.addPlayer(socket, playerName);

    return lobby;
  }

  joinLobby(dto: JoinLobbyDto, socket: Socket) {
    const { lobbyId, playerName } = dto;
    const lobby = this.getLobby(lobbyId);

    if (lobby) {
      lobby.addPlayer(socket, playerName);
    }
  }
}
