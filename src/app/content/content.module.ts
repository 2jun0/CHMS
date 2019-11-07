import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { koLocale } from 'ngx-bootstrap/locale';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { AuthGuard } from '../guards/auth.guard';

import { AutowidthDirective } from '../autowidth.directive';

import { LoginComponent } from './auth/login/login.component';
import { ContentComponent } from './content.component';
import { JoinComponent } from './auth/join/join.component';
import { NotifyEmailAuthComponent } from './auth/nofity-email-auth/notify-email-auth.component';
import { MainComponent } from './main/main.component';
import { PublicProjectListComponent } from './project/public-project-list/public-project-list.component';
import { MyProjectListComponent } from './project/my-project-list/my-project-list.component';
import { NotifyEmailFinishedComponent } from './auth/notify-email-finished/notify-email-finished.component';
import { AllProjectListComponent } from './project/all-project-list/all-project-list.component';
import { NewProjectComponent } from './project/new-project/new-project.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProjectDetailComponent } from './project/project-detail/project-detail.component';
import { AllAccountListComponent } from './account/all-account-list/all-account-list.component';
import { AccountDetailComponent } from './account/all-account-list/account-detail/account-detail.component';
import { NewAccountComponent } from './account/all-account-list/new-account/new-account.component';
import { MyAccountComponent } from './account/my-account/my-account.component';
import { SearchProfMentoComponent } from './project/search-prof-mento/search-prof-mento.component';
import { MemberRoleListComponent } from './project/member-role-list/member-role-list.component';
import { MemberRoleComponent } from './project/member-role-list/member-role/member-role.component';
import { SubmitOutputsComponent } from './project/project-detail/submit-outputs/submit-outputs.component';
import { SubmitPeerReviewComponent } from './project/project-detail/submit-peer-review/submit-peer-review.component';
import { ManageListComponent } from './project/manage-list/manage-list.component';
import { ShowPeerReviewComponent } from './project/project-detail/show-peer-review/show-peer-review.component';
import { EvaluationComponent } from './project/project-detail/submit-evaluation/submit-evaluation.component';
import { MyMileageComponent } from './mileage/my-mileage/my-mileage.component';
import { MileageDetailComponent } from './mileage/mileage-detail/mileage-detail.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { PrintLayoutComponent } from '../print/print-layout/print-layout.component';
import { PrintProjectComponent } from '../print/print-project/print-project.component';
import { InputMileageComponent } from './mileage/input-mileage/input-mileage.component';
import { PrintMileageComponent } from '../print/print-mileage/print-mileage.component';
import { AllMileageListComponent } from './mileage/all-mileage-list/all-mileage-list.component';


defineLocale('ko', koLocale);

const routes: Routes = [
  {
    path: 'auth/login',
    component: LoginComponent
  },
  {
    path: 'auth/join',
    component: JoinComponent
  },
  {
    path: 'auth/notify-email-auth',
    component: NotifyEmailAuthComponent
  },
  {
    path: 'auth/notify-email-finished',
    component: NotifyEmailFinishedComponent
  },
  {
    path: 'auth/reset-password',
    component: ResetPasswordComponent,
  },
  {
    path: 'account/all-list/:page',
    component: AllAccountListComponent,
    canActivate: [AuthGuard],
    data: {userTypes: ['admin'], errorMsg: '모든 사용자 목록은 관리자만 접근할 수 있습니다.'},
  },
  {
    path: 'account/my',
    component: MyAccountComponent,
    canActivate: [AuthGuard],
    data: {errorMsg: '내 계정 관리는 로그인을 해야 접근할 수 있습니다.'}
  },
  {
    path: 'main',
    component: MainComponent
  },
  {
    path: 'project/public-list/:page',
    component: PublicProjectListComponent
  },
  {
    path: 'project/my-list/:page',
    component: MyProjectListComponent,
    canActivate: [AuthGuard],
    data: {userTypes: ['student'], errorMsg: '참여 프로젝트 목록은 학생 사용자만 접근할 수 있습니다.'}
  },
  {
    path: 'project/manage-list/:page',
    component: ManageListComponent,
    canActivate: [AuthGuard],
    data: {userTypes: ['mento', 'professor'], errorMsg: '멘토링 프로젝트 목록은 교수나 멘토 사용자만 접근할 수 있습니다.'}
  },
  {
    path: 'project/all-list/:page',
    component: AllProjectListComponent,
    canActivate: [AuthGuard],
    data: {errorMsg: '모든 프로젝트 목록은 로그인을 해야 접근할 수 있습니다.'}
  },
  {
    path: 'project/detail/:id',
    component: ProjectDetailComponent
  },
  {
    path: 'project/new',
    component: NewProjectComponent
  },
  {
    path: 'project/member-role-list/:id',
    component: MemberRoleListComponent
  },
  {
    path: 'mileage/my-mileage/:page',
    component: MyMileageComponent,
    canActivate: [AuthGuard],
    data: {userTypes: ['student'], errorMsg: 'My 마일리지 조회는 학생 사용자만 접근할 수 있습니다.'}
  },
  {
    path: 'mileage/input-mileage/:type',
    component: InputMileageComponent,
    canActivate: [AuthGuard],
    data: {userTypes: ['student'], errorMsg: '마일리지 입력은 학생 사용자만 접근할 수 있습니다.'}
  },
  {
    path: 'mileage/detail/:id',
    component: MileageDetailComponent,
    canActivate: [AuthGuard],
    data: {userTypes: ['student', 'admin'], errorMsg: '마일리지 상세보기는 학생 사용자와 관리자만 접근할 수 있습니다.'}
  },
  {
    path: 'mileage/all-mileage-list/:page',
    component: AllMileageListComponent,
    canActivate: [AuthGuard],
    data: {userTypes: ['admin'], errorMsg: '마일리지 조회(관리자)는 관리자만 접근할 수 있습니다.'}
  },
  {
    path: 'print',
    outlet: 'print',
    component: PrintLayoutComponent,
    children: [
      { path: 'project/:id', component: PrintProjectComponent },
      { path: 'mileage/:id', component: PrintMileageComponent }
    ]
  }
]

@NgModule({
  declarations: [
    ContentComponent,
    LoginComponent,
    JoinComponent,
    NotifyEmailAuthComponent,
    MainComponent,
    PublicProjectListComponent,
    MyProjectListComponent,
    NotifyEmailFinishedComponent,
    AllProjectListComponent,
    NewProjectComponent,
    ProjectDetailComponent,
    AllAccountListComponent,
    AccountDetailComponent,
    NewAccountComponent,
    MyAccountComponent,
    AutowidthDirective,
    SearchProfMentoComponent,
    MemberRoleListComponent,
    MemberRoleComponent,
    SubmitOutputsComponent,
    SubmitPeerReviewComponent,
    ManageListComponent,
    ShowPeerReviewComponent,
    EvaluationComponent,
    MyMileageComponent,
    MileageDetailComponent,
    ResetPasswordComponent,
    PrintLayoutComponent,
    PrintProjectComponent,
    PrintMileageComponent,
    InputMileageComponent,
    MileageDetailComponent,
    AllMileageListComponent
  ],
  
  exports: [
    ContentComponent,
    RouterModule
  ],
  
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    BrowserAnimationsModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot()
  ]
})
export class ContentModule { }
