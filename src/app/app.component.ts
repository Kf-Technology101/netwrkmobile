import { Component,ViewChild  } from '@angular/core';
import { Platform, Events, App, Nav, AlertController } from 'ionic-angular';
import { Sim } from '@ionic-native/sim';
import { StatusBar } from '@ionic-native/status-bar';
import { Push, PushObject, PushOptions } from '@ionic-native/push';

import { Deeplinks } from '@ionic-native/deeplinks';
// Pages
import { LogInPage } from '../pages/log-in/log-in';
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
        private alertCtrl: AlertController,
        private apiPrvd: Api,
        private permission: PermissionsService,
        private network: NetworkCheck,
        private push: Push,
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
            this.authPrvd.removeDeviceRegistration();
            this.pushSetup();
        });

        this.storage.rm('custom_coordinates');
    }

    pushSetup(){
        const options: PushOptions = {
            android: {
                senderID:'650336583017'
            },
            ios: {
                alert: 'true',
                badge: true,
                sound: 'true'
            }
        };

        const pushObject: PushObject = this.push.init(options);

        pushObject.on('notification').subscribe((notification: any) => {
            console.log('Received a notification', notification);
            if (notification.additionalData.foreground) {

            } else {
                let authType = this.authPrvd.getAuthType();
                let authData = this.authPrvd.getAuthData();

                if (authType && authData) {
                    this.toolsPrvd.pushPage(ChatPage, {
                        message: notification.notification.child_message
                    });
                }
            }
        });

        pushObject.on('registration').subscribe((registration: any) => {
            console.log('Device Registration', registration);
            this.authPrvd.setDeviceRegistration(registration.registrationId);
        });

        pushObject.on('error').subscribe(error => {
            console.error('Error with Push plugin', error)
        });
    }

    public init = () => {
        this.network.networkStatus();
        this.getLogin();
        this.getSimInfo();
        this.statusBar.styleDefault();
    };

    private goToPage(root:any):void {
        this.gps.getMyZipCode().then(res => {
            this.app.getRootNav().setRoot(ChatPage);
        }, err => this.app.getRootNav().setRoot(ChatPage));
        this.toolsPrvd.hideSplashScreen();
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
                            root = this.undercoverPrvd.getCharacterPerson(HoldScreenPage, ChatPage);
                        }
                        this.goToPage(root);
                    });
                    break;
                case 'email':
                    let fbConnected = this.authPrvd.getFbConnected();
                    if (fbConnected) {
                        root = this.undercoverPrvd.getCharacterPerson(HoldScreenPage, ChatPage);
                    }
                    this.goToPage(root);
                    break;
                default:
                    this.toolsPrvd.hideSplashScreen();
                    break;
            }
        } else {
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
