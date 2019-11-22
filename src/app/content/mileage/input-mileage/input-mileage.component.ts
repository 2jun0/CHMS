import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router'; 
import { Router } from '@angular/router';
// ngx-bootstraps
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
// jsons
import majorMileageCode from "src/assets/json/majorMileageCode.json";
import minorMileageCode from "src/assets/json/minorMileageCode.json";
import mileageCode from "src/assets/json/mileageCode.json";
// models
import { StudentUser } from "src/app/model/user";
import { MileageCode, Mileage } from 'src/app/model/mileage';
// utils
import { notifyError, notifyInfo } from 'src/util/util';
import { Option, parseJsonToOptions } from 'src/util/options';
// services
import { MileageService } from 'src/app/services/mileage.service';
import { UserService } from 'src/app/services/user.service';
import { getMajorMileagesCodes,getMinorMileagesCodes, getMileagesCodes } from 'src/util/codes';
@Component({
  selector: 'app-input-mileage',
  templateUrl: './input-mileage.component.html',
  styleUrls: ['./input-mileage.component.scss']
})
export class InputMileageComponent implements OnInit {

  // jsons for html
  majorMileageCode = majorMileageCode;

  newMileageForm: FormGroup;

  majorMileageCodeOptions: Option[];
  minorMileageCodeOptions: Option[];
  mileageCodeOptions: Option[];

  today : Date =  new Date();

  major_code: string;
  majorDescription : string;
  accept_method: string;
  remark: string;
  tmp: string;

  constructor(
    private router : Router,
    private route: ActivatedRoute,
    private mileage: MileageService,
    private localeService: BsLocaleService,
    private formBuilder: FormBuilder,
    private userService: UserService
    ) { 
      this.localeService.use('ko');
    } 

    ngOnInit() {
      this.newMileageForm = this.formBuilder.group({
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

      //입력메뉴 선택시 토글 ON상태 유지
      this.route.params.subscribe(val => {
        this.major_code = this.route.snapshot.paramMap.get('type');

        this.loadMileageCodes();
        
      });


      this.mileage.loadMileageCodes.subscribe(
        () => {
          this.loadMileageCodes();
        },
        ({ error }) => {
          notifyError(error);
        }
      )

      this.loadMileageCodes();
    }

    loadMileageCodes() {
      this.majorDescription = getMajorMileagesCodes(this.major_code);
      this.minorMileageCodeOptions = parseJsonToOptions(getMinorMileagesCodes(this.major_code), undefined, (json, key)=>{
        return json[key].description;
      });
      this.clearMileage();
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

      this.tmp = mileageCode[value]['remark'];
      console.log();
      this.remark = this.tmp.split("ent").join("\n");
    }
    
    //메뉴 선택시 이전 값들 제거
    clearMileage(){
      this.minor_code.setValue(null);
      this.code_preview.setValue(null);
      this.score.setValue(null);
    }
    
    /*
      새로운 마일리지를 node.js에 보낼 때, 포함해야 하는 것들
      user_num : 유저 번호
      user_name : 유저 이름
      department : 유저 학과
      year_of_study : 유저 학년
      code
      act_date
      detail
    */

    //새로운 마일리지 입력
    addMileage() {
      let payload = this.newMileageForm.value;
      console.log('[payload]', payload);

      // 유저 서비스에서 내 정보 가져오기
      let user = this.userService.getMyUser() as StudentUser;

      // 새 마일리지 객체에 user_num, user_name, department, year_of_study값 추가
      let newMileage = {
        department : user.department_type,
        user_num : user.user_num,
        user_name : user.name,
        year_of_study : user.year_of_study,
        code: this.code.value,
        act_date: this.act_date.value,
        detail: this.detail.value,
      };

      this.mileage.addMileage(newMileage as Mileage)
      .subscribe(
        () => { 
          notifyInfo('성공적으로 생성되었습니다.');
          this.router.navigate(['/mileage/my-mileage', 1]);
        },
        ({ error }) => {
          notifyError(error);
        })
    }

    get act_date() { return this.newMileageForm.get('act_date');}
    get detail() { return this.newMileageForm.get('detail');}
    get minor_code() { return this.newMileageForm.get('minor_code');}
    get code() { return this.newMileageForm.get('code');}
    get code_preview() { return this.newMileageForm.get('code_preview');}
    get score() { return this.newMileageForm.get('score');}
}