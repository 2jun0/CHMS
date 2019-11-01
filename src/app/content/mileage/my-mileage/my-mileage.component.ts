import { Component, OnInit } from '@angular/core';
// jsons
import mileageCode from "src/assets/json/mileageCode.json";
// services
import { MileageService } from 'src/app/services/mileage.service';
// models
import { Mileage } from 'src/app/model/mileage';
// utils
import { AuthService } from 'src/app/services/auth.service';
import { notifyError } from 'src/util/util';
@Component({
  selector: 'app-my-mileage',
  templateUrl: './my-mileage.component.html',
  styleUrls: ['./my-mileage.component.scss']
})
export class MyMileageComponent implements OnInit {

  // jsons for html
  mileageCode = mileageCode;

  myMileages: Mileage[];

  constructor(
    private mileageService: MileageService,
    private authService: AuthService,
  ) { 
    this.myMileages = [];
  }

  ngOnInit() {
    this.mileageService.getMileagesByUserNum(this.authService.getUserNum()).subscribe(
      (mileages) => {
        this.myMileages = mileages;
      },
      ({ error }) => {
        notifyError(error);
      }
    );
  }
}
