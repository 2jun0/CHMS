import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topnavi',
  templateUrl: './topnavi.component.html',
  styleUrls: ['./topnavi.component.scss']
})
export class TopnaviComponent implements OnInit {

  menuMode = 'external-user';
  user_name: string;

  constructor(
    private auth: AuthService,
    private router: Router
  ) { 
    this.user_name = '';
  }

  ngOnInit() {
    this.menuMode = this.getMenuMode();

    let onChange = () => {
      this.menuMode = this.getMenuMode();
      if(this.auth.isAuthenticated()) {
        this.user_name = this.auth.getUserName();
      }else{
        this.user_name = '';
      }
    };

    this.auth.onLogout.subscribe(onChange);
    this.auth.onLogin.subscribe(onChange);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  getMenuMode() {
    if (!this.auth.isAuthenticated()) { this.menuMode = 'external-user'; }
    else { this.menuMode = 'internal-user'; }

    return this.menuMode;
  }
}
