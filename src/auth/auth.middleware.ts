import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

export const AUTH_TOKEN_HEADER_NAME = 'Authentication';

export interface AuthTokens {
  tokens: string[];
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private validTokens: string[];
  constructor(private configService: ConfigService) {
    this.validTokens = this.configService.get<AuthTokens>('auth').tokens;
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (!this.validTokens.includes(req.header(AUTH_TOKEN_HEADER_NAME))) {
      return res.status(HttpStatus.UNAUTHORIZED).send('Unauthorized');
      // throw new UnauthorizedException();
    }
    next();
  }
}
