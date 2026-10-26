import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'identities', pathMatch: 'full' },
  {
    path: 'identities',
    loadChildren: () =>
      import('./features/identity/identity.routes').then((m) => m.IDENTITY_ROUTES),
  },
];
