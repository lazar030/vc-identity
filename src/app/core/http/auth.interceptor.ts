import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../auth/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const token = auth.getToken();

  const authedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authedReq).pipe(
    catchError((error: unknown) => {
      const isLoginCall = req.url.endsWith('/auth/login');
      if (error instanceof HttpErrorResponse && error.status === 401 && !isLoginCall) {
        auth.logout(); // session expired or invalid -> back to login
      }
      return throwError(() => error);
    }),
  );
};
