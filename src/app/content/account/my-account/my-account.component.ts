import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// ngx bootstraps
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
// jsons
import majorTypes from "src/assets/json/majorTypes.json";
import collegeTypes from "src/assets/json/collegeTypes.json";
import departmentTypes from "src/assets/json/departmentTypes.json";
// models
import { User, StudentUser, MentoUser, ProfessorUser } from 'src/app/model/user';
// services
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
// utils
import { formatDate, notifyError, notifyInfo } from 'src/util/util';
import { Option, parseJsonToOptions } from 'src/util/options';
import { getDepartmentTypes } from 'src/util/codes';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {
  @ViewChild("passwordUpdateTemplate", {static: false}) passwordTemplate: ElementRef;

  // external jsons
  majorTypes = majorTypes;
  departmentTypes = departmentTypes;

  // external functions
  formatDate = formatDate;

  user: User;

  updateForm: FormGroup;
  isUpdateMode: boolean;

  majorOptions: Option[] = parseJsonToOptions(majorTypes);
  collegeTypeOptions: Option[];
  departmentTypeOptions: Option[];
  yearsOfStudyOptions: Option[] = [
    { key: 1, value: '1학년' },
    { key: 2, value: '2학년' },
    { key: 3, value: '3학년' },
    { key: 4, value: '4학년' }
  ];  


  // password update modal
  passwordUpdateModal: BsModalRef;
  updatePasswordForm: FormGroup;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService
  ) {
    this.isUpdateMode = false;
  }

  ngOnInit() {
    // 내 user 객체 얻기
    this.user = this.userService.getMyUser();
    this.initUpdateForm();

    // modal이 hide 되었을시 -> close함수 호출
    this.modalService.onHide.subscribe((reason: string) => {
      if(this.passwordUpdateModal) {
        this.closePasswordUpdateModal();
      }
    });

    this.userService.loadCodes.subscribe(
      () => {
        this.loadCollegeAndDepartmentType();
      }
    )

    this.loadCollegeAndDepartmentType();
  }

  loadCollegeAndDepartmentType() {
    this.collegeTypeOptions = parseJsonToOptions(collegeTypes, undefined, (json, key)=>{
      return json[key].description
    });

    if(['student', 'professor'].includes(this.user.user_type)) {
      this.college_type.setValue(departmentTypes[this.user['department_type']].college_type);
      this.onChangeCollegeType(this.college_type.value);

      this.department_type.setValue(this.user['department_type']);
    }
  }

  onChangeCollegeType(value) {
    this.departmentTypeOptions = parseJsonToOptions(getDepartmentTypes(value), undefined, (json, key)=>{
      return json[key].description;
    });
    this.department_type.setValue(this.departmentTypeOptions[0].key);
  }

  // update form set
  initUpdateForm() {
    switch(this.user.user_type) {
      case 'admin':
        this.updateForm = this.formBuilder.group({
          name: [this.user.name, [
            Validators.required
          ]]
        });
        break;

      case 'student':
        let studentUser = this.user as StudentUser;
        
        this.updateForm = this.formBuilder.group({
          name: [studentUser.name, [
            Validators.required
          ]],
          email: [studentUser.email, [
            Validators.required,
            Validators.pattern(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/)
          ]],
          year_of_study: [studentUser.year_of_study, [
            Validators.required
          ]],
          major_type: [studentUser.major_type, [
            Validators.required
          ]],
          college_type: ['', [
            Validators.required
          ]],
          department_type: [studentUser.department_type, [
            Validators.required
          ]]
        });
        break;
      case 'mento':
        let mentoUser = this.user as MentoUser;

        this.updateForm = this.formBuilder.group({
          name: [mentoUser.name, [
            Validators.required
          ]],
          email: [mentoUser.email, [
            Validators.required,
            Validators.pattern(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/)
          ]],
          workplace: [mentoUser.workplace, [
            Validators.required
          ]],
          department: [mentoUser.department, [
            Validators.required
          ]],
          job_position: [mentoUser.job_position, [
            Validators.required
          ]],
        });
        break;
      case 'professor':
        let professorUser = this.user as ProfessorUser;

        this.updateForm = this.formBuilder.group({
          name: [professorUser.name, [
            Validators.required
          ]],
          email: [professorUser.email, [
            Validators.required,
            Validators.pattern(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/)
          ]],
          major: [professorUser.major, [
            Validators.required
          ]],
          department_type: [professorUser.department_type, [
            Validators.required
          ]],
        });
        break;
    }
  }

  // activate update mode
  activateUpdateMode() {
    this.isUpdateMode = true;
  }

  // deactivate update mode
  deactivateUpdateMode() {
    this.isUpdateMode = false; 
  }

  // update user
  updateUser() {
    let payload = this.updateForm.value;
    console.log('[payload]', payload);

    let isEmailChanged = false;

    if(payload.email) {
      let studentUser = this.user as StudentUser;
      if( payload.email != studentUser.email ) {
        if(!confirm('이메일 변경이 감지 되었습니다.\n이메일 변경 후에는 이메일 인증을 다시 해야 합니다.\n계속 진행 하시겠습니까?')) {
          notifyError(new Error('수정이 취소 되었습니다.'));
          return;
        }else{
          isEmailChanged = true;
        }
      }
    }

    // user update
    this.userService.update(this.user.user_num, payload)
      .subscribe(
        () => {
          this.deactivateUpdateMode()
          notifyInfo('수정되었습니다', true);

          if(isEmailChanged) {
            notifyInfo('바뀐 이메일주소로 보낸 메일을 확인하면 이메일이 변경됩니다.');
          }

          this.authService.reLogin()
          .subscribe(
            () => {
              this.user = this.userService.getMyUser();
            },
            ({ error }) => {      
              notifyError(error);
              return;
            }
          );
        },
        ({ error }) => {
          notifyError(error);
          return;
        }
      )
  }

  // -------------비밀 번호 변경 modal 관련 함수------------
  openPasswordUpdateModal() {
    // modal show
    this.passwordUpdateModal = this.modalService.show(
      this.passwordTemplate,
    )

    // form set
    this.updatePasswordForm = this.formBuilder.group({
      cur_password:['', [
        Validators.required
      ]],
      new_password:['', [
        Validators.required,
        Validators.pattern(/[a-zA-Z0-9!@#$%^&*]/),
        Validators.minLength(6),
        Validators.maxLength(16)
      ]],
      new_repeat_password:['',[
        Validators.required
      ]]
    });
  }
  
  closePasswordUpdateModal() {
    this.passwordUpdateModal.hide();
    this.passwordUpdateModal = null;
    this.updatePasswordForm = null;
  }

  updatePassword() {
    console.log('[payload]', this.updatePasswordForm.value);

    let cur_passwordVal = this.cur_password.value.trim();
    let new_passwordVal = this.new_password.value.trim();
    let new_repeat_passwordVal = this.new_repeat_password.value.trim();

    if(this.cur_password.errors) {
      if (this.cur_password.errors.required) {
        notifyError(new Error('현재 비밀번호를 입력하세요!'));
      }
    }else if(this.new_password.errors) {
      if (this.new_password.errors.required) {
        notifyError(new Error('새 비밀번호를 입력하세요!'));
      } else if (this.new_password.errors.pattern) {
        notifyError(new Error('비밀번호는 영문또는 숫자로 입력해야 합니다!'));
      } else if (this.new_password.errors.minlength || this.new_password.errors.maxlength) {
        notifyError(new Error('비밀번호는 최소 6자, 최대16자로 입력해야 합니다!'));
      }
    }else if(new_passwordVal != new_repeat_passwordVal) {
      notifyError(new Error('새 비밀번호가 일치하지 않습니다.'));
    }else{
      // password update
      this.userService.updatePassword(this.user.user_num, cur_passwordVal, new_passwordVal, new_repeat_passwordVal)
      .subscribe(
        () => {
          this.closePasswordUpdateModal();
        },
        ({ error }) => {
          notifyError(error);
          return;
        }
      )
    }
  }

  // only admin
  get name() { return this.updateForm.get('name'); }

  get email() { return this.updateForm.get('email'); }
  get workplace() { return this.updateForm.get('workplace'); }
  get department() { return this.updateForm.get('department'); }
  get college_type() { return this.updateForm.get('college_type'); }
  get department_type() { return this.updateForm.get('department_type'); }
  get job_position() { return this.updateForm.get('job_position'); }
  get major() { return this.updateForm.get('major'); }
  get year_of_study() { return this.updateForm.get('year_of_study'); }
  
  get cur_password() { return this.updatePasswordForm.get('cur_password'); }
  get new_password() { return this.updatePasswordForm.get('new_password'); }
  get new_repeat_password() { return this.updatePasswordForm.get('new_repeat_password'); }
}
