// ==========================================================================
// Timeout Interceptor - Limita el tiempo de ejecución de requests
// ==========================================================================

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly defaultTimeout = 30000; // 30 segundos

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Timeout más largo para reportes
    const isReport = request.url?.includes('/reports');
    const timeoutMs = isReport ? 120000 : this.defaultTimeout; // 2 min para reportes

    return next.handle().pipe(
      timeout(timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException(
                'La solicitud tardó demasiado en procesarse. Intente de nuevo.',
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
