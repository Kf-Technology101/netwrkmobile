import { Component } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { StatusBar, Splashscreen, Sim } from 'ionic-native';

// Pages
import { LogInPage } from '../pages/log-in/log-in';
import { HomePage } from '../pages/home/home';
import { ProfilePage } from '../pages/profile/profile';

// Providers
import { User } from '../providers/user';
import { LocalStorage } from '../providers/local-storage';
import { MainFunctions } from '../providers/main';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage;

  constructor(
    platform: Platform,
    public user: User,
    public localStorage: LocalStorage,
    public events: Events,
    public mainFnc: MainFunctions
  ) {
    platform.registerBackButtonAction(function () {
      events.publish('backButton:clicked');
      console.log('navCtrl');
      return false;
    });

    platform.ready().then(() => {
      this._getLogin();
      this.getSimInfo();

      StatusBar.styleDefault();
    });
  }

  ngOnInit() {

  }

  _getLogin() {
    let authType = this.user.getAuthType();
    let authData = this.user.getAuthData();

    if (authType && authData) {
      switch (authType) {
        case 'facebook':
          this.user.getFbLoginStatus().then((data) => {
            if (data.status && data.status == 'connected') {
              this.rootPage = this.mainFnc.getLoginPage(authData.id, HomePage, LogInPage);
            } else {
              this.rootPage = LogInPage;
            }
            Splashscreen.hide();
          });
          break;
        case 'email':
          this.rootPage = this.mainFnc.getLoginPage(authData.id, HomePage, LogInPage);
          Splashscreen.hide();
          break;
      }
    } else {
      this.rootPage = ProfilePage;
    }
  }

  getSimInfo() {
    Sim.getSimInfo().then(
      (info) => {
        console.log('Sim info: ', info);
        this.localStorage.set('country_code', info.countryCode);
      },
      (err) => console.log('Unable to get sim info: ', err)
    );
  }
}
