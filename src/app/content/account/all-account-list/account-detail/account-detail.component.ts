import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// ngx
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
// jsons
import majorTypes from "src/assets/json/majorTypes.json";
import userTypes from "src/assets/json/userTypes.json";
import authStates from "src/assets/json/authStates.json";
// models
import { User, StudentUser, MentoUser, ProfessorUser } from 'src/app/model/user';
// services
import { UserService } from 'src/app/services/user.service';
// utils
import { formatDate, notifyError } from 'src/util/util';
import { Option, parseJsonToOptions } from 'src/util/options';

declare const Utils: any;

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss']
})
export class AccountDetailComponent implements OnInit {
  @ViewChild("accountDetailTemplate", {static: false}) mainTemplate: ElementRef;
  @ViewChild("passwordUpdateTemplate", {static: false}) passwordTemplate: ElementRef;
  @ViewChild("confirmDeleteUserTemplate", {static: false}) confirmDeleteUserTemplate: ElementRef;

  accountDetailModal: BsModalRef;
  passwordUpdateModal: BsModalRef;
  contirmDeleteUserModal: BsModalRef;

  isUpdateMode: boolean;
  userForm: FormGroup;
  updatePasswordForm: FormGroup;

  user: User;

  today: Date;

  isShown: boolean;

  // external functions
  formatDate = formatDate;

  // external json
  majorTypes = majorTypes;
  userTypes = userTypes;
  authStates = authStates;

  majorOptions: Option[] = parseJsonToOptions(majorTypes);

  constructor(
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private userService: UserService,
  ) {
    this.isUpdateMode = false;
    this.today = new Date();
    this.isShown = false;
   }

  ngOnInit() {
  }

  openModal(user: User) {
    this.user = user;

    switch(this.user.user_type) {
      case 'student':
        let studentUser = this.user as StudentUser;

        this.userForm = this.formBuilder.group({
          name: [(studentUser.name)?studentUser.name:'', [
            Validators.required, Validators.pattern(/^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/)
          ]],
          join_date: [(studentUser.join_date)?studentUser.join_date:'', Validators.required],
          email: [(studentUser.email)?studentUser.email:'', [
            Validators.required,  Validators.pattern(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/)
          ]],
          auth_state: [(studentUser.auth_state)?studentUser.auth_state:'', Validators.required],
          year_of_study: [(studentUser.year_of_study)?studentUser.year_of_study:'', Validators.required],
          major_type: [(studentUser.major_type)?studentUser.major_type:'', Validators.required]
        });
        break;
      case 'mento':
        let mentoUser = this.user as MentoUser;

        this.userForm = this.formBuilder.group({
          name: [(mentoUser.name)?mentoUser.name:'', [
            Validators.required, Validators.pattern(/^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/)
          ]],
          join_date: [(mentoUser.join_date)?mentoUser.join_date:'', Validators.required],
          workplace: [(mentoUser.workplace)?mentoUser.workplace:'', Validators.required],
          department: [(mentoUser.department)?mentoUser.department:'', Validators.required],
          job_position: [(mentoUser.job_position)?mentoUser.job_position:'', Validators.required],
        });
        break;
      case 'professor':
        let professorUser = this.user as ProfessorUser;

        this.userForm = this.formBuilder.group({
          name: [(professorUser.name)?professorUser.name:'', [
            Validators.required, Validators.pattern(/^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/)
          ]],
          join_date: [(professorUser.join_date)?professorUser.join_date:'', Validators.required],
          major: [(professorUser.major)?professorUser.major:'', Validators.required],
          department_type: [(professorUser.department_type)?professorUser.department_type:'', Validators.required],
        });
        break;
    }

    this.modalService.onHide.subscribe((reason: string) => {
      if(this.passwordUpdateModal) {
        this.closePasswordUpdateModal();
      }else if(this.contirmDeleteUserModal) {
        this.closeConfirmDeleteUserModal();  
      }else{
        this.deactivateUpdateMode();
      }
    });

    this.accountDetailModal = this.modalService.show(
      this.mainTemplate,
      Object.assign({}, { class: 'gray modal-lg' })
    );

    this.isShown = true;
  }

  openPasswordUpdateModal() {
    // modal show
    this.passwordUpdateModal = this.modalService.show(
      this.passwordTemplate,
      { class: 'second' }
    );

    // form set
    this.updatePasswordForm = this.formBuilder.group({
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

  openConfirmDeleteUserModal() {
    this.contirmDeleteUserModal = this.modalService.show(
      this.confirmDeleteUserTemplate,
      { class: 'second' }
    ) 
  }

  closeAccountDetailModal() {
    this.accountDetailModal.hide();
    this.accountDetailModal = null;
    this.deactivateUpdateMode();
    this.isShown = false;
  }

  closePasswordUpdateModal() {
    this.passwordUpdateModal.hide();
    this.passwordUpdateModal = null;
  }

  closeConfirmDeleteUserModal() {
    this.contirmDeleteUserModal.hide();
    this.contirmDeleteUserModal = null;
  }

  deactivateUpdateMode() {
    this.isUpdateMode = false;
  }

  activateUpdateMode() {
    this.isUpdateMode = true;
  }

  deleteUser() {
    this.userService.delete(this.user.user_num)
      .subscribe(
        () => {
          this.closeConfirmDeleteUserModal();
          this.closeAccountDetailModal();
        },
        ({ error }) => {
          console.log(error.message);
          Utils.showNotification('top', 'center', 'danger', error.message);
        }
      )
  }

  updateUser() {
    let payload = this.userForm.value;

    console.log('[payload]', this.userForm.value);

    let query  = {};

    let nameVal = this.name.value.trim();
    let join_dateVal = this.join_date.value;

    if(nameVal !== this.user.name) {
      if (this.name.errors) {
        if (this.name.errors.required) {
          Utils.showNotification('top', 'center', 'danger', '이름을 입력해주세요!');
          return;
        }else if (this.name.errors.pattern) {
          Utils.showNotification('top', 'center', 'danger', '이름은 알파벳이나 한글로만 이루어져야합니다.');
          return;
        }
      }else{ query['name'] = nameVal; }
    }

    if(join_dateVal !== this.user.join_date) {
      if(this.join_date.errors && this.join_date.errors.required) {
        Utils.showNotification('top', 'center', 'danger', '가입 날짜를 입력해주세요!'); 
        return;
      }else{ query['join_date'] = join_dateVal; }
    }

    switch(this.user.user_type) {
      case 'student':
        let studentUser = this.user as StudentUser;
        
        let emailVal = this.email.value.trim();
        let auth_stateVal = this.auth_state.value;
        let year_of_studyVal = this.year_of_study.value;
        let major_typeVal = this.major_type.value;

        if(emailVal !== studentUser.email) {
          if (this.email.errors) {
            if (this.email.errors.required) { 
              Utils.showNotification('top', 'center', 'danger', '이메일을 입력하세요!'); 
              return;
            } else if (this.email.errors.pattern) { 
              Utils.showNotification('top', 'center', 'danger', '이메일 형식을 확인해주세요!');
              return;
            }
          }else{ query['email'] = emailVal; }
        }

        if(auth_stateVal !== studentUser.auth_state) {
          if(this.auth_state.errors && this.auth_state.errors.required) {
            Utils.showNotification('top', 'center', 'danger', '인증 상태를 선택해주세요!'); 
            return;
          }else{ query['auth_state'] = auth_stateVal; }
        }

        if(year_of_studyVal !== studentUser.year_of_study) {
          if(this.year_of_study.errors && this.year_of_study.errors.required) {
            Utils.showNotification('top', 'center', 'danger', '학년을 선택해주세요!'); 
            return;
          }else{ query['year_of_study'] = year_of_studyVal; }
        }

        if(major_typeVal !== studentUser.major_type) {
          if(this.major_type.errors && this.major_type.errors.required) {
            Utils.showNotification('top', 'center', 'danger', '전공을 선택해주세요!'); 
            return;
          }else{ query['major_type'] = major_typeVal; }
        }
        break;
      case 'mento':
        let mentoUser = this.user as MentoUser;

        let workplaceVal = this.workplace.value.trim();
        let departmentVal = this.department.value.trim();
        let job_positionVal = this.job_position.value.trim();

        query['workplace'] = workplaceVal;
        query['department'] = departmentVal;
        query['job_position'] = job_positionVal;
        break;
      case 'professor':
        let professorUser = this.user as ProfessorUser;

        let majorVal = this.major.value.trim();
        let department_typeVal = this.department_type.value.trim();

        query['major'] = majorVal;
        query['department_type'] = department_typeVal;
        break;
    }
      
    this.userService.update(this.user.user_num, payload)
      .subscribe(
        () => {
          this.deactivateUpdateMode()
          for(var key of Object.keys(payload)) {
            this.user[key] = payload[key];
          }
        },
        ({ error }) => {
          console.log(error.message);
          Utils.showNotification('top', 'center', 'danger', error.message);
          return;
        }
      )
  }

  updatePassword() {
    console.log('[payload]', this.updatePasswordForm.value);

    let new_passwordVal = this.new_password.value.trim();
    let new_repeat_passwordVal = this.new_repeat_password.value.trim();

    if(this.new_password.errors) {
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
      this.userService.updatePassword(this.user.user_num, null, new_passwordVal, new_repeat_passwordVal)
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

  get name() { return this.userForm.get('name'); }
  get join_date() { return this.userForm.get('join_date'); }
  get email() { return this.userForm.get('email'); }
  get auth_state() { return this.userForm.get('auth_state'); }
  get year_of_study() { return this.userForm.get('year_of_study'); }
  get major_type() { return this.userForm.get('major_type'); }
  get workplace() { return this.userForm.get('workplace'); }
  get department() { return this.userForm.get('department'); }
  get job_position() { return this.userForm.get('job_position'); }
  get major() { return this.userForm.get('major'); }
  get department_type() { return this.userForm.get('department_type'); }

  get new_password() { return this.updatePasswordForm.get('new_password'); }
  get new_repeat_password() { return this.updatePasswordForm.get('new_repeat_password'); }
}
