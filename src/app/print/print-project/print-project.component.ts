import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
// models
import { Project } from 'src/app/model/project';
// services
import { PrintService } from 'src/app/services/print.service';
import { ProjectService } from 'src/app/services/project.service';
// jsons
import projectStates from 'src/assets/json/projectStates.json';
import projectTypes from 'src/assets/json/projectTypes.json';
import projectAreaTypes from 'src/assets/json/projectAreaTypes.json';
import languages from 'src/assets/json/languages.json';
// utils
import { notifyError, formatDate } from 'src/util/util';

@Component({
  selector: 'app-print-project',
  templateUrl: './print-project.component.html',
  styleUrls: ['./print-project.component.scss']
})
export class PrintProjectComponent implements OnInit, AfterViewInit {

  appUrl = environment.apiUrl;

  // external functions and json
  formatDate = formatDate;
  projectTypes = projectTypes;
  projectAreaTypes = projectAreaTypes;
  projectStates = projectStates;
  languageTypes = languages;

  project: Project;
  id: string;
  invoiceDetails: Promise<any>[];

  constructor(
    private route: ActivatedRoute,
    private printService: PrintService,
    private projectService: ProjectService
    ) {
    this.id = this.route.snapshot.params['id'];
  }

  ngOnInit() {
    this.projectService.getProject(this.id).subscribe(
      (project) => {
        this.project = project;
      },({error}) => {
        notifyError(error);
      }
    )
  }

  ngAfterViewInit() {
    this.printService.onDataReady();
  }
}
