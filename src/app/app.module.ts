import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ContentModule } from './content/content.module';
import { HttpClientModule } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { Error404Component } from './error/error404/error404.component';
import { Error400Component } from './error/error400/error400.component';
import { TopnaviComponent } from './topnavi/topnavi.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PrintLayoutComponent } from './print/print-layout/print-layout.component';
import { PrintProjectComponent } from './print/print-project/print-project.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    Error404Component,
    Error400Component,
    TopnaviComponent,
    PrintLayoutComponent,
    PrintProjectComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ContentModule,
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        // tokenGetter: () => {
        //   return localStorage.getItem('access_token');
        // },
        // whitelistedDomains: ['localhost:4200'],
        // blacklistedRoutes: []
      }
    }),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
