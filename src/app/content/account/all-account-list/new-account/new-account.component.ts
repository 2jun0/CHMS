import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// ngx bootstraps
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
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
// utils
import { formatDate, notifyError, notifyInfo } from 'src/util/util';
import { Option, parseJsonToOptions } from 'src/util/options';
import { getDepartmentTypes } from 'src/util/codes';
import { AllAccountListComponent } from '../all-account-list.component';

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.scss']
})
export class NewAccountComponent implements OnInit {
  @ViewChild("newAccountTemplate", {static: false}) mainTemplate: ElementRef;

  newAccountModal: BsModalRef;
  parent: AllAccountListComponent;

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

  collegeTypeOptions: Option[] = parseJsonToOptions(collegeTypes, undefined, (json, key)=>{
    return json[key].description
  });;
  departmentTypeOptions: Option[] = parseJsonToOptions(departmentTypes, undefined, (json, key)=>{
    return json[key].description
  });;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private authService: AuthService,
    private userService: UserService,
  ) {
    this.today = new Date();
  }

  ngOnInit() {
 
  }

  openModal(user_type: string, parent: AllAccountListComponent) {
    this.user_type = user_type;
    this.parent = parent;

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
          major_type: ['', Validators.required],
          college_type: '',
          department_type: '',
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
          email: ['', [
            Validators.required,  Validators.pattern(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/)
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
          email: ['', [
            Validators.required,  Validators.pattern(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/)
          ]],
          major: '',
          college_type: '',
          department_type: '',
        });
        break;
    }

    this.userService.loadCodes.subscribe(
      () => {
        this.loadDepartmentCodes();
      }
    )

    this.loadDepartmentCodes();

    this.modalService.onHide.subscribe((reason: string) => {
      this.closeNewAccountModal();
    });

    this.newAccountModal = this.modalService.show(
      this.mainTemplate,
      Object.assign({}, { class: 'gray modal-lg' }, {backdrop: 'static'})
    );
  }

  loadDepartmentCodes() {
    this.collegeTypeOptions = parseJsonToOptions(collegeTypes, undefined, (json, key)=>{
      return json[key].description
    });
  }

  closeNewAccountModal() {
    if(this.newAccountModal){
      this.newAccountModal.hide();
      this.newAccountModal = null;
    }
  }

  onChangeCollegeType(value) {
    this.departmentTypeOptions = parseJsonToOptions(getDepartmentTypes(value), undefined, (json, key)=>{
      return json[key].description;
    });
    this.department_type.setValue(this.departmentTypeOptions[0].key);
  }

  newUser() {
    console.log('[payload]', this.userForm.value);

    let payload = this.userForm.value;
    this.authService.joinUser(payload, this.user_type)
      .subscribe(
        () => {
          this.closeNewAccountModal(); 
          notifyInfo('사용자가 생성되었습니다.');
          this.parent.reloadUsers(this.parent.pageIndex);
        },
        ({ error }) => {
          notifyError(error);
          return;
        }
      )
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
  get college_type() { return this.userForm.get('college_type'); }
}
