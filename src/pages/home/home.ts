import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

// Pages
import { LogInPage } from '../log-in/log-in';

// Providers
import { User } from '../../providers/user';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
    public navCtrl: NavController,
    public user: User
  ) {}

  logOut() {
    this.user.logout();
    this.navCtrl.push(LogInPage);
  }

}
