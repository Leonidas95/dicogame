type MethodType = 'createLobby' | 'joinLobby';

export class RequestDto {
  method: MethodType;
  data;
}
