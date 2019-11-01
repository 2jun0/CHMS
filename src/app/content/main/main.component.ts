import { Component, OnInit } from '@angular/core';
import { ProjectService } from 'src/app/services/project.service';
// models
import { Project } from 'src/app/model/project';
// utils
import { formatDate, notifyError } from 'src/util/util';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  // external functions
  formatDate = formatDate;

  // public projects
  allProjects: Project[];

  isLoad: boolean;

  constructor(
    private projectService: ProjectService,
  ) {
    this.isLoad = false;
  }

  ngOnInit() {
    // Get public projects
    this.projectService.getPublicProjects(0, 5)
      .subscribe(
        (projects) => {
          this.allProjects = projects;

          for(var i = 0; i < this.allProjects.length; i++) {
            var project = this.allProjects[i];
            this.projectService.getProjectLeader(project.id)
              .subscribe(
                (leader) => {
                  project['leader'] = leader;
                },
                ({ error }) => {
                  notifyError(error);
                }
              )
          }

          this.isLoad = true;
        },
        ({ error }) => {
          notifyError(error);
        }
      )
  }

}
