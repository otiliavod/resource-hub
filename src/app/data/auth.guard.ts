import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (!auth.getAccessToken()) {
    return router.createUrlTree(['/auth']);
  }

  return auth.hydrateCurrentUser().pipe(
    map((user) => {
      return user ? true : router.createUrlTree(['/auth']);
    }),
    catchError(() => of(router.createUrlTree(['/auth']))),
  );
};
