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

@Component({
  selector: 'page-network-no',
  templateUrl: 'network-no.html'
})
export class NetworkNoPage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public tools: Tools,
    public undercoverPrvd: UndercoverProvider
  ) {}

  doFounder() {
    let params: any = {
      action: this.navParams.get('action'),
      zipCode: this.navParams.get('zipCode'),
    };

    this.tools.pushPage(NetworkPage, params);
  }

  goUndercover() {
    if (this.undercoverPrvd.getPerson()) {
      this.undercoverPrvd.setActivePerson(true);
      this.tools.pushPage(ChatPage);
    } else {
      this.tools.pushPage(UndercoverCharacterPage);
    }
  }

  goFaq() {
    this.tools.pushPage(NetworkFaqPage);
  }

}
