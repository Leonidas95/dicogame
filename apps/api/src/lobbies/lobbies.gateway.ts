import { Injectable, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { CreateLobbyDto } from './dto/create-lobby.dto';
import { JoinLobbyDto } from './dto/join-lobby.dto';
import { RequestDto } from './dto/request.dto';
import { UpdateLobbyDto } from './dto/update-lobby.dto';
import { LobbiesService } from './lobbies.service';

@Injectable()
@WebSocketGateway({ namespace: 'lobbies', cors: { origin: '*', methods: ['GET', 'POST'] } })
export class LobbiesGateway implements OnGatewayConnection {
  private readonly logger: Logger;
  @WebSocketServer() private readonly wss: Server;

  constructor(private readonly lobbiesService: LobbiesService) {
    this.logger = new Logger(this.constructor.name);
  }

  handleConnection(socket: Socket): void {
    this.logger.debug(`New connection [socketId:${socket.id}]`);

    // setup disconnecting event when socket connects
    socket.on('disconnecting', () => {
      this.close(socket);
    });
  }

  @SubscribeMessage('request')
  onRequest(@ConnectedSocket() socket: Socket, @MessageBody() request: RequestDto) {
    const { method, data } = request;
    this.logger.debug(`New request [${method}]`);

    switch (method) {
      case 'createLobby':
        return this.lobbiesService.createLobby(new CreateLobbyDto(data), socket);
      case 'updateLobby':
        return this.lobbiesService.updateLobby(new UpdateLobbyDto(data), socket);
      case 'joinLobby':
        return this.lobbiesService.joinLobby(new JoinLobbyDto(data), socket);
      case 'startGame':
        return this.lobbiesService.startGame(socket);
    }
  }

  private close(socket: Socket): void {
    this.logger.debug(`Socket is disconnecting [socketId:${socket.id}]`);
    const { lobby, player } = this.lobbiesService.getLobbyAndPlayerFromSocket(socket);

    if (lobby?.closed) return;

    if (lobby && player) {
      socket
        .to(lobby.id)
        .emit('notification', { event: 'playerLeft', data: { id: player.id, playerName: player.name } });

      lobby.deletePlayer(socket.id);

      if (lobby.players.length === 0) {
        this.logger.debug(`Last socket in the lobby left, closing lobby [${lobby.id}]`);
        lobby.close();
      }

      socket.leave(lobby.id);
    }
  }
}
