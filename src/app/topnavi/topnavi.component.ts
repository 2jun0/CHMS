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

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.menuMode = this.getMenuMode();

    let onChange = () => {
      this.menuMode = this.getMenuMode();
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

  get name() {
    if (this.auth.isAuthenticated()) { return this.auth.getUserName(); }
    else { return null; }
  }
}
