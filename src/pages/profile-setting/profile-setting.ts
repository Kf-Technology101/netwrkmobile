import { Component } from '@angular/core';
import { App, AlertController,NavController } from 'ionic-angular';

// Pages
import { LogInPage } from '../log-in/log-in';
import { HoldScreenPage } from '../hold-screen/hold-screen';
import { NetwrklistPage } from '../netwrklist/netwrklist';

// Providers
import { Auth } from '../../providers/auth';
import { Tools } from '../../providers/tools';
import { SlideAvatar } from '../../providers/slide-avatar';
import { Settings } from '../../providers/settings';
import { LocationChange } from '../../providers/locationchange';
import { LocalStorage } from '../../providers/local-storage';



@Component({
  selector: 'page-profile-setting',
  templateUrl: 'profile-setting.html'
})
export class ProfileSettingPage {

  constructor(
    public navCtrl: NavController,
    public tools: Tools,
    public slideAvatarPrvd: SlideAvatar,
    public auth: Auth,
    private app: App,
    public settings: Settings,
    public locationchange: LocationChange,
    public storage: LocalStorage,
    public alertCtrl: AlertController
  ) { }

  public goBack():void {
    this.storage.set('_fromPrSett', true);
    this.tools.popPage();
  }

  public deactivateAccount():any {
    let alert = this.alertCtrl.create({
      subTitle: 'Are you sure you want to deactivate your account?',
      buttons: [{
        text: 'No',
        role: 'cancel'
      }, {
        cssClass: 'active',
        text: 'Yes',
        handler: () => {
          this.tools.showLoader();
          alert.dismiss();
          this.settings.sendDeactivationRequest()
          .subscribe(res => {
            console.log('Deactivation successful:', res);
            this.tools.hideLoader();
            this.tools.showToast('Deactivation successful');
            setTimeout(() => {
              this.storage.clear();
              this.tools.showLoader('Initializing logging out. Please wait...');
              setTimeout(() => {
                this.tools.hideLoader();
                this.logOut();
              }, 1500);
            }, 2000);
          }, err => {
            alert.dismiss();
            console.error('deactivation err:', err);
            this.tools.hideLoader();
            this.tools.showToast('Deactivation failed');
          });
          return false;
        }
      }]
    });
    alert.present();
  }

  private goToHoldScreen():void {
      this.tools.pushPage(NetwrklistPage);
  }

  ionViewWillLeave() {
    this.slideAvatarPrvd.changeCallback = null;
  }

  ionViewDidEnter() {
    this.settings.ucCameraState =  this.settings.getUCCameraState();
  }

  public logOut():void {
    this.auth.logout().then(res => {
      console.log('logout res:', res);
        this.storage.rm('social_auth_data');
        this.app.getRootNav().setRoot(LogInPage);
        this.storage.rm('auth_data');
        this.storage.rm('auth_type');
    }).catch(err => console.error('logout error: ', err));
  }
}
