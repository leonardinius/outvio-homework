import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

export const AUTH_TOKEN_HEADER_NAME = 'Authentication';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const validToken = this.configService.get<string>('AUTH_TOKEN');

    if (req.header(AUTH_TOKEN_HEADER_NAME) != validToken) {
      // res.status(HttpStatus.UNAUTHORIZED).send('Unauthorized.');
      // return;
      throw new UnauthorizedException();
    }
    next();
  }
}
