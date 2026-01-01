import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthComponent } from './pages/auth/auth.component';
import { AuthGuard } from './guards/auth.guard';
import { RequireAuthGuard } from './guards/require-auth.guard';

export const AppRoutes: Routes = [
  {
    path: '',
    redirectTo: '/auth',
    pathMatch: 'full',
  }, 
  {
    path: 'auth',
    component: AuthComponent,
    canActivate: [AuthGuard] // Redirige si déjà authentifié
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [RequireAuthGuard], // Toutes les pages nécessitent une authentification
    children: [
        {
      path: '',
      loadChildren: () => import('./layouts/admin-layout/admin-layout.module').then(x => x.AdminLayoutModule)
  }]},
  {
    path: '**',
    redirectTo: 'auth'
  }
]
