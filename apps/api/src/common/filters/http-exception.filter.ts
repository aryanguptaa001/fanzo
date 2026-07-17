import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    const known = exception instanceof HttpException;
    const status = known ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = known ? exception.getResponse() : undefined;
    const message = typeof payload === 'object' && payload && 'message' in payload ? String(payload.message) : known ? String(payload) : 'Internal server error';
    response.status(status).json({ code: known ? `HTTP_${status}` : 'INTERNAL_ERROR', message, requestId: request.headers['x-request-id'] ?? 'unknown' });
  }
}
