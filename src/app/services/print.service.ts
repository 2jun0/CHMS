import { Injectable, Output, EventEmitter } from '@angular/core';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
}) 
export class PrintService {
  isPrinting = false;

  @Output() print: EventEmitter<String> = new EventEmitter();

  constructor(private router: Router) { }

  printDocument(documentName: string, documentData: string) {
    this.isPrinting = true;
    this.router.navigate(['/',
      { outlets: {
        'print': ['print', documentName, documentData]
      }}]);
    setTimeout(() => {
      this.print.emit();
    });
  }

  onDataReady() {
    setTimeout(() => {
      window.print();
      this.isPrinting = false;
      this.router.navigate([{ outlets: { print: null }}]);
    });
  }
}