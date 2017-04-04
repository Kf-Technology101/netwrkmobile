import { Component } from '@angular/core';
import { Platform, Events, App } from 'ionic-angular';
import { StatusBar, Splashscreen, Sim } from 'ionic-native';

// Pages
// import { LogInPage } from '../pages/log-in/log-in/';
// import { HomePage } from '../pages/home/home';
// import { ProfilePage } from '../pages/profile/profile';
// import { ProfileSettingPage } from '../pages/profile-setting/profile-setting';
import { NetworkFindPage } from '../pages/network-find/network-find';
// import { NetworkNoPage } from '../pages/network-no/network-no';
import { UndercoverPage } from '../pages/undercover/undercover';
// import { CameraPage } from '../pages/camera/camera';
import { UndercoverCharacterPage } from '../pages/undercover-character/undercover-character';

// Providers
import { User } from '../providers/user';
import { LocalStorage } from '../providers/local-storage';
import { Tools } from '../providers/tools';

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
    public tools: Tools,
    public app: App
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

    this.app.viewDidEnter.subscribe((view) => {
      this.tools.subscribeViewDidEnter(view);
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
              this.rootPage = NetworkFindPage;
            } else {
              // this.rootPage = LogInPage;
            }
            Splashscreen.hide();
          });
          break;
        case 'email':
          this.rootPage = NetworkFindPage;
          Splashscreen.hide();
          break;
      }
    } else {
      // this.rootPage = LogInPage;
      // this.rootPage = NetworkFindPage;
      // this.rootPage = ProfilePage;
      // this.rootPage = UndercoverPage;
      // this.rootPage = CameraPage;
      this.rootPage = UndercoverCharacterPage;
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
