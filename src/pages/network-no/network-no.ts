import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';

// Pages
import { ChatPage } from '../chat/chat';
import { NetworkPage } from '../network/network';
import { UndercoverCharacterPage } from '../undercover-character/undercover-character';
import { ProfilePage } from '../profile/profile';
import { NetworkContactListPage } from '../network-contact-list/network-contact-list';

// Providers
import { Tools } from '../../providers/tools';
import { UndercoverProvider } from '../../providers/undercover';
import { Chat } from '../../providers/chat';
import { Gps } from '../../providers/gps';
import { Auth } from '../../providers/auth';
import { NetworkProvider } from '../../providers/networkservice';

// Animations
import { toggleFade, scaleMainBtn } from '../../includes/animations';

@Component({
  selector: 'page-network-no',
  templateUrl: 'network-no.html',
  animations: [
    toggleFade,
    scaleMainBtn
  ]
})
export class NetworkNoPage {
  private user:any;
  private networkUsers:any = [];
  public uniqueUsers:number = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public tools: Tools,
    public undercoverPrvd: UndercoverProvider,
    public chatPrvd: Chat,
    public gps: Gps,
    public authPrvd: Auth,
    public networkPrvd: NetworkProvider,
    public alertCtrl: AlertController
  ) {
    this.chatPrvd.removeNetwork();
    this.user = this.authPrvd.getAuthData();
  }

  doFounder() {
    let params: any = {
      areaInviteMode: true,
      action: this.navParams.get('action'),
      zipCode:  this.chatPrvd.localStorage.get('chat_zip_code')
    };

    this.tools.pushPage(NetworkPage, params);
  }

  private goContactList():void {
    let alert = this.alertCtrl.create({
      subTitle: 'Become a part of the local broadcast?',
      buttons: [{
        text: 'Not now',
        role: 'cancel'
      }, {
        cssClass: 'active',
        text: 'Sure',
        handler: () => {
          console.log('joinNetwork handler');
          alert.dismiss();
          this.tools.pushPage(NetworkContactListPage, {
            type: 'emails',
            show_share_dialog: true
          });
          return false;
        }
      }]
    });
    alert.present();
  }

  goUndercover() {
    let params: any = {
      action: 'undercover',
      zipCode: this.chatPrvd.localStorage.get('chat_zip_code')
    };

    this.chatPrvd.setZipCode(params.zipCode);
    this.chatPrvd.setState(params.action);
    this.navCtrl.setRoot(ChatPage, params);
  }

  public goToProfile(data: any) {
    this.tools.pushPage(ProfilePage, { id: data.id, public: true });
  }

  private getUsers():void {
    let netPar:any = {
      post_code: this.chatPrvd.localStorage.get('chat_zip_code')
    };
    this.networkPrvd.getUsers(netPar).subscribe(res => {
      if (res) {
        this.networkUsers = res.users;
        this.uniqueUsers = res.unique_users;
      }
    }, err => console.error(err));
  }

  ionViewDidEnter() {
    this.getUsers();
  }

  ionViewWillLeave() {
    if (this.chatPrvd.localStorage.get('fist_time_noarea') === null)
      this.chatPrvd.localStorage.set('fist_time_noarea', false);
  }
}
