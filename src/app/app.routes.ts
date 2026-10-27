import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'users',
        loadComponent: () =>
          import('./features/identity/pages/users-page.component').then((m) => m.UsersPageComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'users' },
    ],
  },
  { path: '**', redirectTo: '' },
];
