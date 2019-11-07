import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
// models
import { Mileage } from 'src/app/model/mileage';
// services
import { AuthService } from 'src/app/services/auth.service';
import { MileageService } from 'src/app/services/mileage.service';
import { getMajorMileagesCodes,getMinorMileagesCodes, getMileagesCodes } from 'src/util/codes';
// utils
import { Option, parseJsonToOptions } from 'src/util/options';
// jsons
import majorMileageCode from "src/assets/json/majorMileageCode.json";
import mileageCode from "src/assets/json/mileageCode.json";
// others
import { formatDate, notifyError, refresh, notifyInfo } from 'src/util/util';

@Component({
  selector: 'app-mileage-detail',
  templateUrl: './mileage-detail.component.html',
  styleUrls: ['./mileage-detail.component.scss']
})
export class MileageDetailComponent implements OnInit {

// jsons for html
majorMileageCode = majorMileageCode;

newMileageForm: FormGroup;

majorMileageCodeOptions: Option[];
minorMileageCodeOptions: Option[];
mileageCodeOptions: Option[];

  formatDate = formatDate;

  isLoad: Boolean;
  modify: Boolean;
  
  myUserType: string;
  myUserNum: number;
  mileageId: string;
  mileage: Mileage;
  MileageForm: FormGroup;
  major_code: string;
  accept_method: string;
  remark: string;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private mileageService: MileageService,
    private formBuilder: FormBuilder,
  ) {
    this.isLoad = false;
    this.modify = false;
   }

  ngOnInit() {
    this.mileageId = this.route.snapshot.paramMap.get('id');
    this.MileageForm = this.formBuilder.group({
      input_date: null,
      minor_code: null,
      code: null,
      code_preview: null,
      detail: '',
      act_date: this.formBuilder.group({
        from: null,
        to: null
      }),
      score: null,
    })

    // // 로그인 한 경우만
    // if(this.authService.isAuthenticated()){ 
    //   // check admin
    //   this.myUserType = this.authService.getUserType();
    //   this.myUserNum = this.authService.getUserNum();

    // // 로그인 안한 경우
    // }else{
    //   // 외부 사용자
    //   this.myUserType = 'external';
    //   this.myUserNum = null;
    // }


    //load mileage detail
    this.mileageService.getMileage(this.mileageId)
    .subscribe(
      (mileage) => {
        this.mileage = mileage;
        this.major_code = this.mileage.code[0];
        this.initForm();
        console.log();
        this.isLoad = true;

      }
    )
  }
  initForm(){
    this.MileageForm = this.formBuilder.group({
      input_date: this.mileage.input_date,
      code: this.mileage.code,
      score: this.mileage.score,
      act_date: this.formBuilder.group({
        from: [this.mileage.act_date.from],
        to: [this.mileage.act_date.to]
      }),

      detail: this.mileage.detail
    })
    
  }


  loadMileageCodes() {
    this.minorMileageCodeOptions = parseJsonToOptions(getMinorMileagesCodes(this.major_code), undefined, (json, key)=>{
      return json[key].description;
    });
  }

  onChangeMinorMileageCode(value) {
    this.mileageCodeOptions = parseJsonToOptions(getMileagesCodes(this.major_code, value), undefined, (json, key)=>{
      return json[key].detail;
    });

    this.code.setValue(this.mileageCodeOptions[0].key);
    this.onChangeMileageCode(this.mileageCodeOptions[0].key);
  }

  onChangeMileageCode(value) {
    this.code_preview.setValue(value);
    this.score.setValue(mileageCode[value]['score']);
    this.accept_method = mileageCode[value]['accept_method'];
    this.remark = mileageCode[value]['remark'];
  }

  detailModify(){
    this.modify = true;
  }
  complete(){
    this.modify = false;
  }
  get input_date() : FormControl { return this.MileageForm.get('input_date') as FormControl; }
  get code() : FormControl { return this.MileageForm.get('codeId') as FormControl; }
  get score() : FormControl { return this.MileageForm.get('score') as FormControl; }
  get act_date() : FormControl { return this.MileageForm.get('act_date') as FormControl; }
  get detail() : FormControl { return this.MileageForm.get('detail') as FormControl; }
  get code_preview() { return this.newMileageForm.get('code_preview');}
  get minor_code() { return this.newMileageForm.get('minor_code');}

}
