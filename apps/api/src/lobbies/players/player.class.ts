import { Socket } from 'socket.io';

export class Player {
  readonly id: string;
  readonly socket: Socket;
  readonly name: string;
  private _score: number;
  readonly createdAt: Date;

  constructor(socket: Socket, name: string) {
    this.id = socket.id;
    this.socket = socket;
    this.name = name;
    this._score = 0;
    this.createdAt = new Date();
  }

  public get score(): number {
    return this._score;
  }

  public set score(value: number) {
    if (value < 0) {
      this._score = 0;
    } else {
      this._score = value;
    }
  }
}
