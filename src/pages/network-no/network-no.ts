import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// Pages
import { UndercoverPage } from '../undercover/undercover';
import { NetworkFaqPage } from '../network-faq/network-faq';
import { NetworkCreatePage } from '../network-create/network-create';
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
    public undercover: UndercoverProvider
  ) {}

  doFounder() {
    this.tools.pushPage(NetworkCreatePage);
  }

  goUndercover() {
    if (this.undercover.getPerson()) {
      this.undercover.setActivePerson(true);
      this.tools.pushPage(UndercoverPage);
    } else {
      this.tools.pushPage(UndercoverCharacterPage);
    }
  }

  goFaq() {
    this.tools.pushPage(NetworkFaqPage);
  }

}
