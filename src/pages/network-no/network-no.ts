import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// Pages
import { ChatPage } from '../chat/chat';
import { NetworkFaqPage } from '../network-faq/network-faq';
import { NetworkPage } from '../network/network';
import { UndercoverCharacterPage } from '../undercover-character/undercover-character';

// Providers
import { Tools } from '../../providers/tools';
import { UndercoverProvider } from '../../providers/undercover';
import { Chat } from '../../providers/chat';
import { Gps } from '../../providers/gps';
import { Auth } from '../../providers/auth';

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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public tools: Tools,
    public undercoverPrvd: UndercoverProvider,
    public chatPrvd: Chat,
    public gps: Gps,
    public authPrvd: Auth
  ) {
    this.chatPrvd.removeNetwork();
    this.user = this.authPrvd.getAuthData();
  }

  doFounder() {
    let params: any = {
      action: this.navParams.get('action'),
      zipCode:  this.chatPrvd.localStorage.get('chat_zip_code')
    };

    this.tools.pushPage(NetworkPage, params);
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

  goFaq() {
    this.tools.pushPage(NetworkFaqPage);
  }

  ionViewWillLeave() {
    if (this.chatPrvd.localStorage.get('fist_time_noarea') === null)
      this.chatPrvd.localStorage.set('fist_time_noarea', false);
  }
}
