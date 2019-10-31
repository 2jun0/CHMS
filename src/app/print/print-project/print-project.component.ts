import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrintService } from 'src/app/services/print.service';
import { Project } from 'src/app/model/project';
import { ProjectService } from 'src/app/services/project.service';
import { notifyError } from 'src/util/util';

@Component({
  selector: 'app-print-project',
  templateUrl: './print-project.component.html',
  styleUrls: ['./print-project.component.scss']
})
export class PrintProjectComponent implements OnInit {

  project: Project;
  id: string;
  invoiceDetails: Promise<any>[];

  constructor(
    private route: ActivatedRoute,
    private printService: PrintService,
    private projectService: ProjectService
    ) {
    this.id = route.snapshot.params['id'];
    console.log(this.id);
  }

  ngOnInit() {
    this.projectService.getProject(this.id).subscribe(() =>
      {
        this.printService.onDataReady();
      },({error}) => {
        notifyError(error);
      }
    )
  }
}
