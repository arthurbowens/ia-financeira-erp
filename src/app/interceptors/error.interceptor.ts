import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorService } from '../services/error.service';

/**
 * Interceptor global para tratamento de erros HTTP
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Processar erro através do serviço centralizado
      errorService.handleError(error);

      // Retornar erro para que componentes possam tratar se necessário
      return throwError(() => error);
    })
  );
};

