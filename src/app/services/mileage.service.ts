import { Injectable, EventEmitter, Output } from '@angular/core';
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
  @Output() loadMileageCodes: EventEmitter<any> = new EventEmitter();

  appUrl = environment.apiUrl;

  areLoadedMileageCodes: boolean = false;

  constructor(
    private http: HttpClient, 
    private auth: AuthService
  ) {
    if(!this.areLoadedMileageCodes) {
      this.updateMileageCodes();
      this.areLoadedMileageCodes = true;
    }
   }

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

  // get my mileages & count
  getMyMileageCount(filter?): Observable<number> {
    return this.http.post<number>(`${this.appUrl}/mileage/get-my-mileage-count`, {_filter: filter}, {headers : this.headers})
  }
  getMyMileages(start: number, count: number, filter?): Observable<Mileage[]> {
    return this.http.post<Mileage[]>(`${this.appUrl}/mileage/get-my-mileages`, {_dataIndex:{ start, count}, _filter:filter}, {headers : this.headers});
  }

  // get mileages & count (Only admin)
  getMileageCount(filter?): Observable<number> {
    return this.http.post<number>(`${this.appUrl}/mileage/get-mileage-count`, {_filter: filter}, {headers : this.headers})
  }
  getMileages(start: number, count: number, filter?): Observable<Mileage[]> {
    return this.http.post<Mileage[]>(`${this.appUrl}/mileage/get-mileages`, {_dataIndex:{ start, count}, _filter:filter}, {headers : this.headers});
  }

  // Get mileage codes
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
    let finished: boolean[] = [false, false, false];

    this.getAllMileageCodes().subscribe(
      (codes) => {
        for(let code of codes) {
          mileageCode[code.code] = code;
        }

        finished[0] = true;
        if(finished[0]&&finished[1]&&finished[2]) {
          this.loadMileageCodes.emit();
        }
      }
    )

    this.getAllMajorCodes().subscribe(
      (codes) => {
        for(let code of codes) {
          majorMileageCode[code.code] = code;
        }

        finished[1] = true;
        if(finished[0]&&finished[1]&&finished[2]) {
          this.loadMileageCodes.emit();
        }
      }
    )

    this.getAllMinorCodes().subscribe(
      (codes) => {
        for(let code of codes) {
          minorMileageCode[code.code] = code;
        }

        finished[2] = true;
        if(finished[0]&&finished[1]&&finished[2]) {
          this.loadMileageCodes.emit();
        }
      }
    )
  }

  get headers(): HttpHeaders{
    if(this.auth.isAuthenticated()) return new HttpHeaders({'Authorization' : this.auth.getToken()});
    else return null;
  }
}
