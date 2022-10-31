import { IsBoolean, IsInt, IsString, Length, Max, Min } from 'class-validator';

export class CreateLobbyDto {
  @IsString()
  @Length(1, 40)
  name: string;

  @IsString()
  @Length(1, 30)
  playerName: string;

  @IsInt()
  @Min(2)
  @Max(10)
  maxPlayers: number;

  @IsInt()
  @Min(2)
  @Max(10)
  rounds: number;

  @IsBoolean()
  isPrivate: boolean;

  constructor(data) {
    this.name = data.name;
    this.maxPlayers = data.maxPlayers;
    this.rounds = data.rounds;
    this.isPrivate = data.isPrivate;
    this.playerName = data.playerName;
  }
}
