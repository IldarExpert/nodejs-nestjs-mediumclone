import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  PipeTransform,
  ValidationError,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

export class BackendValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (metadata.metatype) {
      const object = plainToClass(metadata.metatype, value);
      if (typeof object !== 'object') {
        return value;
      }
      const errors = await validate(object);
      if (errors.length === 0) {
        return value;
      }
      throw new HttpException(
        { errors: this.formatErrors(errors) },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return value;
  }

  formatErrors(errors: ValidationError[]): any {
    return errors.reduce((acc: Record<string, string[]>, error): Record<string, string[]> => {
      if (error.constraints) {
        acc[error.property] = Object.values(error.constraints);
      }
      return acc;
    }, {});
  }
}
