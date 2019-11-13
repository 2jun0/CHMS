import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
// ngx-bootstraps
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
// jsons
import mileageCode from "src/assets/json/mileageCode.json";
import majorCode from "src/assets/json/majorMileageCode.json";
import minorCode from "src/assets/json/minorMileageCode.json";

import collegeTypes from "src/assets/json/collegeTypes.json";
import departmentTypes from "src/assets/json/departmentTypes.json";
// services
import { MileageService } from 'src/app/services/mileage.service';
import { UserService } from 'src/app/services/user.service';
import { ExcelService } from 'src/app/services/excel.service';
import { PrintService } from 'src/app/services/print.service';
// models
import { Mileage, MajorMileage } from 'src/app/model/mileage';
// utils
import { notifyError, formatDate, notifyInfo } from 'src/util/util';
import { parseJsonToOptions, Option } from 'src/util/options';
import { getMinorMileagesCodes, getMileagesCodes, getDepartmentTypes } from 'src/util/codes';
@Component({
  selector: 'app-all-mileage-list',
  templateUrl: './all-mileage-list.component.html',
  styleUrls: ['./all-mileage-list.component.scss']
})
export class AllMileageListComponent implements OnInit {
  @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
      // f is search key
      if(event.key == 'f'){
        this.onFKeyPress();
      }
    }

  MILEAGE_COUNT_IN_PAGE: number = 20;
  PAGE_COUNT_IN_RANGE: number = 5;
  
  // external functions
  formatDate = formatDate;

  // jsons for html
  mileageCodes = mileageCode;
  majorCodes = majorCode;

  majorMileageCodeOptions: Option[];
  minorMileageCodeOptions: Option[];
  mileageCodeOptions: Option[];

  collegeTypeOptions: Option[];
  departmentTypeOptions: Option[];
  
  searchForm: FormGroup;

  allMileages: Mileage[];
  allMileageCount: number;

  sumOfScore: number;
  sumOfPredictedScore: number;

  pageIndex: number;
  maxPageIndex: number;
  pageIndexRange: number[];

  isFirstPageRange: boolean;
  isLastPageRange: boolean;
  isSearchActivated: boolean;

  today: Date = new Date();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private mileageService: MileageService,
    private excelService: ExcelService, 
    private userService: UserService,
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
    private printService: PrintService,
  ) { 
    this.localeService.use('ko');
    this.allMileages = [];
    this.isSearchActivated = false;
    this.pageIndexRange = [];
  }

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      input_date: null,
      major_code: null,
      minor_code: null,
      mileage_code: null,
      user_name: null,
      user_num: null,
      department: null,
      accepted: true,
      not_accepted: true
    });

    this.mileageService.loadMileageCodes.subscribe(
      () => {
        this.loadMileageCodes();
      },
      ({ error }) => {
        notifyError(error);
      }
    )

    this.userService.loadCodes.subscribe(
      () => {
        this.loadDepartmentTypes();
      }
    );

    this.loadMileageCodes();
    this.loadDepartmentTypes();

    this.reloadMileages();
  }

  reloadMileages(page?) {
    let filter = this.createFilter(); 
    console.log('[payload]', this.searchForm.value, '[filter]', filter);

    if(page === 0 || page){
      this.pageIndex = page;
    }else{
      this.pageIndex = Number(this.route.snapshot.paramMap.get('page')) - 1;
    }

    this.mileageService.getMileageCount(filter).subscribe(
      (count) => {
        this.allMileageCount = count;
        this.maxPageIndex = (count%this.MILEAGE_COUNT_IN_PAGE === 0) ? (count/this.MILEAGE_COUNT_IN_PAGE-1) : Math.floor(count/this.MILEAGE_COUNT_IN_PAGE);
        this.pageIndexRange = [];

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
      },
      ({ error }) => {
        notifyError(error);
      }
    )

    this.mileageService.getMileages(this.pageIndex * this.MILEAGE_COUNT_IN_PAGE, this.MILEAGE_COUNT_IN_PAGE, filter).subscribe(
      (mileages) => {
        this.allMileages = mileages;
      },
      ({ error }) => {
        notifyError(error);
      }
    );

    this.mileageService.getSumOfScoreInMileage(filter).subscribe(
      (sumOfScore) => {
        this.sumOfScore = sumOfScore;
      },
      ({ error }) => {
        notifyError(error);
      }
    )

    this.mileageService.getSumOfPredictedScoreInMileage(filter).subscribe(
      (sumOfPredictedScore) => {
        this.sumOfPredictedScore = sumOfPredictedScore;
      },
      ({ error }) => {
        notifyError(error);
      }
    )
  }

  loadMileageCodes() {
    this.majorMileageCodeOptions = parseJsonToOptions(majorCode, undefined, (json, key)=>{
      return json[key].description;
    });
    delete this.majorMileageCodeOptions[3];
    this.majorMileageCodeOptions.length = 3;
  }

  loadDepartmentTypes() {
    this.collegeTypeOptions = parseJsonToOptions(collegeTypes, undefined, (json, key) => {
      return json[key].description
    });
  }

  onChangeMajorMileageCode(value) {
    this.minorMileageCodeOptions = parseJsonToOptions(getMinorMileagesCodes(value), undefined, (json, key)=>{
      return json[key].description;
    });

    this.minor_code.setValue(null);
    this.mileage_code.setValue(null);

    this.gotoPage(0);
  }

  onChangeMinorMileageCode(value) {
    this.mileageCodeOptions = parseJsonToOptions(getMileagesCodes(this.major_code.value, value), undefined, (json, key)=>{
      return json[key].detail;
    });

    this.mileage_code.setValue(null);

    this.gotoPage(0);
  }

  onChangeCollegeType(value) {
    this.departmentTypeOptions = parseJsonToOptions(getDepartmentTypes(value), undefined, (json, key)=>{
      return json[key].description;
    });
    if(value == '모두' || value == null) {
      this.department.setValue(null);
    }else{
      this.department.setValue(this.departmentTypeOptions[0].key);
    }

    this.gotoPage(0);
  }

  createFilter() {
    let filter = {};

    if(this.input_date.value) {
      filter['input_date'] = {$gte: this.input_date.value[0], $lte: this.input_date.value[1]};
    }

    if(this.major_code.value) {
      filter['code'] = this.major_code.value;
      if(this.minor_code.value) {
        filter['code'] = this.minor_code.value;
        if(this.mileage_code.value) {
          filter['code'] = this.mileage_code.value;
        }
      }
    }

    if(this.user_name.value) {
      filter['user_name'] = this.user_name.value;
    }

    if(this.user_num.value) {
      filter['user_num'] = this.user_num.value;
    }

    if(this.department.value) {
      filter['department'] = this.department.value;
    }

    let is_acceptedFilter = [];
    if(this.accepted.value) {
      is_acceptedFilter.push(true)
    }
    if(this.not_accepted.value) {
      is_acceptedFilter.push(false)
    }
    if(is_acceptedFilter.length > 0) {
      filter['is_accepted'] = {$in : is_acceptedFilter};
    }

    return filter;
  }

  onInputDateChange(date: Date[]) {
    // 무한 루프를 방지하기 위함임
    if(date){
      if(!this.input_date.value || (this.input_date.value[0] !== date[0] || this.input_date.value[1] !== date[1])) {
        this.input_date.setValue(date);
        this.gotoPage(0);
      }
    }
  }

  clearInputDate() {
    this.input_date.setValue(null);
    this.gotoPage(0);
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
    this.router.navigate(['/mileage/all-mileage-list', page+1]);
    this.reloadMileages(page);
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

  downloadExcel() {
    let filter = this.createFilter();
    this.mileageService.getMileages(0, this.allMileageCount, filter)
      .subscribe(
        (mileages) => {
          for(var mileage of mileages) {
            // id, photo 삭제
            delete mileage.id;
            delete mileage.info_photos;

            mileage['마일리지 코드'] = mileage.code;
            mileage['마일리지 이름'] = (mileageCode[mileage.code])?mileageCode[mileage.code].detail:'알수 없음';
            delete mileage.code;

            mileage['학생 이름'] = mileage.user_name;
            delete mileage.user_name;

            mileage['학번'] = mileage.user_num;
            delete mileage.user_num;

            mileage['학과'] = mileage.department;
            delete mileage.department;

            mileage['입력날짜'] = mileage.input_date;
            delete mileage.input_date;

            mileage['수행 일자(from)'] = mileage.act_date.from;
            mileage['수행 일자(to)'] = mileage.act_date.to;
            delete mileage.act_date;

            mileage['마일리지 점수'] = mileage.score;
            delete mileage.score;
           
            mileage['마일리지 활동상세내역'] = mileage.detail;
            delete mileage.detail;

            mileage['인증 여부'] = mileage.is_accepted;
            delete mileage.is_accepted;

          }

          this.excelService.exportAsExcelFile(mileages, '마일리지 리스트');
        },
        ({ error }) => {
          notifyError(error);
        }
      )
  }

  print() {
    let filter = this.createFilter();
    this.printService.printDocument('mileage-list', JSON.stringify(filter));
  }

  get input_date() {return this.searchForm.get('input_date');}
  get major_code() {return this.searchForm.get('major_code');}
  get minor_code() {return this.searchForm.get('minor_code');}
  get mileage_code() {return this.searchForm.get('mileage_code');}
  get user_name() {return this.searchForm.get('user_name');}
  get user_num() {return this.searchForm.get('user_num');}
  get department() {return this.searchForm.get('department');}
  get accepted() {return this.searchForm.get('accepted');}
  get not_accepted() {return this.searchForm.get('not_accepted');}
}
