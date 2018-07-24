import { Component } from '@angular/core';
import { Platform, Events, App } from 'ionic-angular';
import { Sim } from '@ionic-native/sim';
import { StatusBar } from '@ionic-native/status-bar';
import { CameraPreview } from '@ionic-native/camera-preview';

// Pages
import { NetworkPage } from '../pages/network/network';
import { LogInPage } from '../pages/log-in/log-in';
import { NetworkFindPage } from '../pages/network-find/network-find';
import { UndercoverCharacterPage } from '../pages/undercover-character/undercover-character';
import { ChatPage } from '../pages/chat/chat';
import { HoldScreenPage } from '../pages/hold-screen/hold-screen';

// Providers
import { Api } from '../providers/api';
import { Auth } from '../providers/auth';
import { Gps } from '../providers/gps';
import { LocalStorage } from '../providers/local-storage';
import { Tools } from '../providers/tools';
import { UndercoverProvider } from '../providers/undercover';
import { PermissionsService } from '../providers/permissionservice';
import { NetworkCheck } from '../providers/networkcheck';
import { UpgradeAdapter } from '@angular/upgrade';

@Component({
  templateUrl: 'app.html'
})

export class MyApp {

  rootPage:any=LogInPage;

  constructor(
    public platform: Platform,
    public app: App,
    public events: Events,
    private authPrvd: Auth,
    private storage: LocalStorage,
    private toolsPrvd: Tools,
    private undercoverPrvd: UndercoverProvider,
    public statusBar: StatusBar,
    private sim: Sim,
    private apiPrvd: Api,
    private cameraPreview: CameraPreview,
    private permission: PermissionsService,
    private network: NetworkCheck,
    private gps: Gps
  ) {

    platform.registerBackButtonAction(() => {
      this.toolsPrvd.doBackButton();
      return true;
    });

    let init = () => {
      this.gps.getMyZipCode().then(res => {
        if (res && res.zip_code)
          this.storage.set('chat_zip_code', res.zip_code);
          this.network.networkStatus(); // watch for network status
        // check if user is authorized
        this.apiPrvd.checkAuthStatus().subscribe(res => {
          this.getLogin();
          this.getSimInfo();
          this.statusBar.styleDefault();
        }, err => {
          if (err.status && err.status == 401) {
            this.app.getRootNav().setRoot(LogInPage);
            this.toolsPrvd.hideSplashScreen();
          }
        });
      });
    };

    init();

    platform.ready().then(() => {
      permission.checkCameraPermissions().then(permissionOk => {
        this.storage.set('enable_uc_camera', permissionOk ? true : false);

        if(platform.is('android')) {
          permission.checkAll().then(res => {
            init();
          }, err => console.error(err));
        } else {
            init();
        }
      });
    });
  }

  private goToPage(root:any):void {
    if (root == NetworkFindPage) {
      this.toolsPrvd.hideSplashScreen();
      this.app.getRootNav().setRoot(ChatPage, {
        action: 'undercover'
      });
    } else {
      this.toolsPrvd.hideSplashScreen();
      this.app.getRootNav().setRoot(root);
    }
  }

  private getLogin() {
    let authType = this.authPrvd.getAuthType();
    let authData = this.authPrvd.getAuthData();

    if (authType && authData) {
      let root:any;
      switch (authType) {
        case 'facebook':
          this.authPrvd.getFbLoginStatus().then(data => {
            if (data.status && data.status == 'connected') {
              root = this.undercoverPrvd.getCharacterPerson(
                  HoldScreenPage, NetworkFindPage, ChatPage)
            }
            this.goToPage(root);
          });
          break;
        case 'email':
          let fbConnected = this.authPrvd.getFbConnected();
          if (fbConnected) {
            root = this.undercoverPrvd.getCharacterPerson(
                HoldScreenPage, NetworkFindPage, ChatPage)
          }
          this.goToPage(root);
          break;
        default:
        this.gps.getMyZipCode().then(res => {
          this.app.getRootNav().setRoot(LogInPage);
        }, err => this.app.getRootNav().setRoot(LogInPage));
        this.toolsPrvd.hideSplashScreen();
        break;
      }
    } else {
      this.gps.getMyZipCode().then(res => {
        this.app.getRootNav().setRoot(LogInPage);
      }, err => this.app.getRootNav().setRoot(LogInPage));
      this.toolsPrvd.hideSplashScreen();
    }
  }

  private getSimInfo() {
    this.sim.getSimInfo().then(info => {
      console.log('Sim info: ', info);
      this.storage.set('country_code', info.countryCode);
    },
    err => console.error('Unable to get sim info: ', err));
  }
}
