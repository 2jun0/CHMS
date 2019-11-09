import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';
// ngxes
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
// jsons
import projectStates from 'src/assets/json/projectStates.json';
import projectTypes from 'src/assets/json/projectTypes.json';
import projectAreaTypes from 'src/assets/json/projectAreaTypes.json';
import languages from 'src/assets/json/languages.json';
// models
import { Project } from 'src/app/model/project';
import { RequestParticipation } from 'src/app/model/requestParticipation';
import { User } from 'src/app/model/user';
import { Member } from 'src/app/model/member';
// services
import { AuthService } from 'src/app/services/auth.service';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
// others
import { formatDate, notifyError, refresh, notifyInfo } from 'src/util/util';
import { Option, parseJsonToOptions } from 'src/util/options';
import { PrintService } from 'src/app/services/print.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
})
export class ProjectDetailComponent implements OnInit {
  @ViewChild("requestPartTemplate", { static: false }) requestPartTemplate: ElementRef;
  @ViewChild("profName", {static: false}) profNameView: ElementRef;
  @ViewChild("mentoName", {static: false}) mentoNameView: ElementRef;

  appUrl = environment.apiUrl;

  // external functions and json
  formatDate = formatDate;
  projectTypes = projectTypes;
  projectAreaTypes = projectAreaTypes;
  projectStates = projectStates;
  languageTypes = languages;

  projectTypeOptions: Array<Option> = parseJsonToOptions(projectTypes);
  projectAreaOptions: Array<Option> = parseJsonToOptions(projectAreaTypes);
  languageOptions: Array<Option> = parseJsonToOptions(languages);

  isLoad: boolean;
  isMyProject: boolean;     // 프로젝트 팀 맴버인지 여부
  myUserType: string;
  myUserNum: number;
  isManageProject: boolean; // 지도 교수나 멘토의 지도 프로젝트 인지 여부

  predict_img_src: string;

  projectId: string;
  project: Project;
  myMember: Member;

  // update 
  isUpdateMode: boolean;
  updateForm: FormGroup;
  updateProf: User;
  updateMento: User;
  previewUpdatePredictedImg;
  updatePredictedImgFile: File;
  updateDocPptFile: File;
  updateDocZipFile: File;

  // participation
  requestPartModal: BsModalRef;
  requestPartForm: FormGroup;

  requestParts: RequestParticipation[];
  myRequestPart: RequestParticipation;

  selectedLanguageOptions: Option[];

  today: Date;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private authService: AuthService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private localeService: BsLocaleService,
    private printService: PrintService,
  ) {
    this.isLoad = false;
    this.isUpdateMode = false;
    this.selectedLanguageOptions = [];
    this.today = new Date();
    this.localeService.use('ko');
    this.isManageProject = false;
  }

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id');

    // 로그인 한 경우만
    if(this.authService.isAuthenticated()){ 
      // check admin
      this.myUserType = this.authService.getUserType();
      this.myUserNum = this.authService.getUserNum();

      if(this.myUserType == "student") {
        // load myMember
        this.projectService.getMember(this.projectId, this.authService.getUserNum())
        .subscribe(
          (member) => {
            this.myMember = member;
          },
          ({ error }) => {
            notifyError(error);
          }
        )
      }
    // 로그인 안한 경우
    }else{
      // 외부 사용자
      this.myUserType = 'external';
      this.myUserNum = null;
    }

    // load project
    this.loadProject(this.projectId);
  }

  loadProject(projectId) {
    this.projectService.getProject(projectId)
      .subscribe(
        (project) => {
          this.project = project;
          this.initUpdateForm();
          
          // Get project mento
          if(project.mento_num){
            this.userService.getUser(project.mento_num)
              .subscribe((user) => {
                this.project['mento'] = user;

                // 멘토가 본인인 경우, 지도 프로젝트 true
                if(this.myUserType != 'external' && user.user_num == this.myUserNum){
                  this.isManageProject = true;
                }
              },
              ({ error }) => {
                notifyError(error);
              })
          }

          // Get project professor
          if(project.prof_num){
            this.userService.getUser(project.prof_num)
              .subscribe((user) => {
                this.project['prof'] = user;

                // 지도 교수가 본인인 경우, 지도 프로젝트 true
                if(this.myUserType != 'external' && user.user_num == this.myUserNum){
                  this.isManageProject = true;
                }
              },
              ({ error }) => {
                notifyError(error);
              })
          }

          if(this.myUserType == "student") {

            // Get project leader
            this.projectService.getProjectLeader(project.id)
              .subscribe(
                (leader) => {
                  project['leader'] = leader;
                  
                  // ======================= My project ===========================
                  if (leader.user_num == this.myUserNum) { // 리더의 사용자 번호가 본인과 같다면
                    this.isMyProject = true;
                    // Get 참가요청s
                    this.projectService.getRequestParts(project.id)
                      .subscribe(
                        (requestParts) => {
                          this.requestParts = requestParts;

                          for(var i = 0; i < requestParts.length; i++) {
                            let requestPart = requestParts[i];
                            this.userService.getUser(requestPart.user_num)
                              .subscribe(user => {
                                requestPart['user'] = user;
                              },
                              ({ error }) => {
                                notifyError(error);
                              }
                            );
                          }

                          // load finish
                          this.isLoad = true;
                        },
                        ({ error }) => {
                          notifyError(error);
                        }
                      )
                  // ======================= Others project =======================
                  } else {
                    this.isMyProject = false;

                    // Get request part
                    this.projectService.getMyRequestPart(project.id)
                    .subscribe(
                      (requestPart) => {

                        if (requestPart) { // My requestPart exists
                          this.myRequestPart = requestPart;
                        } else { // My requestPart doesn't exist
                          this.myRequestPart = null;
                        }

                        // load finish
                        this.isLoad = true;
                      },
                      ({ error }) => {
                        notifyError(error);
                      }
                    );

                    // Init request part form
                    this.requestPartForm = this.formBuilder.group({
                      reason: ['참여하고 싶습니다.', Validators.required],
                    });
                  }
                },
                ({ error }) => {
                  notifyError(error);
                })
          }else{
            this.isLoad = true;
          }
    },
    ({ error }) => {
      notifyError(error);
    })
  }

  // ===============================================
  // Form functions
  // ===============================================

  // Init update reative form
  initUpdateForm() {
    this.updateForm = this.formBuilder.group({
      is_public: this.project.is_public,
      kr_title: this.project.kr_title,
      en_title: this.project.en_title,
      member_count: this.project.member_count,
      // to array for ngx-bootstrap lib
      recruit_period: this.formBuilder.group({
        start_date: [this.project.recruit_period.start_date, [Validators.required]],
        end_date: [this.project.recruit_period.end_date, [Validators.required]]
      }),
      exec_period: this.formBuilder.group({
        start_date: [this.project.exec_period.start_date, [Validators.required]],
        end_date: [this.project.exec_period.end_date, [Validators.required]]
      }),
      prof_num: this.project.prof_num,
      mento_num: this.project.mento_num,
      project_type: this.project.project_type,
      class_contest_name: this.project.class_contest_name,
      project_area_type: this.project.project_area_type,
      keywords: this.project.keywords.join(', '),
      intro: this.formBuilder.group({
        kr_description: this.project.intro.kr_description,
        en_description: this.project.intro.en_description,
        expected_effect: this.project.intro.expected_effect,
        necessity: this.project.intro.necessity,
        develop_env: this.project.intro.develop_env,
        functions: this.project.intro.functions,
        languages: this.formBuilder.array([]),
        opensources: this.formBuilder.array([]),
      }),
      outputs: ((this.project.outputs) ? this.formBuilder.group({
        github_url: this.project.outputs.github_url,
        doc_ppt_file: this.project.outputs.doc_ppt_file,
        doc_zip_file: this.project.outputs.doc_zip_file,
        url_ucc: this.project.outputs.url_ucc
      }) : null),
    });

    // add languages forms
    for(var language of this.project.intro.languages) {
      this.languages.push(this.createLanguageForm(language));
    }
    this.updateSelectedLanguageOptions();
    
    // add opensource forms
    for(var opensource of this.project.intro.opensources) {
      this.opensources.push(this.createOpensourceForm(opensource));
    }
  }

  //opensource form
  createOpensourceForm(opensource) {
    return this.formBuilder.group({
      name: [(opensource)?opensource.name:'', []],
      license: [(opensource)?opensource.license:'', []],
      application_field: [(opensource)?opensource.application_field:'', []]
    })
  }

  addOpensourceForm() {
    let lastOpensource = this.opensources.controls[this.opensources.controls.length-1];
    let { name, license, application_field } = lastOpensource.value;
    if(name && (license && application_field)) {
      this.opensources.push(this.createOpensourceForm(null));
    }else{
      notifyError(new Error("오픈소스의 내용을 전부 입력한 뒤, 추가를 해주세요"));
    }
  }

  delOpensourceForm(opensourceForm) {
    this.opensources.removeAt(this.opensources.controls.indexOf(opensourceForm));
  }

  // language form
  createLanguageForm(language) {
    return this.formBuilder.group({
      type: [(language)?language.type:'', []],
      total_line: [(language)?language.total_line:0, []]
    })
  }

  addLanguageForm() {
    let lastLanguage = this.languages.controls[this.languages.controls.length-1];
    // language 입력을 아예 안한경우
    if(!lastLanguage) {
      this.languages.push(this.createLanguageForm(null));
      return;
    }

    let { type, total_line } = lastLanguage.value;
    if(type && ((total_line == 0) || total_line)) {
      this.languages.push(this.createLanguageForm(null));
    }else{
      notifyError(new Error("사용언어의 내용을 전부 입력한 뒤, 추가를 해주세요"));
    }
  }

  delLanguageForm(languageForm) {
    this.languages.removeAt(this.languages.controls.indexOf(languageForm));
    this.updateSelectedLanguageOptions();
  }

  get is_public() : FormControl { return this.updateForm.get('is_public') as FormControl; }
  get kr_title() : FormControl { return this.updateForm.get('kr_title') as FormControl; }
  get en_title() : FormControl { return this.updateForm.get('en_title') as FormControl; }
  get member_count() : FormControl { return this.updateForm.get('member_count') as FormControl; }
  get recruit_period() : FormControl { return this.updateForm.get('recruit_period') as FormControl; }
  get exec_period() : FormControl { return this.updateForm.get('exec_period') as FormControl; }
  get project_type() : FormControl { return this.updateForm.get('project_type') as FormControl; }
  get class_contest_name() : FormControl { return this.updateForm.get('class_contest_name') as FormControl; }
  get project_area_type() : FormControl { return this.updateForm.get('project_area_type') as FormControl; }
  get prof_num() : FormControl { return this.updateForm.get('prof_num') as FormControl; }
  get mento_num() : FormControl { return this.updateForm.get('mento_num') as FormControl; }  
  get intro() : FormGroup { return this.updateForm.get('intro') as FormGroup; }
  get kr_description() : FormControl { return this.updateForm.get('intro.kr_description') as FormControl; }
  get en_description() : FormControl { return this.updateForm.get('intro.en_description') as FormControl; }
  get expected_effect() : FormControl { return this.updateForm.get('intro.expected_effect') as FormControl; }
  get necessity() : FormControl { return this.updateForm.get('intro.necessity') as FormControl; }
  get develop_env() : FormControl { return this.updateForm.get('intro.develop_env') as FormControl; }
  get functions() : FormControl { return this.updateForm.get('intro.functions') as FormControl; }
  get languages() : FormArray { return this.updateForm.get('intro.languages') as FormArray; }
  get opensources() : FormArray { return this.updateForm.get('intro.opensources') as FormArray; }
  get keywords() : FormControl { return this.updateForm.get('keywords') as FormControl; }
  get github_url() : FormControl { return this.updateForm.get('outputs.github_url') as FormControl; }
  get doc_ppt_file() : FormControl { return this.updateForm.get('outputs.doc_ppt_file') as FormControl; }
  get doc_zip_file() : FormControl { return this.updateForm.get('outputs.doc_zip_file') as FormControl; }
  get url_ucc() : FormControl { return this.updateForm.get('outputs.url_ucc') as FormControl; }

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

  onSelectLanguage(){
    this.updateSelectedLanguageOptions();
  }

  onSelectProjectType(){
    this.class_contest_name.setValue('');
  }

  onPredictedImgChange(files: FileList) {
    if (files && files.length > 0) {
      // for preview
      const file = files[0];
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = () => {
        this.previewUpdatePredictedImg = reader.result;
      };

      this.updatePredictedImgFile = file;
    }
  }

  onDocPptFileChange(files: FileList) {
    if (files && files.length > 0) {
      this.updateDocPptFile = files[0];
    }
  }

  onDocZipFileChange(files: FileList) {
    if (files && files.length > 0) {
      this.updateDocZipFile = files[0];
    }
  }

  setProf(user: User) {
    this.updateProf = user;
    this.prof_num.setValue(user.user_num);
  }

  setMento(user: User) {
    this.updateMento = user;
    this.mento_num.setValue(user.user_num);
  }

  removeProfNum() {
    this.prof_num.setValue(0);
    this.updateProf = null;
  }  

  removeMentoNum() {
    this.mento_num.setValue(0);
    this.updateMento = null;
  }

  activateUpdateMode() {
    this.isUpdateMode = true;
    this.updateProf = this.project['prof'];
    this.updateMento = this.project['mento'];
  }

  deActivateUpdateMode() {
    this.isUpdateMode = false;
    this.updateProf = null;
    this.updateMento = null;
    this.updatePredictedImgFile = null;
    this.previewUpdatePredictedImg = null;

    this.initUpdateForm();
  }

  updateProject() {
    let payload = this.updateForm.value;
    payload.id = this.project.id;

    payload.keywords = this.keywords.value.split(',');

    delete payload.is_public;

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

    console.log('[payload]', payload);

    this.projectService.updateProject(this.project.id, payload, this.updatePredictedImgFile)
      .subscribe(
        () => {
          notifyInfo('정상적으로 수정되었습니다.')
          this.loadProject(this.projectId);
          this.isUpdateMode = false;
        },
        ({ error }) => {
          notifyError(error);
        }
      );
  }

  deleteProject() {
    if(!confirm('정말 삭제하시겠습니까?')) return;

    this.projectService.deleteProject(this.project.id)
      .subscribe(
        () => {
          notifyInfo('정상적으로 삭제되었습니다.');
          this.router.navigate(['project/my-list']);
        },
        ({ error }) => {
          notifyError(error);
        }
      )
  }

  onChangeIsPublic(value) {
    this.projectService.updateIsPublic(this.projectId, value).subscribe(
      () => {
        this.loadProject(this.projectId);
      },
      ({ error }) => {
        notifyError(error);
      }
    );
  }

  // ===============================================
  // RequestPart
  // ===============================================
  deleteRequestPart(requestPart: RequestParticipation) {
    this.projectService.deleteRequestPart(requestPart.id)
      .subscribe(
        () => {
          notifyInfo('정상적으로 거절 되었습니다.');
          // delete at the array
          let index = this.requestParts.indexOf(requestPart);
          if (index > -1) {
            this.requestParts.splice(index, 1);
         }
        },
        ({ error }) => {
          notifyError(error);
          this.closeRequestPartModal();
        }
      )
  }

  acceptRequestPart(requestPart: RequestParticipation) {
    this.projectService.acceptRequestPart(requestPart.id)
      .subscribe(
        () => {
          notifyInfo('정상적으로 참여되었습니다.');
          // update is_accepted value in request participation
          requestPart.is_accecpted = true;
        },
        ({ error }) => {
          notifyError(error);
          this.closeRequestPartModal();
        }
      )
  }

  openRequestPartModal() {
    this.requestPartModal = this.modalService.show(
      this.requestPartTemplate
    );
  }

  closeRequestPartModal() {
    this.requestPartModal.hide();
    this.requestPartModal = null;
  }

  requestPart() {
    console.log('[payLoad]', this.requestPartForm.value);

    let requestPart: RequestParticipation = {
      project_id: this.project.id,
      user_num: this.authService.getUserNum(),
      reason: this.request_part_reason.value,
    };

    this.projectService.requestPart(requestPart)
      .subscribe(
        () => {
          notifyInfo('정상적으로 신청하였습니다.');
          this.myRequestPart = requestPart; 
          this.closeRequestPartModal();
        },
        ({ error }) => {
          notifyError(error);
          this.closeRequestPartModal();
        }
      )
  }

  get request_part_reason() { return this.requestPartForm.get('reason'); }

  print() {
    this.printService.printDocument('project', this.projectId);
  }
}
