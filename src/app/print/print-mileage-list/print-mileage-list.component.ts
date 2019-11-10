import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// jsons
import mileageCode from "src/assets/json/mileageCode.json";
// services
import { PrintService } from 'src/app/services/print.service';
import { MileageService } from 'src/app/services/mileage.service';
import { AuthService } from 'src/app/services/auth.service';
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

  constructor(
    private route: ActivatedRoute,
    private printService: PrintService,
    private mileageService: MileageService,
    private authService: AuthService
  ) {
    this.filter = JSON.parse(this.route.snapshot.params['filter']);
  }

  ngOnInit() {
    switch(this.authService.getUserType()) {
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
}
