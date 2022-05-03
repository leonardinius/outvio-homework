import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

interface AuthConfig {
  token: string;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const validToken = this.configService.get<AuthConfig>('auth').token;

    if (req.header('Authentication') != validToken) {
      // res.status(HttpStatus.UNAUTHORIZED).send('Unauthorized.');
      // return;
      throw new UnauthorizedException();
    }
    next();
  }
}
