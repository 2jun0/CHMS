import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Error404Component } from './error/error404/error404.component';
import { Error400Component } from './error/error400/error400.component';
import { PrintLayoutComponent } from './print/print-layout/print-layout.component';
import { PrintProjectComponent } from './print/print-project/print-project.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  },
  {
    path: 'error404',
    component: Error404Component
  },
  {
    path: 'error400',
    component: Error400Component
  },
  {
    path: 'print',
    outlet: 'print',
    component: PrintLayoutComponent,
    children: [
      { path: 'project/:id', component: PrintProjectComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
