import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { LogInPage } from '../pages/log-in/log-in';
import { HomePage } from '../pages/home/home';

import { User } from '../providers/user';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage;

  constructor(
    platform: Platform,
    public user: User,
  ) {
    platform.ready().then(() => {
      this._getLogin();

      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }

  _getLogin() {
    let authType = this.user.getAuthType();
    let authData = this.user.getAuthData();

    if (authType && authData) {
      switch (authType) {
        case 'facebook':
          this.user.getFbLoginStatus().then((data) => {
            if (data.status && data.status == 'connected') {
              this.rootPage = HomePage;
            } else {
              this.rootPage = LogInPage;
            }
          });
          break;
        case 'email':
          this.rootPage = HomePage;
          break;
      }
    } else {
      this.rootPage = LogInPage;
    }
  }
}
