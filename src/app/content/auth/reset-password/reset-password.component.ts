import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// services
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
// utils
import { notifyError, notifyInfo } from 'src/util/util';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  user_num: number;

  constructor(
    private router : Router,
    private auth: AuthService,
    private userService: UserService,
  ) { }

  ngOnInit() {
    
  }

  updateRandomPassword(user_num: number) {
    this.userService.updateRandomPassword(user_num)
      .subscribe(
        () => {
          notifyInfo('비밀번호가 재설정 되었습니다. 이메일을 확인해주세요!'); 
        },
        ({ error }) => {
          notifyError(error);
        }
      )
  }
  
} 
