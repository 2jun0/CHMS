import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
// ngx bootstraps
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
// models
import { Project } from 'src/app/model/project';
// services
import { ProjectService } from 'src/app/services/project.service';
// utils
import { notifyError, notifyInfo } from 'src/util/util';

@Component({
  selector: 'app-submit-evaluation',
  templateUrl: './submit-evaluation.component.html',
  styleUrls: ['./submit-evaluation.component.scss']
})
export class EvaluationComponent implements OnInit {
  @ViewChild("submitEvaluationTemplate", {static: false}) mainTemplate: ElementRef;

  project: Project;

  submitForm: FormGroup;
  submitEvaluationModal: BsModalRef;

  gradeRange: number[] = [5, 4, 3, 2, 1];

  constructor(
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private projectService: ProjectService,
  ) { }

  ngOnInit() {
  }
  openModal(project: Project) {
    this.project = project;
    this.initForm();
    
    this.modalService.onHide.subscribe(null, null, (reason: string) => {
      this.submitEvaluationModal = null;
    });

    this.submitEvaluationModal = this.modalService.show(
      this.mainTemplate,
      Object.assign({}, { class: 'gray modal-lg' }, {backdrop: 'static'})
    );
  }

  initForm() {
    this.submitForm = this.formBuilder.group({
      summary_score: [null, Validators.required],
      contents_score: [null, Validators.required],
      exec_contents_score: [null, Validators.required],
      predicted_effect_score: [null, Validators.required],
      application_field_score: [null, Validators.required],
      outputs_score: [null, Validators.required],
      opensource_score: [null, Validators.required],
    })
  }

  get summary_score(): FormControl { return this.submitForm.get('summary_score') as FormControl; }
  get contents_score(): FormControl { return this.submitForm.get('contents_score') as FormControl; }
  get exec_contents_score(): FormControl { return this.submitForm.get('exec_contents_score') as FormControl; }
  get predicted_effect_score(): FormControl { return this.submitForm.get('predicted_effect_score') as FormControl; }
  get application_field_score(): FormControl { return this.submitForm.get('application_field_score') as FormControl; }
  get outputs_score(): FormControl { return this.submitForm.get('outputs_score') as FormControl; }
  get opensource_score(): FormControl { return this.submitForm.get('opensource_score') as FormControl; }

  hasEvaluationError() {
    if(this.summary_score.errors && this.summary_score.errors.required) {
       return true;
    }else if(this.contents_score.errors && this.contents_score.errors.required) {
      return true;
    }else if(this.exec_contents_score.errors && this.exec_contents_score.errors.required) {
      return true;
    }else if(this.predicted_effect_score.errors && this.predicted_effect_score.errors.required) {
      return true;
    }else if(this.application_field_score.errors && this.application_field_score.errors.required) {
      return true;
    }else if(this.outputs_score.errors && this.outputs_score.errors.required) {
      return true;
    }else if(this.opensource_score.errors && this.opensource_score.errors.required) {
      return true;
    }else{
      return false;
    }
  }

  closeSubmitEvaluationModal() {
    this.submitEvaluationModal.hide();
  }

  submitEvaluation() {
    if(this.hasEvaluationError()) {
      notifyError(new Error('평가 점수를 모두 체크해주세요!'));
      return;
    }

    if(!confirm('평가를 완료하면 수정할 수 없습니다. 정말로 제출하시겠습니까?')) return;

    let payload = this.submitForm.value;
    console.log('[payload]', payload);

    this.projectService.submitEvaluation(this.project.id, payload)
      .subscribe(
        () => {
          notifyInfo('정상적으로 제출되었습니다.');
          this.closeSubmitEvaluationModal();
        },
        ({ error }) => {
          notifyError(error);
        }
      )
  }
}
