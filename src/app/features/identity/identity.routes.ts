import { Routes } from '@angular/router';

import { IdentityService } from './services/identity.service';

export const IDENTITY_ROUTES: Routes = [
  {
    path: '',
    // Feature-scoped: the store lives as long as the feature is active.
    providers: [IdentityService],
    loadComponent: () =>
      import('./pages/identity-list/identity-list.component').then(
        (m) => m.IdentityListComponent,
      ),
  },
];
