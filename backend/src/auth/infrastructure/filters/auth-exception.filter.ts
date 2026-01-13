import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let error = 'Internal Server Error';

    // Manejo específico de excepciones de autenticación
    if (exception instanceof UnauthorizedException) {
      status = HttpStatus.UNAUTHORIZED;
      message = 'Credenciales inválidas o token expirado';
      error = 'Unauthorized';
    } else if (exception instanceof ForbiddenException) {
      status = HttpStatus.FORBIDDEN;
      message = 'No tienes permisos para acceder a este recurso';
      error = 'Forbidden';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || error;
      }
    } else if (exception instanceof Error) {
      // Errores específicos de autenticación
      if (exception.message.includes('jwt')) {
        status = HttpStatus.UNAUTHORIZED;
        message = 'Token JWT inválido o expirado';
        error = 'Invalid JWT Token';
      } else if (exception.message.includes('passport')) {
        status = HttpStatus.UNAUTHORIZED;
        message = 'Error en la autenticación con el proveedor externo';
        error = 'Authentication Provider Error';
      } else {
        message = exception.message;
      }
    }

    // Log del error para debugging
    console.error('Auth Exception:', {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      status,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    // Respuesta estructurada
    response.status(status).json({
      success: false,
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}