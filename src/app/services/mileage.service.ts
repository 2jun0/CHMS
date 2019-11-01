import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
// rxjs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// jsons
import mileageCode from "src/assets/json/mileageCode.json";
import majorMileageCode from "src/assets/json/majorMileageCode.json";
import minorMileageCode from "src/assets/json/minorMileageCode.json";
// models
import { Mileage, MinorMileage, MajorMileage, MileageCode } from '../model/mileage';
// services
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MileageService {
  appUrl = environment.apiUrl;

  constructor(
    private http: HttpClient, 
    private auth: AuthService
  ) { }

  // Create Mileage by mileage model
  addMileage(mileage: Mileage, info_photos: File[]): Observable<Mileage> {
    return this.http.post<Mileage>(`${this.appUrl}/mileage/add-mileage`, {mileage}, {headers: this.headers})
      .pipe(
        map(res => {
          this.uploadFile(info_photos, "info_photo", res.id);

          return res;
        })
      )
  }

  // 파일 업로드
  uploadFile(files: File[], description, mileage_id): Observable<any> {
    const formData = new FormData();
    for(let i =0; i < files.length; i++){
      formData.append(`files[${i}]`, files[i]);
    }
    formData.append('file_description', description);
    formData.append('mileage_id', mileage_id);
    return this.http.post<any>(`${this.appUrl}/mileage/upload-file`, formData, {headers : this.headers});
  }

  getMileagesByUserNum(user_num: number): Observable<Mileage[]> {
    return this.http.post<Mileage[]>(`${this.appUrl}/mileage/get-mileages`, {user_num}, {headers : this.headers});
  }

  getAllMileageCodes(): Observable<MileageCode[]> {
    return this.http.get<MileageCode[]>(`${this.appUrl}/mileage/get-mileage-codes`);
  }

  getAllMajorCodes(): Observable<MajorMileage[]> {
    return this.http.get<MajorMileage[]>(`${this.appUrl}/mileage/get-major-mileages`);
  }

  getAllMinorCodes(): Observable<MinorMileage[]> {
    return this.http.get<MinorMileage[]>(`${this.appUrl}/mileage/get-minor-mileages`);
  }

  updateMileageCodes() {
    this.getAllMileageCodes().subscribe(
      (codes) => {
        for(let code of codes) {
          mileageCode[code.code] = code;
        }
      }
    )

    this.getAllMajorCodes().subscribe(
      (codes) => {
        for(let code of codes) {
          majorMileageCode[code.code] = code;
        }
      }
    )

    this.getAllMinorCodes().subscribe(
      (codes) => {
        for(let code of codes) {
          minorMileageCode[code.code] = code;
        }

      }
    )
  }

  get headers(): HttpHeaders{
    if(this.auth.isAuthenticated()) return new HttpHeaders({'Authorization' : this.auth.getToken()});
    else return null;
  }
}
