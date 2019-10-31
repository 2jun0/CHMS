import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
// ngx bootstraps
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
// models
import { Project } from 'src/app/model/project';
// services
import { ProjectService } from 'src/app/services/project.service';
// jsons
import languages from "src/assets/json/languages.json";
import projectAreaTypes from "src/assets/json/projectAreaTypes.json";
import projectStates from "src/assets/json/projectStates.json";
// utils
import { formatDate, range, notifyInfo } from 'src/util/util';
import { Option, parseJsonToOptions } from 'src/util/options';

@Component({
  selector: 'app-public-project-list',
  templateUrl: './public-project-list.component.html',
  styleUrls: [
    './public-project-list.component.scss',
    '../../content.component.scss'
  ]
})
export class PublicProjectListComponent implements OnInit {
  @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
      // f is search key
      if(event.key == 'f'){
        this.onFKeyPress();
      }
    }

  PROJECT_COUNT_IN_PAGE: number = 10;
  PAGE_COUNT_IN_RANGE: number = 5;

  // external functions
  formatDate = formatDate;
  range = range;

  // external json
  projectAreaTypes = projectAreaTypes;
  projectStates = projectStates;
  languages = languages;

  yearRange: number[];

  searchForm: FormGroup;

  projectAreaOptions: Option[] = parseJsonToOptions(projectAreaTypes);
  projectStateOptions: Option[] = parseJsonToOptions(projectStates);

  publicProjects: Project[];
  publicProjectCount: Number;
  pageIndex: number;
  maxPageIndex: number;
  pageIndexRange: number[];

  isFirstPageRange: boolean;
  isLastPageRange: boolean;
  isSearchActivated: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService
  ) {
    this.localeService.use('ko');
    this.publicProjects = [];

    this.yearRange = [];

    let today = new Date();
    let thisYear = today.getFullYear();
    for (var year = 1970; year <= thisYear; year++) {
      this.yearRange.push(year);
    }
  }

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      name: '',
      class_name: '',
      contest_name: '',
      project_type: this.formBuilder.group({
        class: true,
        contest: true,
        others: true
      }),
      project_state: this.createProjectStateForm(),
      project_area_type: this.createProjectAreaTypeForm(),
      exec_time: this.formBuilder.group({
        year: 'all',
        half: 'all'
      }),
      mean_member_year_of_study: this.formBuilder.group({
        one: true,
        two: true,
        three: true,
        four: true
      })
    })
    
    this.reloadProjects();
  }

  reloadProjects(page?) {
    console.log('[payload]', this.searchForm.value);

    let filter = this.createFilter();

    if(page === 0 || page){
      this.pageIndex = page;
    }else{
      this.pageIndex = Number(this.route.snapshot.paramMap.get('page')) - 1;
    }
    
    this.pageIndexRange = [];

    this.projectService.getPublicProjectCount(filter)
      .subscribe(
        (count) => {
          this.publicProjectCount = count;
          this.maxPageIndex = (count%this.PROJECT_COUNT_IN_PAGE === 0) ? (count/this.PROJECT_COUNT_IN_PAGE-1) : Math.floor(count/this.PROJECT_COUNT_IN_PAGE);
          
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
    

    this.projectService.getPublicProjects(this.pageIndex * this.PROJECT_COUNT_IN_PAGE, this.PROJECT_COUNT_IN_PAGE, filter)
      .subscribe(
        (projects) => {
          this.publicProjects = projects;
          for(let project of projects) {
            this.projectService.getProjectLeader(project.id)
              .subscribe(
                (leader) => {
                  project['leader'] = leader;
                })
          }})
  }

  createFilter() {
    let filter = {};

    const nameVal = this.name.value.trim();
    const classNameVal = this.class_name.value.trim();
    const contestNameVal = this.contest_name.value.trim();

    if(nameVal) {
      filter['kr_title'] = nameVal;
      filter['en_title'] = nameVal;
      filter['keywords'] = [nameVal];
    }

    filter['project_type'] = []
    filter['class_contest_name'] = []
    if(this.project_type_class.value) {
      filter['project_type'].push('class');

      if(classNameVal) {
        filter['class_contest_name'].push(classNameVal);
      }
    }
    if(this.project_type_contest.value) {
      filter['project_type'].push('contest');

      if(contestNameVal) {
        filter['class_contest_name'].push(contestNameVal);
      }
    }
    if(this.project_type_others.value) {
      filter['project_type'].push('others');
    }

    if(filter['class_contest_name'].length === 0) {
      delete filter['class_contest_name'];
    }

    filter['project_state'] = [];
    for (var key in projectStates){
      if(this.getChildOfProjectState(key).value) {
        filter['project_state'].push(key);
      }
    }

    filter['project_area_type'] = [];
    for (var key in projectAreaTypes){
      if(this.getChildOfProjectAreaType(key).value) {
        filter['project_area_type'].push(key);
      }
    }
    
    
    if(this.year_of_exec_time.value && this.year_of_exec_time.value !== 'all')
    {
      let searchStartDate;
      let searchEndDate;
      switch(this.half_of_exec_time.value) {
        case 'first':
          searchStartDate = new Date(this.year_of_exec_time.value,0);
          searchEndDate = new Date(this.year_of_exec_time.value,6);
          break;
        case 'second':
          searchStartDate = new Date(this.year_of_exec_time.value,6);
          searchEndDate = new Date(this.year_of_exec_time.value+1,0);
          break;
        case 'all':
        default:
          searchStartDate = new Date(this.year_of_exec_time.value,0);
          searchEndDate = new Date(this.year_of_exec_time.value,11);
          break;
      }
  
      filter['exec_period.start_date'] = {$lt : searchEndDate, $gte : searchStartDate}
      
      // filter['$or'] = [
      //   {$and:[
      //     // 수행 시작 < 검색 시작 < 수행 끝
      //     {'exec_period.start_date' : {$lte : searchStartDate}},
      //     {'exec_period.end_date' : {$gt : searchStartDate}}
      //   ]},
      //   {$and:[
      //     // 수행 시작 < 검색 끝 < 수행 끝
      //     {'exec_period.start_date' :{$lt : searchEndDate}},
      //     {'exec_period.end_date' :{$gte : searchEndDate}}
      //   ]}
      // ];
    }

    filter['mean_member_year_of_study'] = [];
    if(this.one_year_of_study.value) { filter['mean_member_year_of_study'].push(1); }
    if(this.two_year_of_study.value) { filter['mean_member_year_of_study'].push(2); }
    if(this.three_year_of_study.value) { filter['mean_member_year_of_study'].push(3); }
    if(this.four_year_of_study.value) { filter['mean_member_year_of_study'].push(4); }

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
    this.router.navigate(['/project/public-list', page+1]);
    this.reloadProjects(page);
  }

  createProjectAreaTypeForm() {
    let obj = {};
    for (let option of this.projectAreaOptions) {
      obj[option.value] = true;
    }

    return this.formBuilder.group(obj);
  }

  createProjectStateForm() {
    let obj = {};
    for (let option of this.projectStateOptions) {
      obj[option.value] = true;
    }

    return this.formBuilder.group(obj);
  }

  onFKeyPress(){
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
  get class_name(){ return this.searchForm.get('class_name'); }
  get contest_name(){ return this.searchForm.get('contest_name'); }
  get project_type() { return this.searchForm.get('project_type'); }
  get project_type_class() { return this.project_type.get('class'); }
  get project_type_contest() { return this.project_type.get('contest'); }
  get project_type_others() { return this.project_type.get('others'); }
  get project_state() { return this.searchForm.get('project_state'); }
  getChildOfProjectState(key: string) { return this.project_state.get(key); }
  get project_area_type() { return this.searchForm.get('project_area_type'); }
  getChildOfProjectAreaType(key: string) { return this.project_area_type.get(key); }
  get exec_time() { return this.searchForm.get('exec_time'); }
  get year_of_exec_time() { return this.exec_time.get('year'); }
  get half_of_exec_time() { return this.exec_time.get('half'); }
  get mean_member_year_of_study() { return this.searchForm.get('mean_member_year_of_study'); }
  get one_year_of_study() { return this.mean_member_year_of_study.get('one'); }
  get two_year_of_study() { return this.mean_member_year_of_study.get('two'); }
  get three_year_of_study() { return this.mean_member_year_of_study.get('three'); }
  get four_year_of_study() { return this.mean_member_year_of_study.get('four'); }
}
