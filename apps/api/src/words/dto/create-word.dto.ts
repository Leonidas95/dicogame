import { IsArray, IsString, IsUUID, Length } from 'class-validator';

export class CreateWordDto {
  @Length(1, 50)
  name: string;

  @IsUUID()
  languageId: string;

  @Length(1, 300, { each: true })
  @IsString({ each: true })
  @IsArray()
  definitions: string[];
}
