import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
// jsons
import languages from 'src/assets/json/languages.json';
// models
import { Member } from 'src/app/model/member';
import { Language, Project } from 'src/app/model/project';
// services
import { AuthService } from 'src/app/services/auth.service';
import { ProjectService } from 'src/app/services/project.service';
// utils
import { notifyError, formatDate } from 'src/util/util';
import { Option, parseJsonToOptions } from 'src/util/options';

@Component({
  selector: 'app-member-role',
  templateUrl: './member-role.component.html',
  styleUrls: ['./member-role.component.scss']
})
export class MemberRoleComponent implements OnInit {
  @Input('member') member: Member;
  @Input('isLeader') isLeader: boolean;
  @Input('project') project: Project;

  // external functions and json
  formatDate = formatDate;
  languageTypes = languages;
  
  languageOptions: Option[] = parseJsonToOptions(languages);
  
  selectedLanguageOptions: Option[];
  
  updateForm: FormGroup;

  isUpdateMode: boolean;
  isMine: boolean;
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private projectService: ProjectService
  ) { 
    this.selectedLanguageOptions = [];
    this.isUpdateMode = false;
    this.isMine = false;
  }

  ngOnInit() {
    let myUserNum = this.authService.getUserNum();

    if(myUserNum == this.member.user_num) {
      this.isMine = true;
    }

    this.initUpdateForm();
  }

  initUpdateForm() {
    this.updateForm = this.formBuilder.group({
      role: this.member.role,
      contribution_rate: this.member.contribution_rate,
      languages: this.formBuilder.array([

      ]),
      github_url: this.member.github_url,
      total_peer_review_score: this.member.total_peer_review_score,
    });

    for(var language of this.member.languages) {
      this.languages.push(this.createLanguageForm(language))
    }
  }

  // create language form
  createLanguageForm(language?: Language) {
    if(language){
      return this.formBuilder.group({
        type: language.type,
        total_line: language.total_line
      })
    }else{
      return this.formBuilder.group({
        type: '',
        total_line: 0
      })
    }
  }

  // delete language form
  delLanguageForm(languageForm) {
    this.languages.removeAt(this.languages.controls.indexOf(languageForm));
  }

  // add language form
  addLanguageForm() {
    let lastLanguage = this.languages.controls[this.languages.controls.length-1];
    // language 입력을 아예 안한경우
    if(!lastLanguage) {
      this.languages.push(this.createLanguageForm(null));
      return;
    }

    let { type, total_line } = lastLanguage.value;

    if(type && (total_line == 0 || total_line)){
      this.languages.push(this.createLanguageForm(null));
    }else{
      notifyError(new Error("사용언어의 내용을 전부 입력한 뒤, 추가를 해주세요"));
    }
  }

  get role(): FormControl { return this.updateForm.get('role') as FormControl; }
  get contribution_rate(): FormControl { return this.updateForm.get('contribution_rate') as FormControl; }
  get languages(): FormArray { return this.updateForm.get('languages') as FormArray; }
  get github_url(): FormControl { return this.updateForm.get('github_url') as FormControl; }
  get total_peer_review_score(): FormControl { return this.updateForm.get('total_peer_review_score') as FormControl; }

  updateSelectedLanguageOptions() {
    this.selectedLanguageOptions = [];
    for (var languageForm of this.languages.controls) {
      for (var option of this.languageOptions) {
        if (option.value === languageForm.get('type').value) {
          this.selectedLanguageOptions.push(option);
          break;
        }
      }
    }
  }

  onSelectLanguage(){
    this.updateSelectedLanguageOptions();
  }

  activateUpdateMode() {
    this.isUpdateMode = true;
  }

  deActivateUpdateMode() {
    this.initUpdateForm();
    this.isUpdateMode = false;
  }

  updateMember() {
    let payload = this.updateForm.value;
    console.log('[payload]', payload)

    if(payload.contribution_rate > 1 || payload.contribution_rate < 0) {
      notifyError(new Error('기여도는 0과 1사이의 값이어야 합니다!'));
      return;
    }

    this.projectService.updateMember(this.member.id, payload)
      .subscribe(
        () => {
          for(let key in payload) {
            this.member[key] = payload[key];
          }
          this.deActivateUpdateMode();
        },
        ({ error }) => {
          notifyError(new Error(error.message));
        }
      )
  }
}
