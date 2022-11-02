import { EventEmitter } from 'events';

import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

import { Player } from './players/player.class';
import { Round } from './rounds/round.class';

export class Lobby extends EventEmitter {
  private readonly logger: Logger;
  readonly id: string;
  private _closed: boolean;
  private _name: string;
  private _maxPlayers: number;
  private _isPrivate: boolean;
  private _numberOfRounds: number;
  private _rounds: Round[];
  private _players: Player[];

  constructor(name: string, maxPlayers: number, isPrivate: boolean, numberOfRounds: number) {
    super();
    this.logger = new Logger(this.constructor.name);
    this.setMaxListeners(Infinity);
    this.id = Math.random().toString(36).substring(2, 7).toLowerCase();
    this._closed = false;
    this._name = name;
    this._maxPlayers = maxPlayers;
    this._isPrivate = isPrivate;
    this._numberOfRounds = numberOfRounds;
    this._rounds = [];
    this._players = [];
    this.logger.debug(`New Lobby [${this.id}]`);
  }

  public get closed(): boolean {
    return this._closed;
  }

  public set closed(value: boolean) {
    this._closed = value;
  }

  public get name(): string {
    return this._name;
  }

  public set name(value: string) {
    this._name = value;
  }

  public get maxPlayers(): number {
    return this._maxPlayers;
  }

  public set maxPlayers(value: number) {
    this._maxPlayers = value;
  }

  public get isPrivate(): boolean {
    return this._isPrivate;
  }

  public set isPrivate(value: boolean) {
    this._isPrivate = value;
  }

  public get numberOfRounds(): number {
    return this._numberOfRounds;
  }

  public set numberOfRounds(value: number) {
    if (value < 2) {
      this._numberOfRounds = 2;
    } else if (value > 10) {
      this._numberOfRounds = 10;
    } else {
      this._numberOfRounds = value;
    }
  }

  public get rounds(): Round[] {
    return this._rounds;
  }

  public set rounds(value: Round[]) {
    this._rounds = value;
  }

  public get players(): Player[] {
    return this._players;
  }

  public set players(value: Player[]) {
    this._players = value;
  }

  close() {
    this.logger.debug(`Lobby [${this.id}] closed`);
    this._closed = true;
    this.emit('closed');
  }

  addPlayer(socket: Socket, name: string) {
    this.logger.debug(`New player [${socket.id}] in lobby [${this.id}]`);
    socket.join(this.id);

    this._players.push(new Player(socket, name));
  }

  deletePlayer(playerId: string) {
    this.logger.debug(`Player [${playerId}] in lobby [${this.id}] left`);
    const index = this._players.findIndex(({ id }) => playerId === id);

    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }

  /**
   * Checks if the player is the author of the lobby based on the `createdAt` property
   *
   * @param player
   * @returns true if the player is the oldest in the lobby
   */
  isPlayerAuthor(player: Player): boolean {
    const players = [...this.players].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return players[0].id === player.id;
  }
}
