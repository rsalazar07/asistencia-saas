// ==========================================================================
// Transform Interceptor - Estandariza todas las respuestas
// ==========================================================================

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const now = new Date().toISOString();

    return next.handle().pipe(
      map((data) => {
        // Si la respuesta ya tiene el formato estándar, retornarla
        if (data && data.success !== undefined) {
          return data;
        }

        // Si tiene meta (paginación), incluirla
        const response: ApiResponse<T> = {
          success: true,
          data,
          timestamp: now,
        };

        if (data && data.meta) {
          response.meta = data.meta;
          response.data = data.data;
        }

        return response;
      }),
    );
  }
}
