import { Component, OnInit, TemplateRef, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
// ngx-bootstraps
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
// jsons
import userTypes from 'src/assets/json/userTypes.json';
// models
import { User } from 'src/app/model/user';
// services
import { UserService } from 'src/app/services/user.service';
// utils
import { notifyError, notifyInfo } from 'src/util/util';

@Component({
  selector: 'app-search-prof-mento', 
  templateUrl: './search-prof-mento.component.html',
  styleUrls: ['./search-prof-mento.component.scss']
})
export class SearchProfMentoComponent implements OnInit {
  @ViewChild("searchProfMentoTemplate", {static: false}) mainTemplate: ElementRef;
  @Output("setProf") setProfEvent = new EventEmitter<User>();
  @Output("setMento") setMentoEvent = new EventEmitter<User>();

  USER_COUNT_IN_PAGE: number = 10;
  PAGE_COUNT_IN_RANGE: number = 5;

  // external json
  userTypes = userTypes;

  page: number;
  maxPage: number;
  pageRange: Array<number> = [];

  selectProfMentoModal: BsModalRef;

  isFirstPageRange: boolean;
  isLastPageRange: boolean;

  profMentoCount: number;
  profMentoUsers: User[];

  profMentoName: string;

  searchUserType: string;

  constructor(
    private modalService: BsModalService,
    private userService: UserService
  ) {
    this.profMentoUsers = [];
  }

  ngOnInit() {
  }

  openModal(name: string, user_type: string) {
    this.selectProfMentoModal = this.modalService.show(
      this.mainTemplate
    );
    this.profMentoName = name.trim();
    this.searchUserType = user_type;
    this.searchProfMento();
  }

  closeModal() {
    this.selectProfMentoModal.hide();
  }
  
  reloadProfMentoUsers(page) {
    let filter;

    if(!this.profMentoName) {
      filter = {
        user_type: this.searchUserType
      }
    }else{
      filter = {
        user_type: this.searchUserType,
        name: this.profMentoName
      }
    }

    console.log(filter)

    this.page = page;
    this.pageRange = Array<number>();

    this.userService.getAllUserCount(filter)
      .subscribe(
        (count) => {
          this.profMentoCount = count;
          this.maxPage = (count%this.USER_COUNT_IN_PAGE === 0) ? (count/this.USER_COUNT_IN_PAGE-1) : Math.floor(count/this.USER_COUNT_IN_PAGE);

          for (var idx = this.page - this.page % this.PAGE_COUNT_IN_RANGE, i = 0; (i < this.PAGE_COUNT_IN_RANGE)&&(idx <= this.maxPage); i++, idx++) {
            this.pageRange.push(idx);
          }

          if(this.pageRange[0] === 0) {
            this.isFirstPageRange = true;
          }else{
            this.isFirstPageRange = false;
          }
          
          if(this.pageRange[this.pageRange.length-1] == this.maxPage){
            this.isLastPageRange = true;
          }else{
            this.isLastPageRange = false;
          }
        }
      );
    
    this.userService.getAllUsers(this.page * this.USER_COUNT_IN_PAGE, this.USER_COUNT_IN_PAGE, filter)
        .subscribe(
          (users) => {
            this.profMentoUsers = users;
          }
        )
  }

  gotoFirstPage() {
    this.gotoPage(0);
  }

  gotoLastPage() {
    this.gotoPage(this.maxPage);
  }

  gotoNextPageRange() {
    let idx = this.pageRange[0] + this.PAGE_COUNT_IN_RANGE;
    if(idx >= this.maxPage) { 
      this.gotoLastPage();
    }else {
      this.gotoPage(idx);
    }
  }

  gotoPreviousPageRange() {
    let idx = this.pageRange[0] - 1;
    if(idx <= 0) {
      this.gotoFirstPage();
    }else{
      this.gotoPage(idx);
    }
  }

  gotoPage(page: number) {
    this.reloadProfMentoUsers(page);
  }

  searchProfMento() {
    this.gotoFirstPage();
  }

  setProf(user: User) {
    this.setProfEvent.next(user);
    this.closeModal();
  }

  setMento(user: User) {
    this.setMentoEvent.next(user);
    this.closeModal();
  }
}
