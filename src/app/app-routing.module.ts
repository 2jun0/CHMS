import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Error404Component } from './error/error404/error404.component';
import { Error400Component } from './error/error400/error400.component';

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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
