import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  try {
    if (await auth.ensureSession()) return true;
  } catch { /* Login displays the reason a session could not be restored. */ }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
