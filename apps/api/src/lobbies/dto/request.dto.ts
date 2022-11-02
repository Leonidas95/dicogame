type MethodType = 'createLobby' | 'updateLobby' | 'joinLobby' | 'startGame';

export class RequestDto {
  method: MethodType;
  data;
}
