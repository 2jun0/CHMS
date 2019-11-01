import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router'; 
// ngx-bootstraps
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
// jsons
import majorMileageCode from "src/assets/json/majorMileageCode.json";

@Component({
  selector: 'app-input-mileage',
  templateUrl: './input-mileage.component.html',
  styleUrls: ['./input-mileage.component.scss']
})
export class InputMileageComponent implements OnInit {

  // jsons for html
  majorMileageCode = majorMileageCode;

  newMileageForm: FormGroup;

  today : Date =  new Date();

  type: string;

  constructor(
    private route: ActivatedRoute,
    private localeService: BsLocaleService,
    private formBuilder: FormBuilder
    ) { 
      this.localeService.use('ko');
    } 

    ngOnInit() {
      this.type = this.route.snapshot.paramMap.get('type');

      this.newMileageForm = this.formBuilder.group({
        mileage_name: ['', [Validators.required]],
        score: 0,
        detail: ['', [Validators.required]],
        act_date: this.formBuilder.group({
          from: [null, [Validators.required]],
          to: [null, [Validators.required]]
        }),
        code: ['' , [Validators.required]],
      })

    }

    get act_date() { return this.newMileageForm.get('act_date');}

}
