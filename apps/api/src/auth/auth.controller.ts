import { Body, Controller, Inject, Logger, LoggerService, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthLogInDto } from './dto/auth-login.dto';

@Controller('auth')
export class AuthController {
  constructor(@Inject(Logger) private readonly logger: LoggerService, private readonly service: AuthService) {
    this.logger = new Logger(this.constructor.name);
  }

  @Post('/login')
  login(@Body() dto: AuthLogInDto): Promise<{ token: string }> {
    this.logger.debug('Login attempt');
    return this.service.login(dto);
  }
}
