import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
import { closeAllNotifications } from 'src/util/util';

@Injectable({
  providedIn: 'root'
}) 
export class PrintService {
  isPrinting = false;

  constructor(private router: Router) { }

  printDocument(documentName: string, documentData: string) {
    this.isPrinting = true;
    this.router.navigate(['/',
      { outlets: {
        'print': ['print', documentName, documentData]
      }}]);
  }

  onDataReady() {
    closeAllNotifications();
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        this.isPrinting = false; 
        this.router.navigate([{ outlets: { print: null }}]);
      }, 500)
    }, 500);
  }
}