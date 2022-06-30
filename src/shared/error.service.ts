export class ErrorService {
  transformError(title: string, error: string): Record<string, unknown> {
    const errorResponse: { errors: Record<string, unknown> } = {
      errors: {},
    };
    errorResponse.errors[title] = error;
    return errorResponse;
  }
}
