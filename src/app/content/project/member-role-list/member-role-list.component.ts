import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
// models
import { Member } from 'src/app/model/member';
import { Project } from 'src/app/model/project';
// services
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
// utils
import { notifyError } from 'src/util/util';

@Component({
  selector: 'app-member-role-list',
  templateUrl: './member-role-list.component.html',
  styleUrls: ['./member-role-list.component.scss']
})
export class MemberRoleListComponent implements OnInit {

  projectId: string;

  project: Project;
  members: Member[];

  isUpdateMode: boolean;
  isLoad: boolean;
  isLeader: boolean;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private userService: UserService,
    private authService: AuthService
  ) { 
    this.isUpdateMode = false;
    this.isLoad = false;
    this.isLeader = false;
  }

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id');

    this.projectService.getProject(this.projectId)
      .subscribe(
        (project) => {
          this.project = project;
        },
        ({ error }) => {
          notifyError(error);
        }
      )

    this.projectService.getMembers(this.projectId)
      .subscribe(
        (members) => {
          this.members = members;

          let myUserNum = this.authService.getUserNum();
          for(var i = 0; i < members.length; i++) {
            let member = members[i];

            // 자신의 정보인지 확인
            if(member.user_num == myUserNum) {
              // 자신의 맴버 정보가 상단으로 오게 한다.
              members.splice(0, 0, member);
              members.splice(i+1, 1);

              if(member.is_leader) {
                this.isLeader = true;
              }
            }

            this.userService.getUser(member.user_num)
              .subscribe(
                (user) => {
                  // user값도 넘겨주기 위함.
                  member['user'] = user;
                },
                ({ error }) => {
                  notifyError(error);
                }
              );
          }
          this.isLoad = true;
        },
        ({ error }) => {
          notifyError(error);
        }
      );
  }
}
