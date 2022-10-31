import { IsString, Length } from 'class-validator';

export class JoinLobbyDto {
  @IsString()
  @Length(5, 5)
  lobbyId: string;

  @IsString()
  @Length(1, 30)
  playerName: string;

  constructor(data) {
    this.lobbyId = data.lobbyId;
    this.playerName = data.playerName;
  }
}
