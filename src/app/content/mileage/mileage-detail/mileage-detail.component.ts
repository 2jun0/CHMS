import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
// models
import { Mileage } from 'src/app/model/mileage';
// services
import { AuthService } from 'src/app/services/auth.service';
import { MileageService } from 'src/app/services/mileage.service';
import { PrintService } from 'src/app/services/print.service';
import { getMajorMileagesCodes, getMinorMileagesCodes, getMileagesCodes } from 'src/util/codes';
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

  // function for html
  formatDate = formatDate;

  newMileageForm: FormGroup;

  majorMileageCodeOptions: Option[];
  minorMileageCodeOptions: Option[];
  mileageCodeOptions: Option[];

  today : Date =  new Date();

  isLoad: Boolean;
  modify: Boolean;
  
  myUserType: string;
  myUserNum: number;
  mileageId: string;
  mileage: Mileage;
  MileageForm: FormGroup;
  major_code: string;

  isAdmin: boolean;
  

  //화면에 보여지기 위한 변수
  viewMinor: string;
  viewCode: string;
  accept_method: string;
  remark: string;
  tmp: string;

  constructor(
    private router : Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private mileageService: MileageService,
    private printService: PrintService,
    private formBuilder: FormBuilder,
  ) {
    this.isLoad = false;
    this.modify = false;
    this.isAdmin = false;
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

    // 로그인 한 경우만
    if(this.authService.isAuthenticated()){ 
      // check admin
      if(this.authService.getUserType() == 'admin') {
        this.isAdmin = true;
      }else{
        this.isAdmin = false;
      }
    // 로그인 안한 경우
    }else{
      // 외부 사용자
      this.isAdmin = false;
    }


    //load mileage detail
    this.loadMileage(this.mileageId);
    
  } //end ngOnInit()

  loadMileage(mileageId) {
    this.mileageService.getMileage(mileageId)
    .subscribe(
      (mileage) => {
        this.mileage = mileage;
        this.major_code = this.mileage.code[0];
        this.initForm();
        this.setMileageCodes(this.MileageForm.value.code[0]+this.MileageForm.value.code[1],this.MileageForm.value.code);
        this.isLoad = true;
      }
    )
  }

 //초기 조회를 위한 함수
  initForm(){
    this.MileageForm = this.formBuilder.group({
      id: this.mileageId,
      input_date: this.mileage.input_date,
      minor_code: this.mileage.code[0]+this.mileage.code[1],
      code: this.mileage.code,
      score: this.mileage.score,
      act_date: this.formBuilder.group({
        from: [this.mileage.act_date.from],
        to: [this.mileage.act_date.to]
      }),

      detail: this.mileage.detail,
      is_accepted: this.mileage.is_accepted,
    })
    
  }
  setMileageCodes(value,thisCode){
    this.minorMileageCodeOptions = parseJsonToOptions(getMinorMileagesCodes(this.major_code), undefined, (json, key)=>{
      return json[key].description;
    });
    this.mileageCodeOptions = parseJsonToOptions(getMileagesCodes(this.major_code, value), undefined, (json, key)=>{
      return json[key].detail;
    });

    for (let minor of this.minorMileageCodeOptions){
      if (minor.key == value)
        this.viewMinor = minor.value;
    }
    for (let code of this.mileageCodeOptions){
      if (code.key == this.mileage.code)
        this.viewCode = code.value;
    }

    this.MileageForm.value.minor_code = value;
    this.accept_method = mileageCode[thisCode]['accept_method'];

    this.tmp = mileageCode[thisCode]['remark'];
    this.remark = this.tmp.split("ent").join("\n");
  }//end 초기 조회를 위한 함수

  onSubmit(){
    if(!confirm('정말 수정하시겠습니까?')) return;

    let payload = this.MileageForm.value;
    let code = this.MileageForm.value.code;
    let minorcode = this.MileageForm.value.code[0]+this.MileageForm.value.code[1];

    delete payload.input_date;
    delete payload.minor_code;
    delete payload.score;
    delete payload.code;
    delete payload.is_accepted;

    this.mileageService.updateMileage(this.mileageId, payload)
      .subscribe(
        () => {
          notifyInfo('정상적으로 수정되었습니다.');
          this.modify = false;
          this.loadMileage(this.mileageId);
        },
        ({ error }) => {
          notifyError(error);
        }
      );
  }

  detailModify(){
    this.modify = true;
  }
  cancel(){
    this.modify = false;
  }
  delete(){
    if(!confirm('정말 삭제하시겠습니까?')) return;

    this.mileageService.deleteMileage(this.mileageId)
    .subscribe(
      () => {
        this.modify = false;
        if(this.authService.getUserType() == "admin"){
          history.back();
        }
        else{
          this.router.navigate(['mileage/my-mileage',1]);
        }
        notifyInfo('정상적으로 삭제되었습니다.');
      },
      ({ error }) => {
        notifyError(error);
      }
    );
    
  }

  onChangeIsAccepted(value) {
    this.mileageService.updateIsAccepted(this.mileageId, value).subscribe(
      () => {
        if(value) {
          notifyInfo("사업단 확인이 승인 되었습니다.");
        }else{
          notifyInfo("사업단 승인이 취소 되었습니다.");
        }
        this.loadMileage(this.mileageId);
      },
      ({ error }) => {
        notifyError(error);
      }
    )
  }

  print() {
    this.printService.printDocument('mileage', this.mileageId);
  }
  get input_date() : FormControl { return this.MileageForm.get('input_date') as FormControl; }
  get code() : FormControl { return this.MileageForm.get('code') as FormControl; }
  get score() : FormControl { return this.MileageForm.get('score') as FormControl; }
  get act_date() : FormControl { return this.MileageForm.get('act_date') as FormControl; }
  get detail() : FormControl { return this.MileageForm.get('detail') as FormControl; }
  get code_preview() : FormControl { return this.MileageForm.get('code_preview') as FormControl;}
  get minor_code(): FormControl { return this.MileageForm.get('minor_code') as FormControl;}
  get is_accepted(): FormControl { return this.MileageForm.get('is_accepted') as FormControl;}
}
