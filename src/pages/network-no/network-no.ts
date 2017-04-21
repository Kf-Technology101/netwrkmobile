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

@Component({
  selector: 'page-network-no',
  templateUrl: 'network-no.html'
})
export class NetworkNoPage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public tools: Tools,
    public undercoverPrvd: UndercoverProvider,
    public chatPrvd: Chat,
    public gps: Gps
  ) {}

  doFounder() {
    let params: any = {
      action: this.navParams.get('action'),
      zipCode: this.navParams.get('zipCode'),
    };

    this.tools.pushPage(NetworkPage, params);
  }

  goUndercover() {
    let params: any = {
      action: 'undercover',
      zipCode: this.navParams.get('zipCode'),
    };

    this.chatPrvd.setZipCode(this.gps.zipCode);
    this.chatPrvd.setState(params.action);
    this.tools.pushPage(ChatPage, params);
  }

  goFaq() {
    this.tools.pushPage(NetworkFaqPage);
  }

}
