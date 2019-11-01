import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
// services
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @ViewChild("sidebar", {static:false}) sidebar: ElementRef;

  menuMode = 'external-user';
  user_name: string;

  constructor(
    private router : Router,
    private auth: AuthService
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

  getMenuMode() {
    // 외부 사용자
    if (!this.auth.isAuthenticated()) { 
      return 'external-user';
    }else{
      let user_type = this.auth.getUserType();
      // 사용자
      if (user_type === 'student') { return 'student'; }
      else if (user_type === 'professor') { return 'professor'; } 
      else if (user_type === 'mento') { return 'mento'; }
      else if (user_type === 'admin') { return 'admin'; }
      else { return 'external-user'; }
    }
  }

  gotoPublicProjectList() {
    this.router.navigate(['/project/public-list', 1]);
  }

  gotoAllProjectList() {
    this.router.navigate(['project/all-list', 1]);
  }

  gotoManageProjectList() {
    this.router.navigate(['/project/manage-list', 1]);
  }

  gotoMyProjectList() {
    this.router.navigate(['project/my-list', 1]);
  }
  
  gotoMyAccount() {
    this.router.navigate(['/account/my']);
  }

  gotoAllAccountList() {
    this.router.navigate(['account/all-list', 1]);
  }

  gotoInputMileage(type: string) {
    this.router.navigate(['mileage/input-mileage', type])
  }

  gotoMymileage() {
    this.router.navigate([]);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
