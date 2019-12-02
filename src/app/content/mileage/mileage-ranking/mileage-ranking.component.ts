import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

// services
import { MileageService } from 'src/app/services/mileage.service';
import { UserService } from 'src/app/services/user.service';
import { ExcelService } from 'src/app/services/excel.service';
import { PrintService } from 'src/app/services/print.service';

//json
import collegeTypes from "src/assets/json/collegeTypes.json";
import majorCode from "src/assets/json/majorMileageCode.json";

//utils
import { notifyError, formatDate, notifyInfo } from 'src/util/util';
import { parseJsonToOptions, Option } from 'src/util/options';
import { getMinorMileagesCodes, getMileagesCodes, getDepartmentTypes } from 'src/util/codes';

// models
import { TotalMileage } from 'src/app/model/mileage';


@Component({
  selector: 'app-mileage-ranking',
  templateUrl: './mileage-ranking.component.html',
  styleUrls: ['./mileage-ranking.component.scss']
})
export class MileageRankingComponent implements OnInit {

  MILEAGE_COUNT_IN_PAGE: number = 10;
  PAGE_COUNT_IN_RANGE: number = 5;

  filter;
  totalMileages: TotalMileage[] ;
  totalMileageCount: number;
  score:number;

  majorCodes = majorCode;
  majorCode:String;

  //paging
  pageIndex: number;
  maxPageIndex: number;
  pageIndexRange: number[];

  searchForm: FormGroup;

  majorMileageCodeOptions: Option[];
  collegeTypeOptions: Option[];
  departmentTypeOptions: Option[];

  isFirstPageRange: boolean;
  isLastPageRange: boolean;
  isSearchActivated: boolean;

  constructor(
    private router: Router,
    private excelService: ExcelService, 
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private mileageService: MileageService,

  ) { 
    this.isSearchActivated = false;
    
  }

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      major_code: null,
      department: null,
      year_of_study: this.formBuilder.group({
        1: true,
        2: true,
        3: true,
        4: true
      }),
    });
    this.majorCodes = null;
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

    this.reloadTotalMileages();

  }

  reloadTotalMileages(page?) {
    let filter = this.createFilter(); 
    console.log('[payload]', this.searchForm.value, '[filter]', filter);

    if(page === 0 || page){
      this.pageIndex = page;
    }else{
      this.pageIndex = Number(this.route.snapshot.paramMap.get('page')) - 1;
    }

    this.mileageService.getTotalMileageCount(filter).subscribe(
      (count) => {
        this.totalMileageCount = count;
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

    this.mileageService.getTotalMileages(this.pageIndex * this.MILEAGE_COUNT_IN_PAGE, this.MILEAGE_COUNT_IN_PAGE, filter).subscribe(
      (totalmileages) => {
        this.totalMileages = totalmileages;
      },
      ({ error }) => {
        notifyError(error);
      }
    ); 
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
    this.router.navigate(['/mileage/mileage-ranking', page+1]);
    this.reloadTotalMileages(page);
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

  onChangeMajorMileageCode(page?) {
    let filter = this.createFilter(); 
    console.log('[payload]', this.searchForm.value, '[filter]', filter);

    if(page === 0 || page){
      this.pageIndex = page;
    }else{
      this.pageIndex = Number(this.route.snapshot.paramMap.get('page')) - 1;
    }

    this.mileageService.getTotalMileageCount(filter).subscribe(
      (count) => {
        this.totalMileageCount = count;
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

    this.mileageService.getTotalMileages(this.pageIndex * this.MILEAGE_COUNT_IN_PAGE, this.MILEAGE_COUNT_IN_PAGE, filter).subscribe(
      (totalmileages) => {
        this.totalMileages = totalmileages;
      },
      ({ error }) => {
        notifyError(error);
      }
    ); 
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
    if(this.major_code.value){
      filter['major_code'] = this.major_code.value;
    }

    if(this.department.value) {
      filter['department'] = this.department.value;
    }
    
    let year_of_studyFilter = [];
    for(let i = 1; i <= 4; i++) {
      if(this.year_of_study.get(i+'').value) {
        year_of_studyFilter.push(i);
      }
    }
    filter['year_of_study'] = {$in : year_of_studyFilter};

    return filter;
  }

  downloadExcel() {
    let filter = this.createFilter();
    this.mileageService.getTotalMileages(0, this.totalMileageCount, filter)
      .subscribe(
        (totalmileages) => {
          let rank = 1;
          for(var totalmileage of totalmileages) {
            // id 삭제
            delete totalmileage.id;
            //필요없는 데이터 삭제
            delete totalmileage.d_total_score;
            delete totalmileage.e_total_score;
            delete totalmileage.f_total_score;
            delete totalmileage.g_total_score;
            delete totalmileage.last_update_date;

            totalmileage['순위'] = rank;

            totalmileage['학년'] = totalmileage.year_of_study;
            delete totalmileage.year_of_study;
            
            totalmileage['학번'] = totalmileage.user_num;
            delete totalmileage.user_num;

            totalmileage['학과'] = totalmileage.department;
            delete totalmileage.department;
            
            totalmileage['학생 이름'] = totalmileage.user_name;
            delete totalmileage.user_name;

            totalmileage['마일리지 전체총점'] = totalmileage.total_score;
            delete totalmileage.total_score;
            totalmileage['마일리지 참여총점'] = totalmileage.a_total_score;
            delete totalmileage.a_total_score;
            totalmileage['마일리지 우수총점'] = totalmileage.b_total_score;
            delete totalmileage.b_total_score;
            totalmileage['마일리지 봉사총점'] = totalmileage.c_total_score;
            delete totalmileage.c_total_score;

            rank = rank+1;
          }

          this.excelService.exportAsExcelFile(totalmileages, '마일리지 랭킹');
        },
        ({ error }) => {
          notifyError(error);
        }
      )
  }

  refresh(){
    this.router.navigate(['http://113.198.137.68:8080/mileage/reset-total-score']);
  }

  get major_code() {return this.searchForm.get('major_code');}
  get department() {return this.searchForm.get('department');}
  get year_of_study() { return this.searchForm.get('year_of_study'); }
}
