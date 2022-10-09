import { MaxLength, IsNotEmpty } from 'class-validator';

export class AuthLogInDto {
  @MaxLength(255)
  email: string;

  @IsNotEmpty()
  password: string;
}
