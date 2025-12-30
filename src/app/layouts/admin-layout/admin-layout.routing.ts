import { Routes } from '@angular/router';

import { AccueilComponent } from '../../pages/accueil/accueil.component';
import { FormComponent } from '../../pages/form/form.component';
import { UserComponent } from '../../pages/user/user.component';
import { TableComponent } from '../../pages/table/table.component';
import { TypographyComponent } from '../../pages/typography/typography.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { SectionComponent } from '../../pages/section/section.component';
import { ActivityComponent } from 'app/pages/activity/activity.component';
import { StudentListComponent } from 'app/pages/studentList/studentList.component';
import { DashboardComponent } from 'app/pages/dashboard/dashboard.component';
import { AdminGuard } from '../../guards/admin.guard';
import { ViewerDashboardComponent } from 'app/pages/viewer-dashboard/viewer-dashboard.component';

export const AdminLayoutRoutes: Routes = [
    // Accessible to authenticated users (élève or admin)
    { path: 'accueil',        component: AccueilComponent },
    { path: 'form',           component: FormComponent },
    { path: 'user',           component: UserComponent },

    // Dashboard viewer (référent) - accessible aux viewers
    { path: 'viewer-dashboard', component: ViewerDashboardComponent },

    // Admin-only screens
    { path: 'dashboard',      component: DashboardComponent, canActivate: [AdminGuard] },
    { path: 'activity',       component: ActivityComponent, canActivate: [AdminGuard] },
    { path: 'studentList',    component: StudentListComponent, canActivate: [AdminGuard] },
    { path: 'section',        component: ActivityComponent, canActivate: [AdminGuard] },
    { path: 'table',          component: TableComponent, canActivate: [AdminGuard] },
    { path: 'typography',     component: TypographyComponent, canActivate: [AdminGuard] },
    { path: 'icons',          component: IconsComponent, canActivate: [AdminGuard] },
    { path: 'section',        component: SectionComponent, canActivate: [AdminGuard] }
];
