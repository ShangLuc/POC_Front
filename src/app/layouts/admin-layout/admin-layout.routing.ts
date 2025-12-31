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

export const AdminLayoutRoutes: Routes = [
    { path: 'accueil',        component: AccueilComponent },
    { path: 'form',           component: FormComponent },
    {path:  'activity',       component: ActivityComponent },
    {path:  'studentList',    component: StudentListComponent },
    { path: 'user',           component: UserComponent },
    { path: 'section',        component: ActivityComponent },
    { path: 'table',          component: TableComponent },
    { path: 'typography',     component: TypographyComponent },
    { path: 'icons',          component: IconsComponent },
    { path: 'section',        component: SectionComponent }
];
