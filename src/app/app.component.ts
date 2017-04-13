import { Component } from '@angular/core';
import { Platform, Events, App } from 'ionic-angular';
import { StatusBar, Splashscreen, Sim } from 'ionic-native';

// Pages
import { LogInPage } from '../pages/log-in/log-in';
import { NetworkFindPage } from '../pages/network-find/network-find';
// import { HomePage } from '../pages/home/home';
// import { ProfilePage } from '../pages/profile/profile';
// import { ProfileSettingPage } from '../pages/profile-setting/profile-setting';
// import { NetworkNoPage } from '../pages/network-no/network-no';
// import { NetworkPage } from '../pages/network/network';
import { ChatPage } from '../pages/chat/chat';
// import { CameraPage } from '../pages/camera/camera';
// import { UndercoverCharacterPage } from '../pages/undercover-character/undercover-character';
// import { SignUpConfirmPage } from '../pages/sign-up-confirm/sign-up-confirm';
import { SignUpFacebookPage } from '../pages/sign-up-facebook/sign-up-facebook';

// Providers
import { Auth } from '../providers/auth';
import { LocalStorage } from '../providers/local-storage';
import { Tools } from '../providers/tools';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage;

  constructor(
    platform: Platform,
    public auth: Auth,
    public localStorage: LocalStorage,
    public events: Events,
    public tools: Tools,
    public app: App
  ) {
    platform.registerBackButtonAction(() => {
      this.tools.doBackButton();
      return false;
    });

    platform.ready().then(() => {
      this.getLogin();
      this.getSimInfo();

      StatusBar.styleDefault();
    });

    this.app.viewDidEnter.subscribe((view) => {
      this.tools.subscribeViewDidEnter(view);
    });
  }

  private getLogin() {
    let authType = this.auth.getAuthType();
    let authData = this.auth.getAuthData();

    if (authType && authData) {
      switch (authType) {
        case 'facebook':
          this.auth.getFbLoginStatus().then((data) => {
            if (data.status && data.status == 'connected') {
              this.rootPage = NetworkFindPage;
            } else {
              this.rootPage = LogInPage;
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
      this.rootPage = ChatPage;
      // this.rootPage = CameraPage;
      // this.rootPage = UndercoverCharacterPage;
      // this.rootPage = SignUpConfirmPage;
      // this.rootPage = SignUpFacebookPage;
    }
  }

  private getSimInfo() {
    Sim.getSimInfo().then(
      (info) => {
        console.log('Sim info: ', info);
        this.localStorage.set('country_code', info.countryCode);
      },
      (err) => console.log('Unable to get sim info: ', err)
    );
  }
}
