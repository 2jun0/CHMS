import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// jsons
import majorTypes from 'src/assets/json/majorTypes.json';
// services
import { AuthService } from 'src/app/services/auth.service';
// utils
import { Option, parseJsonToOptions } from 'src/util/options';
import { notifyError } from 'src/util/util';

declare const Utils: any;

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit {
  joinForm: FormGroup;

  majorTypeOptions: Array<Option> = parseJsonToOptions(majorTypes);
  yearsOfStudyOptions: Array<Option> = [
    { value: '1', str: '1학년' },
    { value: '2', str: '2학년' },
    { value: '3', str: '3학년' },
    { value: '4', str: '4학년' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.joinForm = this.formBuilder.group({
      user_num: ['', [
        Validators.required,
        Validators.pattern(/[0-9]/)
      ]],
      password: ['', [
        Validators.required,
        Validators.pattern(/[a-zA-Z0-9!@#$%^&*]/),
        Validators.minLength(6),
        Validators.maxLength(16)
      ]],
      repeat_password: ['', [
        Validators.required
      ]],
      name: ['', [
        Validators.required,
        Validators.pattern(/^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/)
      ]],
      year_of_study: ['', [
        Validators.required
      ]],
      email: ['', [
        Validators.required,
        Validators.pattern(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/)
      ]],
      major_type: ['', [
        Validators.required
      ]]
    })
  }

  join() {
    console.log('[payload]', this.joinForm.value);

    let user_num = this.user_num;
    let password = this.password;
    let repeat_password = this.repeat_password;
    let year_of_study = this.year_of_study;
    let name = this.name;
    let email = this.email;
    let major_type = this.major_type;

    if (user_num.errors) {
      if (user_num.errors.required) {
        notifyError(new Error('학번을 입력하세요!'));
      } else if (user_num.errors.pattern) {
        notifyError(new Error('학번은 숫자로만 입력해야 합니다!'));
      }
    } else if(password.errors) {
      if (password.errors.required) {
        notifyError(new Error('비밀번호를 입력하세요!'));
      } else if (password.errors.pattern) {
        notifyError(new Error('비밀번호는 영문또는 숫자로 입력해야 합니다!'));
      } else if (password.errors.minlength || password.errors.maxlength) {
        notifyError(new Error('비밀번호는 최소 6자, 최대16자로 입력해야 합니다!'));
      }
    } else if(password.value != repeat_password.value) {
      notifyError(new Error('비밀번호가 일치하지 않습니다.'));
    } else if (email.errors) {
      if (email.errors.required) { 
        notifyError(new Error('이메일을 입력하세요!')); 
      } else if (email.errors.pattern) { 
        notifyError(new Error('이메일 형식을 확인해주세요!'));
      }
    } else if (name.errors) {
      if (name.errors.required) {
        notifyError(new Error('이름을 입력해주세요!'));
      }else if (name.errors.pattern) {
        notifyError(new Error('이름은 알파벳이나 한글로만 이루어져야합니다.'));
      }
    } else if (year_of_study.errors) {
      if (year_of_study.errors.required) {
        notifyError(new Error('학년을 선택해주세요!'));
      }
    } else if (major_type.errors) {
      if (major_type.errors.required) {
        notifyError(new Error('전공을 선택해주세요!'));
      }
    } else {
      this.joinForm.value.join_date = new Date();
      this.auth.joinStudentUser(this.joinForm.value)
        .subscribe(
          () => this.router.navigate(['/auth/notify-email-auth'], { queryParams: { email: email}}),
          ({ error }) => {
            notifyError(error);
          }
        )
    }
  }

  get user_num() { return this.joinForm.get('user_num');}
  get password() { return this.joinForm.get('password');}
  get repeat_password() { return this.joinForm.get('repeat_password');}
  get name() { return this.joinForm.get('name');}
  get year_of_study() { return this.joinForm.get('year_of_study');}
  get email() { return this.joinForm.get('email');}
  get major_type() { return this.joinForm.get('major_type');}
}
