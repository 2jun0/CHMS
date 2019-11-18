import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// jsons
import majorTypes from 'src/assets/json/majorTypes.json';
import collegeTypes from "src/assets/json/collegeTypes.json";
import departmentTypes from "src/assets/json/departmentTypes.json";
// services
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
// utils
import { Option, parseJsonToOptions } from 'src/util/options';
import { notifyError } from 'src/util/util';
import { getDepartmentTypes } from 'src/util/codes';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit {
  joinForm: FormGroup;

  majorTypeOptions: Option[] = parseJsonToOptions(majorTypes);
  collegeTypeOptions: Option[] = parseJsonToOptions(collegeTypes, undefined, (json, key)=>{
    return json[key].description
  });;
  departmentTypeOptions: Option[] = parseJsonToOptions(departmentTypes, undefined, (json, key)=>{
    return json[key].description
  });;

  yearsOfStudyOptions: Option[] = [
    { key: '1', value: '1학년' },
    { key: '2', value: '2학년' },
    { key: '3', value: '3학년' },
    { key: '4', value: '4학년' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private userService: UserService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.joinForm = this.formBuilder.group({
      user_num: ['', [Validators.required,
        Validators.pattern(/[0-9]/)
      ]],
      password: ['', [Validators.required,
        Validators.pattern(/[a-zA-Z0-9!@#$%^&*]/),
        Validators.minLength(6),
        Validators.maxLength(16)
      ]],
      repeat_password: ['', [Validators.required
      ]],
      name: ['', [Validators.required,
        Validators.pattern(/^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/)
      ]],
      year_of_study: ['', [Validators.required
      ]],
      email: ['', [Validators.required,
        Validators.pattern(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/)
      ]],
      github_id: ['', [Validators.required
      ]],
      major_type: ['', [Validators.required
      ]],
      college_type: ['', [Validators.required
      ]],
      department_type: ['', [Validators.required
      ]]
    })

    this.userService.loadCodes.subscribe(
      () => {
        this.loadDepartmentCodes();
      }
    )

    this.loadDepartmentCodes();
    this.departmentTypeOptions = [];
  }

  loadDepartmentCodes() {
    this.collegeTypeOptions = parseJsonToOptions(collegeTypes, undefined, (json, key)=>{
      return json[key].description
    });
  }

  onChangeCollegeType(value) {
    this.departmentTypeOptions = parseJsonToOptions(getDepartmentTypes(value), undefined, (json, key)=>{
      return json[key].description;
    });
    this.department_type.setValue(this.departmentTypeOptions[0].key);
  }

  join() {
    console.log('[payload]', this.joinForm.value);

    let payload = this.joinForm.value;
    this.auth.joinStudentUser(this.joinForm.value)
      .subscribe(
        () => this.router.navigate(['/auth/notify-email-auth'], { queryParams: { email: payload.email}}),
        ({ error }) => {
          notifyError(error);
        }
      )
  }

  get user_num() { return this.joinForm.get('user_num');}
  get password() { return this.joinForm.get('password');}
  get repeat_password() { return this.joinForm.get('repeat_password');}
  get name() { return this.joinForm.get('name');}
  get year_of_study() { return this.joinForm.get('year_of_study');}
  get email() { return this.joinForm.get('email');}
  get github_id() { return this.joinForm.get('github_id');}
  get major_type() { return this.joinForm.get('major_type');}
  get college_type() { return this.joinForm.get('college_type');}
  get department_type() { return this.joinForm.get('department_type');}
}
