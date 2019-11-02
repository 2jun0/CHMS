import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
// rxjses
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// services
import { AuthService } from './auth.service';
// models
import { RequestParticipation } from '../model/requestParticipation';
import { Project, Outputs, Evaluation } from '../model/project';
import { StudentUser } from '../model/user';
import { Member } from '../model/member';
import { PeerReview } from '../model/peerReview';


@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  appUrl = environment.apiUrl;
  TOKEN_NAME = 'jwt_project_token';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  // 프로젝트 생성
  addProject(project: Project, img_predicted_file: File): Observable<Project> {
    return this.http.post<Project>(`${this.appUrl}/project/add-project`, {project}, {headers: this.headers})
      .pipe(
        map(res => {
          if(img_predicted_file){
            this.uploadFile(img_predicted_file, 'img_predicted_file', res.id)
              .subscribe(() => {},({ error }) => { throw error; });
          }
          return res;
        })
      );
  }
  // 프로젝트 업데이트
  updateProject(project_id:string, project: Project, img_predicted_file?: File): Observable<any> {
    return this.http.post<any>(`${this.appUrl}/project/update-project`, {project_id, project}, {headers: this.headers})
      .pipe(
        map(res => {
          if(img_predicted_file){
            this.uploadFile(img_predicted_file, 'img_predicted_file', project_id)
              .subscribe(() => {},({ error }) => { throw error; });
          }
          
          return res;
        })
      );
  }
  // 프로젝트 삭제 
  deleteProject(project_id:string): Observable<any> {
    return this.http.post<any>(`${this.appUrl}/project/delete-project`, {project_id}, {headers: this.headers})
  }
  // 산출물 제출
  submitOutputs(project_id: string, outputs: Outputs, doc_ppt_file?: File, doc_zip_file?: File): Observable<any> {
    return this.http.post<any>(`${this.appUrl}/project/submit-outputs`, {project_id, outputs}, {headers: this.headers})
      .pipe(
        map(res => {
          if(doc_ppt_file){
            this.uploadFile(doc_ppt_file, 'doc_ppt_file', project_id)
              .subscribe(() => {},({ error }) => { throw error; });
          }
          if(doc_zip_file){
            this.uploadFile(doc_zip_file, 'doc_zip_file', project_id)
              .subscribe(() => {},({ error }) => { throw error; });
          }
          
          return res;
        })
      )
  }
  // 평가 제출
  submitEvaluation(project_id: string, evaluation: Evaluation): Observable<any> {
    return this.http.post<any>(`${this.appUrl}/project/submit-evaluation`, {project_id, evaluation}, {headers: this.headers});
  }

  // 파일 업로드
  uploadFile(file, description, project_id): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_description', description);
    formData.append('project_id', project_id);
    return this.http.post<any>(`${this.appUrl}/project/upload-file`, formData, {headers : this.headers});
  }

  // Get public project & count with filter (or not)
  getPublicProjectCount(filter?): Observable<number> {
    return this.http.post<number>(`${this.appUrl}/project/get-public-project-count`, {_filter: filter});
  }
  getPublicProjects(start, count, filter?): Observable<Project[]> {
    return this.http.post<Project[]>(`${this.appUrl}/project/get-public-projects`, {_dataIndex: { start, count}, _filter: filter})
      .pipe(map(res => { ProjectService.adjustProjectsType(res); return res;}));
  }
  getPublicProject(projectId: string): Observable<Project> {
    return this.http.post<Project>(`${this.appUrl}/project/get-public-project`, { projectId})
      .pipe(map(res => { ProjectService.adjustProjectType(res); return res;}));
  }

  // Get all project & count with filter (or not)
  getAllProjectCount(filter?): Observable<number> {
    return this.http.post<number>(`${this.appUrl}/project/get-all-project-count`, {_filter: filter}, {headers : this.headers});
  }
  getAllProjects(start, count, filter?): Observable<Project[]> {
    return this.http.post<Project[]>(`${this.appUrl}/project/get-all-projects`, {_dataIndex: {start, count}, _filter: filter}, {headers : this.headers})
      .pipe(map(res => { ProjectService.adjustProjectsType(res); return res; }));
  }

  // Get project & count by mento number
  getProjectCountByMentoNum(user_num: number): Observable<number> {
    return this.http.post<any>(`${this.appUrl}/project/get-mento-project-count`, { user_num }, {headers : this.headers});
  }
  getProjectsByMentoNum(user_num: number, start: number, count: number): Observable<Project[]> {
    return this.http.post<Project[]>(`${this.appUrl}/project/get-mento-projects`, {_dataIndex: {start , count}, user_num}, {headers : this.headers})
      .pipe(map(res => { ProjectService.adjustProjectsType(res); return res; }));
  }
  
  // Get project & count by prof number
  getProjectCountByProfNum(user_num: number): Observable<number> {
    return this.http.post<any>(`${this.appUrl}/project/get-prof-project-count`, { user_num }, {headers : this.headers});
  }
  getProjectsByProfNum(user_num: number, start: number, count: number): Observable<Project[]> {
    return this.http.post<Project[]>(`${this.appUrl}/project/get-prof-projects`, {_dataIndex: {start , count}, user_num}, {headers : this.headers})
      .pipe(map(res => { ProjectService.adjustProjectsType(res); return res; }));
  }

  // Get project & count by member number
  getProjectCountByMemberNum(user_num: number): Observable<number> {
    return this.http.post<any>(`${this.appUrl}/project/get-member-project-count`, { user_num }, {headers : this.headers});
  }
  getProjectsByMemberNum(user_num: number, start: number, count: number): Observable<Project[]> {
    return this.http.post<Project[]>(`${this.appUrl}/project/get-member-projects`, {_dataIndex: {start , count}, user_num}, {headers : this.headers})
      .pipe(map(res => { ProjectService.adjustProjectsType(res); return res; }));
  }

  // Get project
  getProject(projectId: string): Observable<Project> {
    return this.http.post<Project>(`${this.appUrl}/project/get-project`, { project_id: projectId })
      .pipe(map(res => { ProjectService.adjustProjectType(res); return res; }));
  }
  // Get a project leader
  getProjectLeader(projectId :string): Observable<StudentUser> {
    return this.http.post<StudentUser>(`${this.appUrl}/project/get-leader`, {project_id : projectId});
  }

  /*
    맴버 관련 함수들
    getMember
    getMembers
    updateMember
  */
  getMember(project_id: string, user_num: number): Observable<Member> {
    return this.http.post<Member>(`${this.appUrl}/project/member/get-member`, {project_id, user_num})
      .pipe(map(res => { ProjectService.adjustMemberType(res); return res;}));
  }
  getMembers(project_id: string): Observable<Member[]> {
    return this.http.post<Member[]>(`${this.appUrl}/project/member/get-members`, {project_id})
      .pipe(map(res => { ProjectService.adjustMembersType(res); return res;}));
  }
  updateMember(member_id: string, member: Member): Observable<any> {
    return this.http.post<any>(`${this.appUrl}/project/member/update-member`, {member_id, member}, {headers: this.headers});
  }

  /*
    프로젝트 참여 요청 관련 함수들
    requestParticipation
    existsMyRequestParticipation
    getRequesttParticipations
  */
  // 프로젝트에 참여요청 하기
  requestPart(requestPart: RequestParticipation): Observable<any> {   
    return this.http.post<any>(`${this.appUrl}/project/request-part/request-part`, {requestParticipation: requestPart}, { headers: this.headers});
  }

  // 해당 프로젝트에 내가 보낸 참여요청 가져오기
  getMyRequestPart(project_id: string): Observable<RequestParticipation> {
    let user_num = this.auth.getUserNum();
    return this.http.post<RequestParticipation>(`${this.appUrl}/project/request-part/get-request-part`, {user_num, project_id}, {headers: this.headers});
  }

  // 해당 프로젝트의 참여요청을 가져오기
  getRequestParts(project_id: string): Observable<RequestParticipation[]> {
    return this.http.post<RequestParticipation[]>(`${this.appUrl}/project/request-part/get-request-parts`, {project_id}, {headers: this.headers});
  }

  // 참여요청을 거절하기
  deleteRequestPart(requestPart_id: string): Observable<any> {
    return this.http.post<any>(`${this.appUrl}/project/request-part/delete-request-part`, {requestPart_id}, {headers: this.headers})
  }

  // 참여요청을 수락하기
  acceptRequestPart(requestPart_id: string): Observable<any> {
    return this.http.post<any>(`${this.appUrl}/project/request-part/accept-request-part`, {requestPart_id}, {headers: this.headers})
  }

  /*
    동료평가 관련 함수들
    submitPeerReviews
    getPeerReviewsByTargetUserNum
  */
  // 동료평가 제출하기
  submitPeerReviews(peerReviews: PeerReview[], project_id: string): Observable<any> {
    return this.http.post<any>(`${this.appUrl}/project/peer-review/submit-peer-reviews`, {peerReviews, project_id}, {headers: this.headers})
  }
  // 평가 대상 사용자 번호로 동료평가 얻기
  getPeerReviewsByTargetUserNum(project_id: string, target_user_num: number): Observable<PeerReview[]> {
    return this.http.post<PeerReview[]>(`${this.appUrl}/project/peer-review/get-peer-review-by-target`, {project_id, target_user_num}, {headers: this.headers});
  }

  // Adjust date type in project object
  static adjustProjectType(project: Project) {
    if(project.created_date) project.created_date = new Date(project.created_date);
    if(project.recruit_period) {
      project.recruit_period.start_date = new Date(project.recruit_period.start_date);
      project.recruit_period.end_date = new Date(project.recruit_period.end_date);
    }
    if(project.exec_period) {
      project.exec_period.start_date = new Date(project.exec_period.start_date);
      project.exec_period.end_date = new Date(project.exec_period.end_date);
    }
  }
  static adjustProjectsType(projects: Project[]) {
    for(var project of projects) {
      ProjectService.adjustProjectType(project);
    }
  }

  static adjustMemberType(member: Member) {
    if(member.participate_date) member.participate_date = new Date(member.participate_date);
  }
  static adjustMembersType(members: Member[]) {
    for(var member of members) {
      this.adjustMemberType(member);
    }
  }

  get headers(): HttpHeaders{
    if(this.auth.isAuthenticated()) return new HttpHeaders({'Authorization' : this.auth.getToken()});
    else return null;
  }
}