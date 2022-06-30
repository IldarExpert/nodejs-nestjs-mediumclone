import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ErrorService } from '../../shared/error.service';
import { ExpressRequestInterface } from '../../types/expressRequest.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly errorService: ErrorService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<ExpressRequestInterface>();
    if (request.user) {
      return true;
    }

    throw new HttpException(
      this.errorService.transformError('authorization', 'Not authorized'),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
