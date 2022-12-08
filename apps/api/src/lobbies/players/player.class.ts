import { Expose } from 'class-transformer';
import { Socket } from 'socket.io';

export class Player {
  @Expose() readonly id: string;
  readonly socket: Socket;
  @Expose() readonly name: string;
  private _score: number;
  @Expose() readonly createdAt: Date;

  constructor(socket: Socket, name: string) {
    this.id = socket.id;
    this.socket = socket;
    this.name = name;
    this._score = 0;
    this.createdAt = new Date();
  }

  @Expose({ name: 'score' })
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
