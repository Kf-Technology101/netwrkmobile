import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// Page
import { UndercoverPage } from '../undercover/undercover';
import { NetworkFaqPage } from '../network-faq/network-faq';
import { NetworkCreatePage } from '../network-create/network-create';

// Providers
import { Tools } from '../../providers/tools';

@Component({
  selector: 'page-network-no',
  templateUrl: 'network-no.html'
})
export class NetworkNoPage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public tools: Tools
  ) {}

  doFounder() {
    this.tools.pushPage(NetworkCreatePage);
  }

  goUndercover() {
    this.tools.pushPage(UndercoverPage);
  }

  goFaq() {
    this.tools.pushPage(NetworkFaqPage);
  }

}
