import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
// services
import { AuthService } from '../services/auth.service';
// utils
import { notifyError } from 'src/util/util';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private auth: AuthService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    var deadline = "20191203";
    var today = new Date();
    var Today: String;
    var dd = today.getDate();
    var mm = (today.getMonth()+1); //January is 0!
    var yyyy = today.getFullYear();

    Today = yyyy.toString();
    if(mm<10) {
      Today = Today+"0";
    } 
    Today = Today+mm.toString();
    if(dd<10) {
      Today = Today+"0";
    } 
    Today = Today+dd.toString();
  
    console.log(deadline,"   ", Today);
    console.log((deadline<Today));
    // 토큰 유효 기간 확인
    if (!this.auth.isAuthenticated()) {
      console.log('invalid token');

      if(route.data && route.data.errorMsg) {
        notifyError(new Error(route.data.errorMsg), true);
      }

      this.router.navigate(['auth/login']);
      return false;
    }

    // 사용자 종류 확인
    if(route.data && route.data.userTypes) {
      let userTypes = route.data.userTypes as string[];
      if(deadline<Today && route.data.isInputMileage){
        alert('마일리지 입력기간이 아닙니다.');
        return false
      }else{
        if(userTypes.includes(this.auth.getUserType())) {
          return true;
        }else{
          if(route.data.errorMsg) {
            notifyError(new Error(route.data.errorMsg), true);
          }

          return false;
        }
      }
    }else{
      return true;
    }
  }
}
