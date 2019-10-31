import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, StudentUser, AdminUser, ProfessorUser, MentoUser } from '../model/user';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class UserService {

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
    if(filter) {
      return this.http.post<number>(`${this.appUrl}/user/get-all-user-count`, {_filter: filter}, { headers: this.headers });
    }else{
      return this.http.post<number>(`${this.appUrl}/user/get-all-user-count`, {}, { headers: this.headers });
    }
  }
  // Get all users
  getAllUsers(start, count, filter?): Observable<User[]> {
    if(filter) {
      return this.http.post<User[]>(`${this.appUrl}/user/get-all-users`, {_dataIndex: {start: start,  count: count}, _filter: filter}, { headers: this.headers })
        .pipe(map(res => { UserService.adjustUsersType(res); return res; }));
    }else{
      return this.http.post<User[]>(`${this.appUrl}/user/get-all-users`, {_dataIndex: {start: start,  count: count}}, { headers: this.headers })
        .pipe(map(res => { UserService.adjustUsersType(res); return res; }));
    } 
  }

  // update user
  update(user_num: number, user: User): Observable<any> {
    return this.http.post<any>(`${this.appUrl}/user/update-user`, { user_num: user_num, user: user}, { headers: this.headers })
  }
  updatePassword(user_num: number, cur_password: string, new_password: string, repeat_new_password: string) {
    return this.http.post<any>(`${this.appUrl}/user/update-password`, { user_num: user_num, cur_password:cur_password, new_password:new_password, repeat_new_password:repeat_new_password}, { headers: this.headers })
  }
  updateRandomPassword(user_num: number): Observable<any> {
    return this.http.post<any>(`${this.appUrl}/user/update-random-password`, { user_num : user_num}, { headers: this.headers});
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

  get headers(): HttpHeaders{
    if(this.auth.isAuthenticated()) return new HttpHeaders({'Authorization' : this.auth.getToken()});
    else return null;
  }
}
