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
import { Chat } from '../providers/chat';
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
		private chatPrvd: Chat,
        private gps: Gps
	) {
		this.platform.registerBackButtonAction(() => {
            this.toolsPrvd.doBackButton();
            return true;
        });
		this.platform.ready().then(() => {
			if(!this.storage.get('count_app_restarted') || this.storage.get('count_app_restarted') < 5){
				this.storage.set('show_lp_note',true);
				this.chatPrvd.show_lp_note = true;
				this.storage.set('show_ap_note',true);
				this.chatPrvd.show_ap_note = true;
				let counter = !this.storage.get('count_app_restarted')?1:parseInt(this.storage.get('count_app_restarted')) + 1;
				this.storage.set('count_app_restarted',counter);
			}else{
				this.storage.set('show_lp_note',false);
				this.storage.set('show_ap_note',false);
			}
		});
		this.platform.ready().then(() => {
			this.deeplinks.routeWithNavController(this.navChild, {
				'/login': LogInPage,
				'/landing/:messagePermalink': ChatPage      
			}).subscribe((match) => {
				if(match.$args){
					this.toolsPrvd.showSplashScreen();
					this.initCheckLogin(match.$args.messagePermalink);
				}else{
					this.init();
				}
			}, (nomatch) => { 
				
				this.init();
				/* this.toolsPrvd.showSplashScreen(); 
				console.log('show splash');
				this.initCheckLogin(464);  */
			});
		}); 
       
        this.platform.ready().then(() => {
			this.pushSetup();
        });

        this.storage.rm('custom_coordinates');
    }

    pushSetup(){
        const options: PushOptions = {
            android: {
                senderID:'650336583017',
				forceShow: true
            },
            ios: {
                alert: 'true',
                badge: true,
                sound: 'true'
            }
        };

        const pushObject: PushObject = this.push.init(options);
		
        pushObject.on('notification').subscribe((notification: any) => {
			this.toolsPrvd.showSplashScreen(); 
			if(notification.additionalData.foreground){
				this.toolsPrvd.hideSplashScreen();
			}else{
				let message  = JSON.parse(notification.additionalData.child_message);
				pushObject.finish().then(e => {
					if(message.id){
						this.initCheckLogin(message.id); 
					}else{
						this.goToPage();
					}
				});
			}
        });
        pushObject.on('registration').subscribe((registration: any) => {
            this.authPrvd.setDeviceRegistration(registration.registrationId);
        });
    }

    public init = () => {
		this.network.networkStatus();
        this.getLogin();
        this.getSimInfo();
        this.statusBar.styleDefault();
    };
	
	public initCheckLogin(messageParamsId){
		let authType = this.authPrvd.getAuthType();
        let authData = this.authPrvd.getAuthData();
		this.getSimInfo();
        if (authType && authData) {
		  this.chatPrvd.getMessageIDDetails(messageParamsId,true).subscribe(res => {	
			this.app.getRootNav().setRoot(ChatPage, {message:res.message});	
		  });
		}else{
			this.toolsPrvd.hideSplashScreen();
		}		
	}

    private goToPage():void {
		this.app.getRootNav().setRoot(ChatPage);
        this.toolsPrvd.hideSplashScreen();
    }

    private getLogin() {
        let authType = this.authPrvd.getAuthType();
        let authData = this.authPrvd.getAuthData();

        if (authType && authData) {
            switch (authType) {
                case 'facebook':
                    this.authPrvd.getFbLoginStatus().then(data => {
                        this.goToPage();
                    });
                    break;
                case 'email':
                    this.goToPage();
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
			this.storage.set('country_code', info.countryCode);
		},
		err => console.error('Unable to get sim info: ', err));
    }
	
	
	 
}
