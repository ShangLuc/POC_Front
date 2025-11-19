import { Routes } from '@angular/router';

import { AcceuilComponent } from '../../pages/acceuil/acceuil.component';
import { UserComponent } from '../../pages/user/user.component';
import { TableComponent } from '../../pages/table/table.component';
import { TypographyComponent } from '../../pages/typography/typography.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { SectionComponent } from '../../pages/section/section.component';
import { ActivityComponent } from 'app/pages/activity/activity.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'acceuil',        component: AcceuilComponent },
    {path: 'activity',      component: ActivityComponent },
    { path: 'user',           component: UserComponent },
    { path: 'section',        component: ActivityComponent },
    { path: 'table',          component: TableComponent },
    { path: 'typography',     component: TypographyComponent },
    { path: 'icons',          component: IconsComponent },
    { path: 'section',        component: SectionComponent }
];
