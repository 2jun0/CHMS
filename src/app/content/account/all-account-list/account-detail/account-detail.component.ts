import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// ngx
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
// jsons
import majorTypes from "src/assets/json/majorTypes.json";
import userTypes from "src/assets/json/userTypes.json";
import authStates from "src/assets/json/authStates.json";
import collegeTypes from "src/assets/json/collegeTypes.json";
import departmentTypes from "src/assets/json/departmentTypes.json";
// models
import { User, StudentUser, MentoUser, ProfessorUser } from 'src/app/model/user';
// services
import { UserService } from 'src/app/services/user.service';
// utils
import { formatDate, notifyError } from 'src/util/util';
import { Option, parseJsonToOptions } from 'src/util/options';
import { getDepartmentTypes } from 'src/util/codes';
import { AllAccountListComponent } from '../all-account-list.component';

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

  parent: AllAccountListComponent;

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
  collegeTypeOptions: Option[];
  departmentTypeOptions: Option[];

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

  openModal(user: User, parent: AllAccountListComponent) {
    this.user = user;
    this.parent = parent;

    this.initForm();

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

  initForm() {
    switch(this.user.user_type) {
      case 'student':
        let studentUser = this.user as StudentUser;

        this.userForm = this.formBuilder.group({
          name: [(studentUser.name)?studentUser.name:'', [
            Validators.required, Validators.pattern(/^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/)
          ]],
          email: [(studentUser.email)?studentUser.email:'', [
            Validators.required,  Validators.pattern(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/)
          ]],
          github_id: [(studentUser.github_id)?studentUser.github_id:'', Validators.required],
          auth_state: [(studentUser.auth_state)?studentUser.auth_state:'', Validators.required],
          year_of_study: [(studentUser.year_of_study)?studentUser.year_of_study:'', Validators.required],
          major_type: [(studentUser.major_type)?studentUser.major_type:'', Validators.required],
          college_type: '',
          department_type: [studentUser.department_type, Validators.required],
        });
        break;
      case 'mento':
        let mentoUser = this.user as MentoUser;

        this.userForm = this.formBuilder.group({
          name: [(mentoUser.name)?mentoUser.name:'', [
            Validators.required, Validators.pattern(/^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/)
          ]],
          email: [(mentoUser.email)?mentoUser.email:'', [
            Validators.required,  Validators.pattern(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/)
          ]],
          auth_state: [(mentoUser.auth_state)?mentoUser.auth_state:'', Validators.required],
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
          email: [(professorUser.email)?professorUser.email:'', [
            Validators.required,  Validators.pattern(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/)
          ]],
          auth_state: [(professorUser.auth_state)?professorUser.auth_state:'', Validators.required],
          major: [(professorUser.major)?professorUser.major:'', Validators.required],
          college_type: '',
          department_type: [(professorUser.department_type)?professorUser.department_type:'', Validators.required],
        });
        break;
    }

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

    if(['student', 'professor'].includes(this.user.user_type) && this.user['department_type']) {
      this.college_type.setValue(departmentTypes[this.user['department_type']].college_type);
      this.onChangeCollegeType(this.college_type.value);

      this.department_type.setValue(this.user['department_type']);
    }
  }

  onChangeCollegeType(value) {
    this.departmentTypeOptions = parseJsonToOptions(getDepartmentTypes(value), undefined, (json, key)=>{
      return json[key].description;
    });
    this.department_type.setValue(this.departmentTypeOptions.length>0?this.departmentTypeOptions[0].key:null);
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
    
    this.userService.update(this.user.user_num, payload)
      .subscribe(
        () => {
          this.deactivateUpdateMode();
          for(var key of Object.keys(payload)) {
            this.user[key] = payload[key];
          }
          this.initForm();
          this.parent.reloadUsers(this.parent.pageIndex);
        },
        ({ error }) => {
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
  get email() { return this.userForm.get('email'); }
  get auth_state() { return this.userForm.get('auth_state'); }
  get year_of_study() { return this.userForm.get('year_of_study'); }
  get major_type() { return this.userForm.get('major_type'); }
  get github_id() { return this.userForm.get('github_id'); }
  get workplace() { return this.userForm.get('workplace'); }
  get department() { return this.userForm.get('department'); }
  get job_position() { return this.userForm.get('job_position'); }
  get major() { return this.userForm.get('major'); }
  get college_type() { return this.userForm.get('college_type'); }
  get department_type() { return this.userForm.get('department_type'); }
  get new_password() { return this.updatePasswordForm.get('new_password'); }
  get new_repeat_password() { return this.updatePasswordForm.get('new_repeat_password'); }
}
