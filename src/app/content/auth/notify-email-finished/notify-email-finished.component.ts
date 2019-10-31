import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
// services
import { AuthService } from 'src/app/services/auth.service';
// utils
import { notifyError } from 'src/util/util';

@Component({
  selector: 'app-notify-email-finished',
  templateUrl: './notify-email-finished.component.html',
  styleUrls: ['./notify-email-finished.component.scss']
})
export class NotifyEmailFinishedComponent implements OnInit {
  is_complete: boolean;
  auth_key: string;
  user_name: string;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
    ) { 
      this.auth_key = this.route.snapshot.paramMap.get('auth-key');
      this.user_name = this.route.snapshot.paramMap.get('user-name');
    }

  ngOnInit() {
    this.auth.authenticateEmail({auth_key : this.auth_key})
      .subscribe(
        () => this.is_complete = true,
        ({ error }) => {
          notifyError(error);
          this.is_complete = false;
        }
      )
  }

}
