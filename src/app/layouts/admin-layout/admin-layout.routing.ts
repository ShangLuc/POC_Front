import { Routes } from '@angular/router';

import { AccueilComponent } from '../../pages/accueil/accueil.component';
import { FormComponent } from '../../pages/form/form.component';
import { UserComponent } from '../../pages/user/user.component';
import { ActivityComponent } from 'app/pages/activity/activity.component';
import { StudentListComponent } from 'app/pages/studentList/studentList.component';
import { DashboardComponent } from 'app/pages/dashboard/dashboard.component';
import { AdminGuard } from '../../guards/admin.guard';
import { AdminOrViewerGuard } from '../../guards/admin-or-viewer.guard';
import { AdminOrEleveGuard } from '../../guards/admin-or-eleve.guard';

export const AdminLayoutRoutes: Routes = [
    // Profile - accessible à tous les utilisateurs authentifiés (admin, élève, viewer)
    { path: 'user', component: UserComponent },

    // Accueil et Form - accessibles aux élèves ET admins uniquement
    { path: 'accueil', component: AccueilComponent, canActivate: [AdminOrEleveGuard] },
    { path: 'form', component: FormComponent, canActivate: [AdminOrEleveGuard] },

    // Dashboard - accessible aux admins ET viewers uniquement
    { path: 'dashboard', component: DashboardComponent, canActivate: [AdminOrViewerGuard] },
    { path: 'studentList', component: StudentListComponent, canActivate: [AdminOrViewerGuard] },

    // Admin-only screens (liste des élèves, liste des activités)
    { path: 'activity', component: ActivityComponent, canActivate: [AdminGuard] },
];
