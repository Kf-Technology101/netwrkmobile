import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

// Pages
import { LogInPage } from '../log-in/log-in';

// Providers
import { Auth } from '../../providers/auth';
import { Tools } from '../../providers/tools';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
    public navCtrl: NavController,
    public auth: Auth,
    public tools: Tools
  ) {
    // tools.doBackButton('home', (page) => {
    //   console.log(page);
    // });
  }

  logOut() {
    this.auth.logout();
    this.navCtrl.push(LogInPage);
  }

}
