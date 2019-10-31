import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
// ngx bootstraps
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
// services
import { ProjectService } from 'src/app/services/project.service';
// models
import { Project } from 'src/app/model/project';
// utils
import { notifyError, refresh } from 'src/util/util';

@Component({
  selector: 'app-submit-outputs',
  templateUrl: './submit-outputs.component.html',
  styleUrls: ['./submit-outputs.component.scss']
})
export class SubmitOutputsComponent implements OnInit {
  @ViewChild("submitOutputsTemplate", {static: false}) mainTemplate: ElementRef;

  project: Project;

  submitForm: FormGroup;
  submitModal: BsModalRef;

  pptFile: File;
  zipFile: File;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private projectService: ProjectService
  ) {

  }

  ngOnInit() {

  }

  openModal(project: Project) {
    this.project = project;

    // check members (역할과 기여도가 입력되어야만 산출물을 제출할 수 있음)))
    this.projectService.getMembers(project.id)
      .subscribe(
        (members) => {
          for(var member of members) {
            // 역할이나 기여도가 입력이 안되어 있는 경우,
            if(!member.role || (member.contribution_rate!=0 && !member.contribution_rate)) {
              notifyError(new Error('모든 팀원의 역할과 기여도가 입력되어야 산출물 제출을 수행할 수 있습니다.'));
              this.router.navigate(['project/member-role-list', project.id]);
              return;
            }
          }

          this.submitModal = this.modalService.show(
            this.mainTemplate,
            Object.assign({}, { class: 'gray modal-lg' }, {backdrop: 'static'})
          );
        },
        ({error}) => {
          notifyError(error);
        }
      )

    this.initForm();

    this.modalService.onHide.subscribe(null, null, (reason: string) => {
      this.submitModal = null;
    });
  }

  initForm() {
    this.submitForm = this.formBuilder.group({
      github_url: '',
      url_ucc: ''
    });
  }

  closeSubmitOutputsModal() {
    this.submitModal.hide();
  }

  submitOutputs() {
    if(!confirm('정말로 제출하시겠습니까?')) return;

    let payload = this.submitForm.value;
    console.log('[payload]', payload);

    this.projectService.submitOutputs(this.project.id, payload, this.pptFile, this.zipFile)
      .subscribe(
        () => {
          this.closeSubmitOutputsModal();
          refresh();
        },
        ( {error} ) => {
          notifyError(error);
        }
      )
  }

  private readFileAsUrl(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    return file;
  }

  onPptFileChange(files: FileList) {
    if(files && files.length > 0) {
      const file = files[0];
      this.readFileAsUrl(file);
      this.pptFile = file;
    }
  }

  onZipFileChange(files: FileList) {
    if(files && files.length > 0) {
      const file = files[0];
      this.readFileAsUrl(file);
      this.zipFile = file;
    }
  }
}
