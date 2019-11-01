import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
// modules
import { ContentModule } from './content/content.module';
import { AppRoutingModule } from './app-routing.module';
// jwt
import { JwtModule } from '@auth0/angular-jwt';
// components
import { AppComponent } from './app.component';
import { Error404Component } from './error/error404/error404.component';
import { Error400Component } from './error/error400/error400.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopnaviComponent } from './topnavi/topnavi.component';
// ngxs
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
// env
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    Error404Component,
    Error400Component,
    TopnaviComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ContentModule,
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: () => {
          return localStorage.getItem('access_token');
        },
        whitelistedDomains: [environment.whitelist],
        blacklistedRoutes: [] 
      }
    }),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
