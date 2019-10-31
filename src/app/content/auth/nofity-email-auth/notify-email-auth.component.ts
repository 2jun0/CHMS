import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-notify-email-auth',
  templateUrl: './notify-email-auth.component.html',
  styleUrls: ['./notify-email-auth.component.scss']
})
export class NotifyEmailAuthComponent implements OnInit {
  email: string;

  constructor(
    private route: ActivatedRoute
    ) { 
      this.route.queryParams.subscribe(params => {
        this.email = params['email'];
      })
    }

  ngOnInit() {
  }

}
