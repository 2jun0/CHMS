import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// jsons
import mileageCode from "src/assets/json/mileageCode.json";
// services
import { PrintService } from 'src/app/services/print.service';
import { MileageService } from 'src/app/services/mileage.service';
// models
import { Mileage } from 'src/app/model/mileage';
import { User } from 'src/app/model/user';
// utils
import { notifyError, formatDate } from 'src/util/util';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-print-mileage',
  templateUrl: './print-mileage.component.html',
  styleUrls: ['./print-mileage.component.scss']
})
export class PrintMileageComponent implements OnInit {

  mileage: Mileage;
  id: string;

  formatDate = formatDate;

  mileageCode = mileageCode;
  isStudent: boolean;
  user: User;

  constructor(
    private route: ActivatedRoute,
    private printService: PrintService,
    private mileageService: MileageService,
    private userService: UserService,
  ) { 
    this.id = this.route.snapshot.params['id'];
    this.isStudent = false;
  }

  ngOnInit() {
    this.user = this.userService.getMyUser();

    this.mileageService.getMileage(this.id).subscribe(
      (mileage) => {
        this.mileage = mileage;
        this.printService.onDataReady();
      },({error}) => {
        notifyError(error);
      }
    )
  }
}
