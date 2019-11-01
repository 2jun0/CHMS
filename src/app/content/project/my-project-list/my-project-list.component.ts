import { Component, OnInit } from '@angular/core';

import { formatDate, range } from 'src/util/util';

import { ProjectService } from 'src/app/services/project.service';
import { Project } from 'src/app/model/project';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

import projectAreaTypes from "src/assets/json/projectAreaTypes.json";
import projectStates from "src/assets/json/projectStates.json";
import languages from "src/assets/json/languages.json";

@Component({
  selector: 'app-my-project-list',
  templateUrl: './my-project-list.component.html',
  styleUrls: ['./my-project-list.component.scss']
})
export class MyProjectListComponent implements OnInit {
  PROJECT_COUNT_IN_PAGE: number = 5;
  PAGE_COUNT_IN_RANGE: number = 5;

  // external functions
  formatDate = formatDate;

  // external json
  projectAreaTypes = projectAreaTypes;
  projectStates = projectStates;
  languages = languages;

  myProjects: Array<Project>;
  myProjectCount: Number;
  searchLeaderProject: boolean;

  pageIndex: number;
  maxPageIndex: number;
  pageIndexRange: Array<number>;

  isFirstPageRange: boolean;
  isLastPageRange: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private authService: AuthService
  ) {
    this.myProjects = [];

    this.searchLeaderProject = false;
  }

  ngOnInit() {
    this.reloadProjects();
  }
  
  reloadProjects(page?) {
    if(page === 0 || page){
      this.pageIndex = page;
    }else{
      this.pageIndex = Number(this.route.snapshot.paramMap.get('page')) - 1;
    }
    
    this.pageIndexRange = Array<number>();

    this.projectService.getProjectCountByMemberNum(this.authService.getUserNum())
      .subscribe(
        (count) => {
          this.myProjectCount = count;
          this.maxPageIndex = (count%this.PROJECT_COUNT_IN_PAGE === 0) ? (count/this.PROJECT_COUNT_IN_PAGE-1) : Math.floor(count/this.PROJECT_COUNT_IN_PAGE);
          
          for (var idx = this.pageIndex - this.pageIndex % this.PAGE_COUNT_IN_RANGE, i = 0; (i < this.PAGE_COUNT_IN_RANGE)&&(idx <= this.maxPageIndex); i++, idx++) {
            this.pageIndexRange.push(idx);
          }

          if(this.pageIndexRange[0] === 0) {
            this.isFirstPageRange = true;
          }else{
            this.isFirstPageRange = false;
          }
          
          if(this.pageIndexRange[this.pageIndexRange.length-1] == this.maxPageIndex){
            this.isLastPageRange = true;
          }else{
            this.isLastPageRange = false;
          }
        }
      );
    

    this.projectService.getProjectsByMemberNum(this.authService.getUserNum(), this.pageIndex * this.PROJECT_COUNT_IN_PAGE, this.PROJECT_COUNT_IN_PAGE)
      .subscribe(
        (projects) => {
          this.myProjects = projects;
          for(let project of projects) {
            this.projectService.getProjectLeader(project.id)
              .subscribe(
                (leader) => {
                  project['leader'] = leader;
                })
          }})
  }

  gotoFirstPage() {
    this.gotoPage(0);
  }

  gotoLastPage() {
    this.gotoPage(this.maxPageIndex);
  }

  gotoNextPageRange() {
    let idx = this.pageIndexRange[0] + this.PAGE_COUNT_IN_RANGE;
    if(idx >= this.maxPageIndex) { 
      this.gotoLastPage();
    }else {
      this.gotoPage(idx);
    }
  }

  gotoPreviousPageRange() {
    let idx = this.pageIndexRange[0] - 1;
    if(idx <= 0) {
      this.gotoFirstPage();
    }else{
      this.gotoPage(idx);
    }
  }

  gotoPage(page: number) {
    this.router.navigate(['/project/my-list', page+1]);
    this.reloadProjects(page);
  }
}
