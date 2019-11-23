import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
// ngx-bootstraps
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
// jsons
import languages from "src/assets/json/languages.json";
import projectAreaTypes from "src/assets/json/projectAreaTypes.json";
// models
import { Project, Language, Opensource } from 'src/app/model/project';
import { User } from 'src/app/model/user';
// services
import { ProjectService } from 'src/app/services/project.service';
// utils
import { range, notifyError, notifyInfo } from 'src/util/util';
import { Option, parseJsonToOptions } from 'src/util/options';


declare const Utils: any;

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.scss']
})
export class NewProjectComponent implements OnInit {
  @ViewChild("profName", {static: false}) profNameView: ElementRef;
  @ViewChild("mentoName", {static: false}) mentoNameView: ElementRef;

  // external function and json
  range = range;
  languageTypes = languages;

  newProjectForm: FormGroup;
  
  languageCount: number = 1;
  languageOptions: Option[] = parseJsonToOptions(languages);
  selectedLanguageOptions: Option[];

  projectAreaOptions: Option[] = parseJsonToOptions(projectAreaTypes);

  opensourceCount: number = 1;

  // previewImage는 이미지 data
  // predictedImgFile는 파일 정보 인것임.
  previewImage;
  predictedImgFile: File;

  today: Date = new Date();

  newProf: User;
  newMento: User;
  
  constructor(
    private router : Router,
    private formBuilder: FormBuilder,
    private project: ProjectService,
    private localeService: BsLocaleService
  ) {
    this.localeService.use('ko');
    this.selectedLanguageOptions = [];
  }

  ngOnInit() {

    this.newProjectForm = this.formBuilder.group({
      kr_title: ['', [Validators.required]],
      en_title: ['', [Validators.required]],
      member_count: [1, [Validators.required]],
      prof_num: 0,
      mento_num: 0,
      recruit_period: this.formBuilder.group({
        start_date: ['', [Validators.required]],
        end_date: ['', [Validators.required]]
      }),
      exec_period: this.formBuilder.group({
        start_date: ['', [Validators.required]],
        end_date: ['', [Validators.required]]
      }),
      project_type: ['' , [Validators.required]],
      class_contest_name: '',
      project_area_type: ['', [Validators.required]],
      keywords: '',
      intro: this.formBuilder.group({
        kr_description: ['', [Validators.required]],
        en_description: ['', [Validators.required]],
        expected_effect: ['', [Validators.required]],
        necessity: ['', [Validators.required]],
        develop_env: ['', [Validators.required]],
        functions: ['', [Validators.required]],
        languages: this.formBuilder.array([
          this.createLanguageForm()
        ]),
        opensources: this.formBuilder.array([
          this.createOpensourceForm()
        ]),
      }),
    })
  }

  updateSelectedLanguageOptions() {
    this.selectedLanguageOptions = [];
    for (var languageForm of this.languages.controls) {
      for (var option of this.languageOptions) {
        if (option.key === languageForm.get('type').value) {
          this.selectedLanguageOptions.push(option);
          break;
        }
      }
    }
  }

  onSelectLanguage(value){
    for (var option of this.languageOptions) {
      if (option.key === value) {
        this.selectedLanguageOptions.push(option);
      }
    }
  }

  setProjectType(projectType: string) {
    this.project_type.setValue(projectType);
    this.class_contest_name.setValue('');
  }
  
  //language form
  createLanguageForm() {
    return this.formBuilder.group({
      type: ['', []],
      total_line: 0
    }) 
  }
  
  // 폼에 language form 추가
  addLanguageForm() {
    let lastLanguage = this.languages.controls[this.languages.controls.length-1];
    let { type, total_line } = lastLanguage.value;
    if(type && ((total_line == 0) || total_line)) {
      this.languages.push(this.createLanguageForm());
    }else{
      notifyError(new Error('언어를 선택한 뒤, 추가 버튼을 눌러주세요!'));
    }
  }
  
  // 폼에서 language form 삭제
  delLanguageForm(languageForm) {
    this.languages.removeAt(this.languages.controls.indexOf(languageForm));
    this.updateSelectedLanguageOptions();
  }
  
  //opensource form
  createOpensourceForm() {
    return this.formBuilder.group({
      name: ['', []],
      license: ['', []],
      application_field: ['', []]
    })
  }
  
  // 폼에 opensource 추가
  addOpensourceForm() {
    let lastOpensource = this.opensources.controls[this.opensources.controls.length-1];
    let { name, license, application_field } = lastOpensource.value;
    if(name && (license && application_field)) {
      this.opensources.push(this.createOpensourceForm());
    }else{
      notifyError(new Error("오픈소스의 내용을 전부 입력한 뒤, 추가 버튼울 클릭 해주세요"));
    }
  }
  
  // 폼에서 opensource 삭제
  delOpensourceForm() {
    this.opensources.removeAt(this.opensources.controls.length);
  }

  get kr_title() { return this.newProjectForm.get('kr_title') as FormControl; }
  get en_title() { return this.newProjectForm.get('en_title') as FormControl; }
  get member_count() { return this.newProjectForm.get('member_count') as FormControl; }
  get prof_num() { return this.newProjectForm.get('prof_num') as FormControl; }
  get mento_num() { return this.newProjectForm.get('mento_num') as FormControl; }
  get recruit_period() { return this.newProjectForm.get('recruit_period') as FormGroup; }
  get exec_period() { return this.newProjectForm.get('exec_period') as FormGroup; }
  get project_type() { return this.newProjectForm.get('project_type') as FormControl; }
  get class_contest_name() { return this.newProjectForm.get('class_contest_name') as FormControl; }
  get project_area_type() { return this.newProjectForm.get('project_area_type') as FormControl; }
  get kr_description() { return this.newProjectForm.get('intro.kr_description') as FormControl; }
  get en_description() { return this.newProjectForm.get('intro.en_description') as FormControl; }
  get expected_effect() { return this.newProjectForm.get('intro.expected_effect') as FormControl; }
  get necessity() { return this.newProjectForm.get('intro.necessity') as FormControl; }
  get develop_env() { return this.newProjectForm.get('intro.develop_env') as FormControl; }
  get functions() { return this.newProjectForm.get('intro.functions') as FormControl; }
  get languages() { return this.newProjectForm.get('intro.languages') as FormArray; }
  get opensources() { return this.newProjectForm.get('intro.opensources') as FormArray; }
  get keywords() { return this.newProjectForm.get('keywords') as FormControl; }
  
  addProject() {
    let payload = this.newProjectForm.value;

    payload.keywords = this.keywords.value.split(',');

    if(payload.intro) {
      // 마지막 language 입력 안하면 삭제
      if(payload.intro.languages.length > 0 && !payload.intro.languages[payload.intro.languages.length-1]) {
        payload.intro.languages.pop();
      }
      
      // 마지막 오픈소스 전부 입력 안하면 삭제
      if(payload.intro.opensources.length > 0) {
        var lastOpensource = payload.intro.opensources[payload.intro.opensources.length-1];
        if(!lastOpensource.name && !lastOpensource.license && !lastOpensource.application_field) {
          payload.intro.opensources.pop();
        }
      }
    }
    
    console.log('[payload]', this.newProjectForm.value, { img_predicted : this.predictedImgFile});
    
    this.project.addProject(payload, this.predictedImgFile)
      .subscribe(
        (project) => { 
          notifyInfo('성공적으로 생성되었습니다.');
          this.router.navigate(['project/detail', project.id]);
        },
        ({ error }) => {
          console.log(error.message);
          notifyError(new Error(error.message));
      })
  }

  onPredictedImgChange(files: FileList) {
    if (files && files.length > 0) {
      // for preview
      const file = files[0];
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = () => {
        this.previewImage = reader.result;
      };

      this.predictedImgFile = file;
    }
  }

  setProf(user: User) {
    this.newProf = user;
    this.prof_num.setValue(user.user_num);
  }

  setMento(user: User) {
    this.newMento = user;
    this.mento_num.setValue(user.user_num);
  }

  removeProfNum() {
    this.prof_num.setValue(0);
    this.newProf = null;
  }  

  removeMentoNum() {
    this.mento_num.setValue(0);
    this.newMento = null;
  }
}