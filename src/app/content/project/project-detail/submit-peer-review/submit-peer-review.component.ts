import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
// ngx bootstraps
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
// models
import { Project } from 'src/app/model/project';
import { Member } from 'src/app/model/member';
import { PeerReview } from 'src/app/model/peerReview';
// services
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
// utils
import { notifyError, notifyInfo, refresh } from 'src/util/util';

@Component({
  selector: 'app-submit-peer-review',
  templateUrl: './submit-peer-review.component.html',
  styleUrls: ['./submit-peer-review.component.scss']
})
export class SubmitPeerReviewComponent implements OnInit {
  @ViewChild("peerReviewTemplate", { static: false }) mainTemplate: ElementRef;

  project: Project;
  members: Member[];
  memberIdx: number;

  peerReviews: PeerReview[];

  peerReviewForm: FormGroup;
  peerReviewModal: BsModalRef;

  gradeRange: number[] = [5, 4, 3, 2, 1];
  isMyMember: boolean;
  myUserNum: number;

  payloads: PeerReview[];

  constructor(
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private projectService: ProjectService,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.isMyMember = false;
    this.payloads = [];
    this.myUserNum = this.authService.getUserNum();
  }

  ngOnInit() {
  }

  openModal(project: Project) {
    this.project = project;

    this.projectService.getMembers(project.id)
      .subscribe(
        (members) => {
          this.members = members;
          this.setMember(0);

          this.peerReviewModal = this.modalService.show(
            this.mainTemplate,
            Object.assign({}, { class: 'gray modal-xlg' }, { backdrop: 'static' })
          )

          for (var i = 0; i < members.length; i++) {
            let member = members[i];

            // 자신의 정보인지 확인
            if(member.user_num == this.myUserNum) {
              // 자신의 맴버 정보가 상단으로 오게 한다.
              members.splice(0, 0, member);
              members.splice(i+1, 1);
              this.isMyMember = true;
            }

            this.userService.getUser(member.user_num)
              .subscribe(
                (user) => {
                  member['user'] = user;
                },
                ({ error }) => {
                  notifyError(error);
                }
              )
          }

        },
        ({ error }) => {
          notifyError(error);
        }
      )
    this.initForm();

    this.modalService.onHide.subscribe(null, null, (reason: string) => {
      this.peerReviewModal = null;
    })
  }

  initForm() {
    this.peerReviewForm = this.formBuilder.group({
      target_user_num: null,
      position: this.formBuilder.group({
        p1: [null, [Validators.required]],
        p2: [null, [Validators.required]],
        p3: [null, [Validators.required]],
        p4: [null, [Validators.required]],
        p5: [null, [Validators.required]],
        p6: [null, [Validators.required]],
        p7: [null, [Validators.required]],
        p8: [null, [Validators.required]],
        p9: [null, [Validators.required]],
        p10: [null, [Validators.required]]
      })
    })
  }

  get target_user_num(): FormControl { return this.peerReviewForm.get('target_user_num') as FormControl; }
  get position(): FormGroup { return this.peerReviewForm.get('position') as FormGroup; }
  get p1(): FormControl { return this.peerReviewForm.get('position.p1') as FormControl; }
  get p2(): FormControl { return this.peerReviewForm.get('position.p2') as FormControl; }
  get p3(): FormControl { return this.peerReviewForm.get('position.p3') as FormControl; }
  get p4(): FormControl { return this.peerReviewForm.get('position.p4') as FormControl; }
  get p5(): FormControl { return this.peerReviewForm.get('position.p5') as FormControl; }
  get p6(): FormControl { return this.peerReviewForm.get('position.p6') as FormControl; }
  get p7(): FormControl { return this.peerReviewForm.get('position.p7') as FormControl; }
  get p8(): FormControl { return this.peerReviewForm.get('position.p8') as FormControl; }
  get p9(): FormControl { return this.peerReviewForm.get('position.p9') as FormControl; }
  get p10(): FormControl { return this.peerReviewForm.get('position.p10') as FormControl; }
  
  hasPositionError() {
    if(this.p1.errors && this.p1.errors.required) {
       return true;
    }else if(this.p2.errors && this.p2.errors.required) {
      return true;
    }else if(this.p3.errors && this.p3.errors.required) {
      return true;
    }else if(this.p4.errors && this.p4.errors.required) {
      return true;
    }else if(this.p5.errors && this.p5.errors.required) {
      return true;
    }else if(this.p6.errors && this.p6.errors.required) {
      return true;
    }else if(this.p7.errors && this.p7.errors.required) {
      return true;
    }else if(this.p8.errors && this.p8.errors.required) {
      return true;
    }else if(this.p9.errors && this.p9.errors.required) {
      return true;
    }else if(this.p10.errors && this.p10.errors.required) {
      return true;
    }else{
      return false;
    }
  }

  closePeerReviewModal() {
    this.peerReviewModal.hide();
  }

  // set target member to be reviewed
  setMember(idx: number) {
    this.memberIdx = idx;
    if(this.members[this.memberIdx].user_num == this.myUserNum) {
      this.isMyMember = true;
    }else{
      this.isMyMember = false;
    }

    // if payload(peer review data) exists => turn form value to it
    if(this.payloads[this.memberIdx]) {
      this.peerReviewForm.setValue(this.payloads[this.memberIdx]);
    // if payload(peer review data) doesn't exist => new peer review form
    }else{
      this.peerReviewForm.reset();
    }
  }

  nextMember() {
    if(this.hasPositionError()) {
      notifyError(new Error('평가를 완료한뒤, 다음 버튼을 누르세요'));
      return;
    }
    this.payloads[this.memberIdx] = this.peerReviewForm.value;
    this.payloads[this.memberIdx].target_user_num = this.members[this.memberIdx].user_num;
    this.setMember(this.memberIdx+1);
  }

  preMember() {
    this.payloads[this.memberIdx] = this.peerReviewForm.value;
    this.payloads[this.memberIdx].target_user_num = this.members[this.memberIdx].user_num;
    this.setMember(this.memberIdx-1);
  }

  submitPeerReview() {
    if(this.hasPositionError()) {
      notifyError(new Error('평가를 완료한뒤, 다음 버튼을 누르세요'));
      return;
    }

    if(!confirm('정말로 제출하시겠습니까?')) return;

    this.payloads[this.memberIdx] = this.peerReviewForm.value;
    this.payloads[this.memberIdx].target_user_num = this.members[this.memberIdx].user_num;
    console.log('[payloads]', this.payloads);

    this.projectService.submitPeerReviews(this.payloads, this.project.id)
      .subscribe(
        () => {
          notifyInfo("제출이 성공적으로 완료되었습니다.");
          this.closePeerReviewModal();
          refresh();
        },
        ({ error }) => {
          notifyError(error);
        }
      )
  }
}