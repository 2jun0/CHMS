import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
// ngx-bootstraps
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
// jsons
import majorTypes from "src/assets/json/majorTypes.json";
import userTypes from "src/assets/json/userTypes.json";
import authStates from "src/assets/json/authStates.json";
// models
import { User } from 'src/app/model/user';
// services
import { UserService } from 'src/app/services/user.service';
// utils
import { formatDate, notifyInfo } from 'src/util/util';
import { Option, parseJsonToOptions } from 'src/util/options';

@Component({
  selector: 'app-all-account-list',
  templateUrl: './all-account-list.component.html',
  styleUrls: ['./all-account-list.component.scss']
})
export class AllAccountListComponent implements OnInit {
  @ViewChild("accountDetail", {static: false}) accountDetailTemplate: ElementRef;

  @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
      // f is search key
      if(event.key == 'f'){
        this.onFKeyPress();
      }
    }

  USER_COUNT_IN_PAGE: number = 10;
  PAGE_COUNT_IN_RANGE: number = 5;
  
  // external functions
  formatDate = formatDate;

  // external json
  majorTypes = majorTypes;
  userTypes = userTypes;
  authStates = authStates;

  searchForm: FormGroup;

  allUsers: Array<User>;
  allUserCount: Number;
  pageIndex: number;
  maxPageIndex: number;
  pageIndexRange: Array<number>;

  isFirstPageRange: boolean;
  isLastPageRange: boolean;
  isSearchActivated: boolean;

  today: Date;

  majorOptions: Array<Option> = parseJsonToOptions(majorTypes);
  userTypeOptions: Array<Option> = parseJsonToOptions(userTypes);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
  ) {
    this.localeService.use('ko');

    this.allUsers = [];
    this.today = new Date();
  }

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      name: '',
      user_num: 0,
      user_type: this.formBuilder.group({
        student: true,
        mento: true,
        professor: true
      }),
      auth_state: this.formBuilder.group({
        authenticated: true,
        unauthenticated: true
      }),
      year_of_study: this.formBuilder.group({
        one: true,
        two: true,
        three: true,
        four: true
      }),
      join_date: null,
    })
    
    this.reloadUsers();
  }

  reloadUsers(page?) {
    console.log('[payload]', this.searchForm.value);

    let filter = this.createFilter();

    if(page === 0 || page){
      this.pageIndex = page;
    }else{
      this.pageIndex = Number(this.route.snapshot.paramMap.get('page')) - 1;
    }
    
    this.pageIndexRange = Array<number>();

    this.userService.getAllUserCount(filter)
      .subscribe(
        (count) => {
          this.allUserCount = count;
          this.maxPageIndex = (count%this.USER_COUNT_IN_PAGE === 0) ? (count/this.USER_COUNT_IN_PAGE-1) : Math.floor(count/this.USER_COUNT_IN_PAGE);

          for (var idx = this.pageIndex - this.pageIndex % this.PAGE_COUNT_IN_RANGE, i = 0; (i < this.PAGE_COUNT_IN_RANGE)&&(idx <= this.maxPageIndex); i++, idx++) {
            this.pageIndexRange.push(idx);
          }

          if(this.pageIndexRange[0] === 0) {
            this.isFirstPageRange = true;
          }else{
            this.isFirstPageRange = false;
          }
          
          if(this.pageIndexRange[this.pageIndexRange.length-1] == this.maxPageIndex){
            this.isLastPageRange = true;
          }else{
            this.isLastPageRange = false;
          }
        }
      );
    
    this.userService.getAllUsers(this.pageIndex * this.USER_COUNT_IN_PAGE, this.USER_COUNT_IN_PAGE, filter)
        .subscribe(
          (users) => {
            console.log(users);
            this.allUsers = users;
          }
        )
  }

  createFilter() {
    let filter = {};

    const nameVal = this.name.value.trim();
    const userNumVal = this.user_num.value;

    if(nameVal) {
      filter['name'] = nameVal;
    }

    if(userNumVal) {
      filter['user_num'] = userNumVal;
    }

    filter['user_type'] = [];
    if(this.student_user_type.value) {
      filter['user_type'].push('student');
  
      filter['auth_state'] = [];
      if(this.authenticated_auth_state.value) { filter['auth_state'].push('authenticated'); }
      if(this.unauthenticated_auth_state.value) { filter['auth_state'].push('unauthenticated'); }
    }
    if(this.mento_user_type.value) { filter['user_type'].push('mento'); }
    if(this.professor_user_type.value) { filter['user_type'].push('professor'); }

    if(this.join_date.value) {
      filter['join_date'] = {$gte: this.join_date.value[0], $lte: this.join_date.value[1]};
    }

    return filter;
  }

  gotoFirstPage() {
    this.gotoPage(0);
  }

  gotoLastPage() {
    this.gotoPage(this.maxPageIndex);
  }

  gotoNextPageRange() {
    let idx = this.pageIndexRange[0] + this.PAGE_COUNT_IN_RANGE;
    if(idx >= this.maxPageIndex) { 
      this.gotoLastPage();
    }else {
      this.gotoPage(idx);
    }
  }

  gotoPreviousPageRange() {
    let idx = this.pageIndexRange[0] - 1;
    if(idx <= 0) {
      this.gotoFirstPage();
    }else{
      this.gotoPage(idx);
    }
  }

  gotoPage(page: number) {
    this.router.navigate(['/account/all-list', page+1]);
    this.reloadUsers(page);
  }

  onJoinDateChange(date: Date[]) {
    // 무한 루프를 방지하기 위함임
    if(date){
      if(!this.join_date.value || (this.join_date.value[0] !== date[0] || this.join_date.value[1] !== date[1])) {
        this.join_date.setValue(date);
        this.gotoPage(0);
      }
    }
  }

  clearJoinDate() {
    this.join_date.setValue(null);
    this.gotoPage(0);
  }

  onFKeyPress(){
    if(this.accountDetailTemplate['isShown']) return; 

    if(this.isSearchActivated) this.deActivateSearch();
    else this.activateSearch();
  }

  activateSearch() {
    this.isSearchActivated = true;
    notifyInfo('검색 모드 활성화', true);
  }

  deActivateSearch() {
    this.isSearchActivated = false;
    notifyInfo('검색 모드 비활성화', true);
  }

  get name(){ return this.searchForm.get('name'); }
  get user_num(){ return this.searchForm.get('user_num'); }
  get user_type() { return this.searchForm.get('user_type'); }
  get student_user_type() { return this.user_type.get('student'); }
  get mento_user_type() { return this.user_type.get('mento'); }
  get professor_user_type() { return this.user_type.get('professor'); }
  get auth_state() { return this.searchForm.get('auth_state'); }
  get authenticated_auth_state() { return this.auth_state.get('authenticated'); }
  get unauthenticated_auth_state() { return this.auth_state.get('unauthenticated'); }
  get year_of_study() { return this.searchForm.get('year_of_study'); }
  get one_year_of_study() { return this.year_of_study.get('one'); }
  get two_year_of_study() { return this.year_of_study.get('two'); }
  get three_year_of_study() { return this.year_of_study.get('three'); }
  get four_year_of_study() { return this.year_of_study.get('four'); }
  get join_date() { return this.searchForm.get('join_date'); }
}