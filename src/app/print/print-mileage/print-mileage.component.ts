import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// services
import { PrintService } from 'src/app/services/print.service';
import { MileageService } from 'src/app/services/mileage.service';
// models
import { Mileage } from 'src/app/model/mileage';
// utils
import { notifyError } from 'src/util/util';

@Component({
  selector: 'app-print-mileage',
  templateUrl: './print-mileage.component.html',
  styleUrls: ['./print-mileage.component.scss']
})
export class PrintMileageComponent implements OnInit {

  mileage: Mileage;
  id: string;

  constructor(
    private route: ActivatedRoute,
    private printService: PrintService,
    private mileageService: MileageService
  ) { 
    this.id = this.route.snapshot.params['id'];
  }

  ngOnInit() {
    this.mileageService.getMileage(this.id).subscribe(
      (mileage) => {
        this.printService.onDataReady();
        this.mileage = mileage;
      },({error}) => {
        notifyError(error);
      }
    )
  }

}
