import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
// rxjs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// models
import { Mileage } from '../model/mileage';
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
          

          return res;
        })
      )
  }

  // 파일 업로드
  uploadFile(file, description, mileage_id): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_description', description);
    formData.append('mileage_id', mileage_id);
    return this.http.post<any>(`${this.appUrl}/mileage/upload-file`, formData, {headers : this.headers});
  }

  get headers(): HttpHeaders{
    if(this.auth.isAuthenticated()) return new HttpHeaders({'Authorization' : this.auth.getToken()});
    else return null;
  }
}
