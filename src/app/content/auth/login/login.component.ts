import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
// services
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
// utils
import { notifyError, notifyInfo } from 'src/util/util';

declare const Utils: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [
    './login.component.scss',
    '../../content.component.scss'
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      user_num: ['', [
        Validators.required,
        Validators.pattern(/[0-9]/)
      ]],
      password: ['', [
        Validators.required,
        Validators.pattern(/[a-zA-Z0-9!@#$%^&*]/),
        Validators.minLength(6),
        Validators.maxLength(16)
      ]]
    });
  }

  login() {
    console.log('[payload]', this.loginForm.value);

    this.auth.login(this.loginForm.value)
      .subscribe(
        () => {
          let userType = this.auth.getUserType();
          if(userType == 'student') {
            this.router.navigate(['/project/my-list', 1])
          }else if(['mento','professor'].includes(userType)) {
            this.router.navigate(['/project/manage-list', 1])
          }else if(userType == 'admin'){
            this.router.navigate(['/']);
          }
        },
        ({ error }) => {
          notifyError(error);
        }
      );
  }

  get user_num() { return this.loginForm.get('user_num'); }
  get password() { return this.loginForm.get('password'); }
}
