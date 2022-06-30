import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { ConfigsService } from '../../configs/configs.service';
import { ExpressRequestInterface } from '../../types/expressRequest.interface';
import { UserService } from '../user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(ConfigsService) private readonly configService: ConfigsService,
    @Inject(UserService) private readonly userService: UserService,
  ) {}

  async use(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decode = verify(token, this.configService.getConfig('JWT_SECRET'));
      if (typeof decode !== 'string') {
        req.user = await this.userService.findById(decode.id);
      } else {
        req.user = null;
      }
      // next();
    } catch (e) {
      req.user = null;
      // next();
    }
    next();
  }
}
