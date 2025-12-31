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
import { ViewerDashboardComponent } from 'app/pages/viewer-dashboard/viewer-dashboard.component';
import { AdminGuard } from '../../guards/admin.guard';

export const AdminLayoutRoutes: Routes = [
    { path: 'accueil',        component: AccueilComponent },
    { path: 'form',           component: FormComponent },
    { path: 'user',           component: UserComponent },

    // Dashboard viewer (référent) - accessible aux viewers (sans guard admin)
    { path: 'viewer-dashboard', component: ViewerDashboardComponent },

    // Admin-only screens
    { path: 'activity',       component: ActivityComponent, canActivate: [AdminGuard] },
    { path: 'studentList',    component: StudentListComponent, canActivate: [AdminGuard] },
    { path: 'table',          component: TableComponent, canActivate: [AdminGuard] },
    { path: 'typography',     component: TypographyComponent, canActivate: [AdminGuard] },
    { path: 'icons',          component: IconsComponent, canActivate: [AdminGuard] },
    { path: 'section',        component: SectionComponent, canActivate: [AdminGuard] }
];
