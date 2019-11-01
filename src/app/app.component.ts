import { Component, ElementRef, ViewChild } from '@angular/core';
// services
import { PrintService } from './services/print.service';
import { MileageService } from './services/mileage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('mainPanel', {static: false}) mainPanel: ElementRef;

  title = 'CHMS';
  isGoScrollShow: boolean = false;
  isPrinting: boolean = false;
  
  constructor(
    private printService: PrintService,
    private mileageService: MileageService
  ){
    this.mileageService.updateMileageCodes();

    this.printService.print.subscribe(() => {
      this.isPrinting = true;
    });
  }

  goScrollTop() {
    const mainPanel = this.mainPanel.nativeElement;

    mainPanel.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }

  goScrollBottom() {
    const mainPanel = this.mainPanel.nativeElement;

    mainPanel.scroll({ 
      top: mainPanel.scrollHeight,
      left: 0, 
      behavior: 'smooth' 
    });
  }

  onContentResize(content: ElementRef) {
    if (window.innerHeight < content.nativeElement.offsetHeight) {
      this.isGoScrollShow = true;
    }else {
      this.isGoScrollShow = false;
    }
  }
}
