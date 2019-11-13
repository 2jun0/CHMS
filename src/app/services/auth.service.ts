import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
// envs
import { environment } from 'src/environments/environment';
// rxjs
import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators'; 
// models
import { User, StudentUser, MentoUser, ProfessorUser } from '../model/user';
import { Token } from '../model/token';
import { notifyError } from 'src/util/util';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  @Output() onLogin: EventEmitter<Token> = new EventEmitter();
  @Output() onLogout: EventEmitter<Token> = new EventEmitter();

  appUrl = environment.apiUrl;
  TOKEN_NAME = 'jwt_account_auth_token';

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService
  ) {
    console.log('[appUrl]', this.appUrl);
  }

  login(credential: User): Observable<Token> {
    return this.http.post<Token>(`${this.appUrl}/auth/login`, credential)
      .pipe(
        tap(res => {
          this.setToken(res.token);
          this.onLogin.emit();
        }),
        shareReplay()
      );
  }

  reLogin(): Observable<Token> {
    const headers = new HttpHeaders()
      .set('Authorization', this.getToken());
    return this.http.get<Token>(`${this.appUrl}/auth/re-login`, {headers : headers})
    .pipe(
      tap(res => {
        this.setToken(res.token);
        this.onLogin.emit();
      }),
      shareReplay()
    );
  }

  logout(): void {
    this.removeToken();
    this.onLogout.emit();
  }

  joinUser(user: User, user_type: string): Observable<Token> {
    switch(user_type) {
      case 'student':
        return this.joinStudentUser(user as StudentUser);
      case 'mento':
        return this.joinMentoUser(user as MentoUser);
      case 'professor':
        return this.joinProfessorUser(user as ProfessorUser);
    }
  }

  joinStudentUser(user: StudentUser): Observable<Token> {
    return this.http.post<Token>(`${this.appUrl}/auth/join/student`, {user});
  }
  
  joinMentoUser(user: MentoUser): Observable<Token> {
    return this.http.post<Token>(`${this.appUrl}/auth/join/mento`, {user}, { headers: this.headers });
  }

  joinProfessorUser(user: ProfessorUser): Observable<Token> {
    return this.http.post<Token>(`${this.appUrl}/auth/join/professor`, {user}, { headers: this.headers });
  }

  authenticateEmail(auth_key: string): Observable<Token> {
    return this.http.post<Token>(`${this.appUrl}/auth/email-auth`, {auth_key})
      .pipe(
        tap(res => { this.setToken(res.token);}),
        shareReplay()
      )
  }

  // 로그인 토큰 유효성 검증
  // 로그인 토큰 유효성 검증시 오류가 생길 경우, 알수 없는 토큰으로 인식후, logout한다.
  isAuthenticated(): boolean {
    const token = this.getToken();
    try{
      return token && token != 'undefined' ? !this.isTokenExpired(token) : false;
    }catch(error) {
      notifyError(error);
      this.logout();
      return false;
    }
  }

  getToken(): string {
    return localStorage.getItem(this.TOKEN_NAME);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_NAME, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_NAME);
  }

  /*
  token 유효 기간 체크
  The JwtHelper class has several useful methods that can be utilized in your components:

  decodeToken
  getTokenExpirationDate
  isTokenExpired

  npm install @auth0/angular-jwt
  https://github.com/auth0/angular2-jwt
*/
  isTokenExpired(token: string) {
    return this.jwtHelper.isTokenExpired(token);
  }

  getUserName(): string {
    if(this.isAuthenticated()){
      return this.jwtHelper.decodeToken(this.getToken()).name;
    }else{
      return null;
    }
  }

  getUserType(): string {
    if(this.isAuthenticated()){
      return this.jwtHelper.decodeToken(this.getToken()).user_type;
    }else{
      return null;
    }
  }

  getUserNum(): number {
    if(this.isAuthenticated()){
      return this.jwtHelper.decodeToken(this.getToken()).user_num;
    }else{
      return null;
    }
  }

  get headers(): HttpHeaders{
    if(this.isAuthenticated()) return new HttpHeaders({'Authorization' : this.getToken()});
    else return null;
  }
}
