import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit, AfterViewChecked {
  @ViewChild('content', {static: false}) content: ElementRef;
  @Output("onContentResize") onContentResizeEvent = new EventEmitter<ElementRef>();
  
  constructor(
    private router : Router,
  ) { }

  ngOnInit() {
  }

  ngAfterViewChecked() {
    setTimeout(()=>{
      this.onContentResizeEvent.next(this.content);
    });
  }

  onContentResize() {
    this.onContentResizeEvent.next(this.content);
  }

  goLogin() {
    this.router.navigateByUrl("/login");
  }

  goJoin() {
    this.router.navigateByUrl("/join");
  }
}
