import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/**
 * Interceptor para gerenciar estados de loading globalmente
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Apenas para requisições da API
  if (req.url.includes('/api/')) {
    loadingService.setLoading(true);
  }

  return next(req).pipe(
    finalize(() => {
      // Pequeno delay para evitar flicker em requisições muito rápidas
      setTimeout(() => {
        loadingService.setLoading(false);
      }, 100);
    })
  );
};

