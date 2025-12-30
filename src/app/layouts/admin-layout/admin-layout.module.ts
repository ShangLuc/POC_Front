import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminLayoutRoutes } from './admin-layout.routing';

import { AuthComponent }            from 'app/pages/auth/auth.component';
import { AccueilComponent }         from '../../pages/accueil/accueil.component';
import { FormComponent }            from '../../pages/form/form.component';
import { UserComponent }            from '../../pages/user/user.component';
import { TableComponent }           from '../../pages/table/table.component';
import { TypographyComponent }      from '../../pages/typography/typography.component';
import { IconsComponent }           from '../../pages/icons/icons.component';
import { SectionComponent }         from '../../pages/section/section.component';
import { DashboardComponent }       from '../../pages/dashboard/dashboard.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ActivityComponent } from 'app/pages/activity/activity.component';
import { StudentListComponent } from 'app/pages/studentList/studentList.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ViewerDashboardComponent } from 'app/pages/viewer-dashboard/viewer-dashboard.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    NgbModule,
    NgSelectModule
  ],
  declarations: [
    AuthComponent,
    AccueilComponent,
    UserComponent,
    ActivityComponent,
    StudentListComponent,
    TableComponent,
    TypographyComponent,
    IconsComponent,
    SectionComponent,
<<<<<<< HEAD
    DashboardComponent,
=======
    ViewerDashboardComponent,
>>>>>>> 3ea1c488e19b459f24b6f81c064dcf4799d5a4aa
  ]
})

export class AdminLayoutModule {}
