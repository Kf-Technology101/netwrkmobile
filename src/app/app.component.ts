import { Component,ViewChild  } from '@angular/core';
import { Platform, Events, App, Nav } from 'ionic-angular';
import { Sim } from '@ionic-native/sim';
import { StatusBar } from '@ionic-native/status-bar';
import { CameraPreview } from '@ionic-native/camera-preview';

import { Deeplinks } from '@ionic-native/deeplinks';
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

    rootPage:any = LogInPage;

   @ViewChild(Nav) navChild:Nav;

    constructor(
        public platform: Platform,
        public app: App,
        public events: Events,
        private authPrvd: Auth,
        public deeplinks: Deeplinks,
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

        this.deeplinks.routeWithNavController(this.navChild, {
            '/login': LogInPage,
            '/landing': ChatPage
        }).subscribe((match) => {
            console.log('Successfully routed', match);
            this.getLogin();
            this.getSimInfo();
        }, (err) => {
            console.log('Unmatched Route', err);
        });

        this.init();

        platform.ready().then(() => {
            permission.checkCameraPermissions().then(permissionOk => {
                this.storage.set('enable_uc_camera', permissionOk ? true : false);

                if(platform.is('android')) {
                    permission.checkAll().then(res => {
                        this.init();
                    }, err => console.error(err));
                } else {
                    this.init();
                }
            });
        });
    }

    public init = () => {
        this.gps.getMyZipCode().then(res => {
            if (res && res.zip_code)
                this.storage.set('chat_zip_code', res.zip_code);
            this.network.networkStatus(); // watch for network status
            this.getLogin();
            this.getSimInfo();
            this.statusBar.styleDefault();
        });
    };

    private goToPage(root:any):void {
        this.gps.getMyZipCode().then(res => {
            this.app.getRootNav().setRoot(ChatPage);
        }, err => this.app.getRootNav().setRoot(ChatPage));
        this.toolsPrvd.hideSplashScreen();

        //this.toolsPrvd.hideSplashScreen();
        //if (root == NetworkFindPage) {
        //    this.toolsPrvd.hideSplashScreen();
        //    this.app.getRootNav().setRoot(ChatPage, {
        //        action: 'undercover'
        //    });
        //} else {
        //    this.toolsPrvd.hideSplashScreen();
        //    this.app.getRootNav().setRoot(root);
        //}
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
