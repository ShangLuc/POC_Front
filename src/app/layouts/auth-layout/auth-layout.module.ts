import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthLayoutComponent } from './auth-layout.component';
import { FooterModule } from '../../shared/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FooterModule
  ],
  declarations: [AuthLayoutComponent],
  exports: [AuthLayoutComponent]
})
export class AuthLayoutModule {}
