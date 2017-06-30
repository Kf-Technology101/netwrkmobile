import { Component } from '@angular/core';
import { Platform, Events, App } from 'ionic-angular';
import { Sim } from '@ionic-native/sim';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// Pages
import { LogInPage } from '../pages/log-in/log-in';
import { NetworkFindPage } from '../pages/network-find/network-find';
import { UndercoverCharacterPage } from '../pages/undercover-character/undercover-character';
// import { SignUpFacebookPage } from '../pages/sign-up-facebook/sign-up-facebook';
import { ChatPage } from '../pages/chat/chat';
// import { HomePage } from '../pages/home/home';
// import { ProfilePage } from '../pages/profile/profile';
// import { ProfileSettingPage } from '../pages/profile-setting/profile-setting';
// import { NetworkNoPage } from '../pages/network-no/network-no';
// import { NetworkPage } from '../pages/network/network';
// import { CameraPage } from '../pages/camera/camera';
// import { SignUpConfirmPage } from '../pages/sign-up-confirm/sign-up-confirm';

// Providers
import { Api } from '../providers/api';
import { Auth } from '../providers/auth';
import { LocalStorage } from '../providers/local-storage';
import { Tools } from '../providers/tools';
import { UndercoverProvider } from '../providers/undercover';
import { PermissionsService } from '../providers/permissionservice';

import { CameraPreview } from '@ionic-native/camera-preview';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage;

  constructor(
    public platform: Platform,
    public app: App,
    public events: Events,
    private authPrvd: Auth,
    private localStoragePrvd: LocalStorage,
    private toolsPrvd: Tools,
    private undercoverPrvd: UndercoverProvider,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private sim: Sim,
    private apiPrvd: Api,
    private cameraPreview: CameraPreview,
    private permission: PermissionsService
  ) {
    platform.registerBackButtonAction(() => {
      this.toolsPrvd.doBackButton();
      return false;
    });

    platform.ready().then(() => {
      // this.apiPrvd.watchForConnect(); // watch for network connect
      // this.apiPrvd.watchForDisconnect(); // watch for network disconnect
      this.getLogin();
      this.getSimInfo();
      this.statusBar.styleDefault();
    });

    let cameraPreviewOpts = {
      x: 0,
      y: 0,
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      camera: 'rear',
      tapPhoto: false,
      previewDrag: true,
      toBack: true,
      alpha: 1
    }

    permission.checkCameraPermissions().then(permissionOk => {
      if (permissionOk) {
        this.cameraPreview.startCamera(cameraPreviewOpts).then(res => {
        }).catch(err => {
          console.error(err);
        });
      }
      else {
        console.log('[permission] Camera: balls.');
      }
    });
  }

  private getLogin() {
    let authType = this.authPrvd.getAuthType();
    let authData = this.authPrvd.getAuthData();

    if (authType && authData) {
      switch (authType) {
        case 'facebook':
          this.authPrvd.getFbLoginStatus().then(data => {
            let root:any;
            if (data.status && data.status == 'connected') {
              root = this.undercoverPrvd.getCharacterPerson(
              UndercoverCharacterPage, NetworkFindPage, ChatPage)
            }
            if (root == NetworkFindPage) {
              this.app.getRootNav().setRoot(ChatPage, {
                action: 'undercover'
              });
            } else {
              this.rootPage = root;
            }
            this.splashScreen.hide();
          });
          break;
        case 'email':
          let fbConnected = this.authPrvd.getFbConnected();
          let root:any;
          if (fbConnected) {
            root = this.undercoverPrvd.getCharacterPerson(
            UndercoverCharacterPage, NetworkFindPage, ChatPage)
          }
          if (root == NetworkFindPage) {
            this.app.getRootNav().setRoot(ChatPage, {
              action: 'undercover'
            });
          } else {
            this.rootPage = root;
          }

          this.splashScreen.hide();
          break;
        default:
          this.rootPage = LogInPage;
      }
    } else {
      this.rootPage = LogInPage;
      // this.rootPage = NetworkFindPage;
      // this.rootPage = ProfilePage;
      // this.rootPage = ChatPage;
      // this.rootPage = CameraPage;
      // this.rootPage = UndercoverCharacterPage;
      // this.rootPage = SignUpConfirmPage;
      // this.rootPage = SignUpFacebookPage;
      // this.rootPage = ProfileSettingPage;
      this.splashScreen.hide();
    }
  }

  private getSimInfo() {
    this.sim.getSimInfo().then(info => {
      console.log('Sim info: ', info);
      this.localStoragePrvd.set('country_code', info.countryCode);
    },
    err => console.error('Unable to get sim info: ', err));
  }
}
