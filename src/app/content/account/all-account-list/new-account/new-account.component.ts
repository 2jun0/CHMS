import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// ngx bootstraps
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
// jsons
import majorTypes from "src/assets/json/majorTypes.json";
import userTypes from "src/assets/json/userTypes.json";
import authStates from "src/assets/json/authStates.json";
// models
import { User, StudentUser, MentoUser, ProfessorUser } from 'src/app/model/user';
// services
import { AuthService } from 'src/app/services/auth.service';
// utils
import { formatDate, notifyError } from 'src/util/util';
import { Option, parseJsonToOptions } from 'src/util/options';

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.scss']
})
export class NewAccountComponent implements OnInit {
  @ViewChild("newAccountTemplate", {static: false}) mainTemplate: ElementRef;

  newAccountModal: BsModalRef;

  user_type: string;
  userForm: FormGroup;

  today: Date;

  // external functions
  formatDate = formatDate;

  // external json
  majorTypes = majorTypes;
  userTypes = userTypes;
  authStates = authStates;

  userTypeOptions: Array<Option> = parseJsonToOptions(userTypes);
  majorOptions: Array<Option> = parseJsonToOptions(majorTypes);

  constructor(
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private authService: AuthService
  ) {
    this.today = new Date();
  }

  ngOnInit() {

  }

  openModal(user_type: string) {
    this.user_type = user_type;
    switch(user_type) {
      case 'student':
        this.userForm = this.formBuilder.group({
          user_num: ['', [
            Validators.required,
            Validators.pattern(/[0-9]/)
          ]],
          name: ['', [
            Validators.required, Validators.pattern(/^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/)
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
          email: ['', [
            Validators.required,  Validators.pattern(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/)
          ]],
          year_of_study: ['', Validators.required],
          major_type: ['', Validators.required]
        });
        break;
      case 'mento':
        this.userForm = this.formBuilder.group({
          user_num: ['', [
            Validators.required,
            Validators.pattern(/[0-9]/)
          ]],
          name: ['', [
            Validators.required, Validators.pattern(/^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/)
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
          workplace: '',
          department: '',
          job_position: '',
        });
        break;
      case 'professor':
        this.userForm = this.formBuilder.group({
          user_num: ['', [
            Validators.required,
            Validators.pattern(/[0-9]/)
          ]],
          name: ['', [
            Validators.required, Validators.pattern(/^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/)
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
          major: '',
          department_type: '',
        });
        break;
    }

    this.modalService.onHide.subscribe((reason: string) => {
      this.closeNewAccountModal();
    });

    this.newAccountModal = this.modalService.show(
      this.mainTemplate,
      Object.assign({}, { class: 'gray modal-lg' }, {backdrop: 'static'})
    );
  }

  closeNewAccountModal() {
    if(this.newAccountModal){
      this.newAccountModal.hide();
      this.newAccountModal = null;
    }
  }

  newUser() {
    console.log('[payload]', this.userForm.value);

    let newUser;

    let user_numVal = this.user_num.value.trim() as number;
    let nameVal = this.name.value.trim();
    let passwordVal = this.password.value;
    let repeat_passwordVal = this.repeat_password.value;

    if (this.user_num.errors) {
      if (this.user_num.errors.required) {
        notifyError(new Error('학번을 입력하세요!'));
      } else if (this.user_num.errors.pattern) {
        notifyError(new Error('학번은 숫자로만 입력해야 합니다!'));
      }
    }else if (this.name.errors) {
      if (this.name.errors.required) {
        notifyError(new Error('이름을 입력해주세요!'));
      }else if (this.name.errors.pattern) {
        notifyError(new Error('이름은 알파벳이나 한글로만 이루어져야합니다.'));
      }
    }else if(this.password.errors) {
      if (this.password.errors.required) {
        notifyError(new Error('비밀번호를 입력하세요!'));
      } else if (this.password.errors.pattern) {
        notifyError(new Error('비밀번호는 영문또는 숫자로 입력해야 합니다!'));
      } else if (this.password.errors.minlength || this.password.errors.maxlength) {
        notifyError(new Error('비밀번호는 최소 6자, 최대16자로 입력해야 합니다!'));
      }
    }else if(passwordVal != repeat_passwordVal) {
      notifyError(new Error('비밀번호가 일치하지 않습니다.'));
    }else{
      switch(this.user_type) {
        case 'student':
          let emailVal = this.email.value.trim();
          let year_of_studyVal = this.year_of_study.value;
          let major_typeVal = this.major_type.value.replace('_', ' ');
  
          if (this.email.errors) {
            if (this.email.errors.required) { 
              notifyError(new Error('이메일을 입력하세요!')); 
            } else if (this.email.errors.pattern) { 
              notifyError(new Error('이메일 형식을 확인해주세요!'));
            }
          }else if(this.year_of_study.errors && this.year_of_study.errors.required) {
            notifyError(new Error('학년을 선택해주세요!')); 
          }else if(this.major_type.errors && this.major_type.errors.required) {
              notifyError(new Error('전공을 선택해주세요!')); 
          }
          newUser = {
            user_num: user_numVal,
            name: nameVal,
            password: passwordVal,
            repeat_password: repeat_passwordVal,
            email: emailVal,
            year_of_study: year_of_studyVal,
            major_type: major_typeVal
          };

          break;
        case 'mento':
          newUser = {
            user_num: user_numVal,
            name: nameVal,
            password: passwordVal,
            repeat_password: repeat_passwordVal
          };

          if(this.workplace.value) newUser.workplace = this.workplace.value.trim();
          if(this.department.value) newUser.department = this.department.value.trim();
          if(this.job_position.value) newUser.job_position = this.job_position.value.trim();

          break;
        case 'professor':
          newUser = {
            user_num: user_numVal,
            name: nameVal,
            password: passwordVal,
            repeat_password: repeat_passwordVal
          };

          if(this.major.value) newUser.major = this.major.value.trim();
          if(this.department_type.value) newUser.department_type = this.department_type.value.trim().replace('_',' ');

          break;
      }

      this.authService.joinUser(newUser, this.user_type)
        .subscribe(
          () => { this.closeNewAccountModal(); },
          ({ error }) => {
            console.log(error.message);
            notifyError(new Error(error.message));
            return;
          }
        )
    }
  }

  get user_num() { return this.userForm.get('user_num'); }
  get name() { return this.userForm.get('name'); }
  get password() { return this.userForm.get('password'); }
  get repeat_password() { return this.userForm.get('repeat_password'); }
  get join_date() { return this.userForm.get('join_date'); }
  get email() { return this.userForm.get('email'); }
  get year_of_study() { return this.userForm.get('year_of_study'); }
  get major_type() { return this.userForm.get('major_type'); }
  get workplace() { return this.userForm.get('workplace'); }
  get department() { return this.userForm.get('department'); }
  get job_position() { return this.userForm.get('job_position'); }
  get major() { return this.userForm.get('major'); }
  get department_type() { return this.userForm.get('department_type'); }
}
