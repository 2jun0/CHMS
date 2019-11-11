import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// jsons
import mileageCode from "src/assets/json/mileageCode.json";
// services
import { PrintService } from 'src/app/services/print.service';
import { MileageService } from 'src/app/services/mileage.service';
import { UserService } from 'src/app/services/user.service';
// models
import { User } from 'src/app/model/user';
// utils
import { notifyError, formatDate } from 'src/util/util';

@Component({
  selector: 'app-print-mileage-list',
  templateUrl: './print-mileage-list.component.html',
  styleUrls: ['./print-mileage-list.component.scss']
})
export class PrintMileageListComponent implements OnInit, AfterViewInit {

  filter;

  mileageCount;
  mileages;

  formatDate = formatDate;
  mileageCodes = mileageCode;

  user: User;
  today: Date;

  constructor(
    private route: ActivatedRoute,
    private printService: PrintService,
    private mileageService: MileageService,
    private userService: UserService,
  ) {
    this.filter = JSON.parse(this.route.snapshot.params['filter']);
    this.today = new Date();
    this.today.getFullYear();
  }

  ngOnInit() {
    this.user = this.userService.getMyUser();

    switch(this.user.user_type) {
      case 'admin':
        this.mileageService.getMileageCount(this.filter).subscribe(
          (count) => {
            this.mileageCount = count;
    
            this.mileageService.getMileages(0, this.mileageCount, this.filter).subscribe(
              (mileages) => {
                this.mileages = mileages;
              },
              ({ error }) => {
                notifyError(error);
              }
            );
          },
          ({ error }) => {
            notifyError(error);
          }
        )
        break;
      default:
        this.mileageService.getMyMileageCount(this.filter).subscribe(
          (count) => {
            this.mileageCount = count;
    
            this.mileageService.getMyMileages(0, this.mileageCount, this.filter).subscribe(
              (mileages) => {
                this.mileages = mileages;
              },
              ({ error }) => {
                notifyError(error);
              }
            );
          },
          ({ error }) => {
            notifyError(error);
          }
        )
        break;
    }
  }

  ngAfterViewInit() {
      this.printService.onDataReady();
  }

  get printDate() {return `${this.today.getFullYear()}년 ${this.today.getMonth()+1}월 ${this.today.getDate()}일`}
}
