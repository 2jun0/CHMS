import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
// jsons
import collegeTypes from "src/assets/json/collegeTypes.json";
import departmentTypes from "src/assets/json/departmentTypes.json";
// rxjs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// services
import { AuthService } from './auth.service';
// models
import { User, StudentUser, AdminUser, ProfessorUser, MentoUser } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  @Output() loadCodes: EventEmitter<any> = new EventEmitter();

  appUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    private auth: AuthService
  ) {
    
  }
  
  // Get a user by user_num
  getUser(user_num: number): Observable<User> {
    return this.http.post<User>(`${this.appUrl}/user/get-user`, {user_num}, { headers: this.headers })
      .pipe(map(res => { UserService.adjustUserType(res); return res; }));
  }

  // Get count of all users
  getAllUserCount(filter?): Observable<number> {
    return this.http.post<number>(`${this.appUrl}/user/get-all-user-count`, {_filter: filter}, { headers: this.headers });
  }
  // Get all users
  getAllUsers(start, count, filter?): Observable<User[]> {
    return this.http.post<User[]>(`${this.appUrl}/user/get-all-users`, {_dataIndex: {start: start,  count: count}, _filter: filter}, { headers: this.headers })
      .pipe(map(res => { UserService.adjustUsersType(res); return res; }));
  }

  // update user
  update(user_num: number, user: User): Observable<any> {
    return this.http.post<any>(`${this.appUrl}/user/update-user`, { user_num: user_num, user: user}, { headers: this.headers })
  }
  updatePassword(user_num: number, cur_password: string, new_password: string, repeat_new_password: string) {
    return this.http.post<any>(`${this.appUrl}/user/update-password`, { user_num: user_num, cur_password:cur_password, new_password:new_password, repeat_new_password:repeat_new_password}, { headers: this.headers })
  }
  updateRandomPassword(user_num: number): Observable<any> {
    return this.http.post<any>(`${this.appUrl}/user/update-random-password`, { user_num : user_num});
  }

  // Delete user
  delete(user_num: number): Observable<any> {
    return this.http.post<any>(`${this.appUrl}/user/delete`, { user_num: user_num }, { headers: this.headers })
  }

  // get my user object
  getMyUser(): User {
    return UserService.tokenToUser(this.auth.getToken(), this.jwtHelper);
  }

  // Adjust data type in user object
  static adjustUserType(user: User) {
    if(user.join_date) user.join_date = new Date(user.join_date);
  }
  static adjustUsersType(users: User[]) {
    for(var user of users) {
      UserService.adjustUserType(user);
    }
  }

  static tokenToUser(userToken: string, jwtHelper: JwtHelperService): User {
    let user: User = jwtHelper.decodeToken(userToken);

    switch(user.user_type) {
      case 'student':
        let studentUser: StudentUser = user as StudentUser;
        if(studentUser.join_date) { studentUser.join_date = new Date(studentUser.join_date);}

        return studentUser;
      case 'admin':
        let adminUser: AdminUser = user as AdminUser;
        if(adminUser.join_date) { adminUser.join_date = new Date(adminUser.join_date);}

        return adminUser;
      case 'professor':
        let professorUser: ProfessorUser = user as ProfessorUser;
        if(professorUser.join_date) { professorUser.join_date = new Date(professorUser.join_date); }
        
        return professorUser;
      case 'mento':
        let mentoUser: MentoUser = user as MentoUser;
        if(mentoUser.join_date) { mentoUser.join_date = new Date(mentoUser.join_date); }
        
        return mentoUser;
    }

    return user;
  }

  getAllCollegeTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.appUrl}/user/get-college-types`);
  } 

  getAllDepartmentTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.appUrl}/user/get-department-types`);
  }

  updateCodes() {
    let finished: boolean[] = [false, false];

    this.getAllCollegeTypes().subscribe(
      (codes) =>
      {
        for(let code of codes) {
          collegeTypes[code['description']] = code;
        }

        finished[0] = true;
        if(finished[0]&&finished[1]) {
          this.loadCodes.emit();
        }
      }
    )

    this.getAllDepartmentTypes().subscribe(
      (codes) =>
      {
        for(let code of codes) {
          departmentTypes[code['description']] = code;
        }

        finished[1] = true;
        if(finished[0]&&finished[1]) {
          this.loadCodes.emit();
        }
      }
    )
  }

  get headers(): HttpHeaders{
    if(this.auth.isAuthenticated()) return new HttpHeaders({'Authorization' : this.auth.getToken()});
    else return null;
  }
}
