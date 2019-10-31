import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
// ngx bootstraps
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
// models
import { Project } from 'src/app/model/project';
import { Member } from 'src/app/model/member';
import { PeerReview, Position } from 'src/app/model/peerReview';
// services
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
// utils
import { notifyError } from 'src/util/util';

@Component({
  selector: 'app-show-peer-review',
  templateUrl: './show-peer-review.component.html',
  styleUrls: ['./show-peer-review.component.scss']
})
export class ShowPeerReviewComponent implements OnInit {
  @ViewChild("peerReviewTemplate", { static: false }) mainTemplate: ElementRef;

  project: Project;
  members: Member[];
  memberIdx: number;
  
  peerReviews: PeerReview[];

  averagePosition: Position;
  selfPosition: Position;
  averageScore: number;
  averageSelfScore: number;

  peerReviewModal: BsModalRef;

  constructor(
    private modalService: BsModalService,
    private projectService: ProjectService,
    private userService: UserService
  ) { 
    this.averagePosition = {p1: 0,p2: 0,p3: 0,p4: 0,p5: 0,p6: 0,p7: 0,p8: 0,p9: 0,p10: 0}
    this.selfPosition = {p1: 0,p2: 0,p3: 0,p4: 0,p5: 0,p6: 0,p7: 0,p8: 0,p9: 0,p10: 0}
  }

  ngOnInit() {
  }

  openModal(project: Project) {
    this.project = project;

    this.projectService.getMembers(project.id)
      .subscribe(
        (members) => {
          this.members = members;
          this.memberIdx = 0;
          this.loadPeerReviews();

          this.peerReviewModal = this.modalService.show(
            this.mainTemplate,
            Object.assign({}, { class: 'gray modal-xlg' }, { backdrop: 'static' })
          )

          for (var i = 0; i < members.length; i++) {
            let member = members[i];

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

    this.modalService.onHide.subscribe(null, null, (reason: string) => {
      this.peerReviewModal = null;
    })
  }

  closePeerReviewModal() {
    this.peerReviewModal.hide();
  }

  loadPeerReviews() {
    this.projectService.getPeerReviewsByTargetUserNum(this.project.id, this.members[this.memberIdx].user_num)
      .subscribe(
        (peerReviews) => {
          this.peerReviews = peerReviews;
          let sumScore = 0;
          let sumPosition: Position = {p1: 0,p2: 0,p3: 0,p4: 0,p5: 0,p6: 0,p7: 0,p8: 0,p9: 0,p10: 0}

          for(var peerReview of peerReviews) {
            if(peerReview.target_user_num == peerReview.reviewer_user_num) {
              this.selfPosition = peerReview.position;
              this.averageSelfScore = peerReview.total_score / Object.keys(peerReview.position).length;
            }else{
              for(var key in peerReview.position) {
                sumPosition[key] += peerReview.position[key];
              }

              sumScore += peerReview.total_score / Object.keys(peerReview.position).length;
            }
          }

          for(var key in sumPosition) {
            this.averagePosition[key] = sumPosition[key] / (peerReviews.length-1);
          }
          this.averageScore = sumScore / (peerReviews.length - 1);
        },
        ({ error }) => {
          notifyError(error);
        }
      )
  }

  nextMember() {
    this.memberIdx ++;
    this.loadPeerReviews();
  }

  preMember() {
    this.memberIdx --;
    this.loadPeerReviews();
  }
}
