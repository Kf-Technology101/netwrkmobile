import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// Page
import { UndercoverPage } from '../undercover/undercover';
import { NetworkFaqPage } from '../network-faq/network-faq';
import { NetworkCreatePage } from '../network-create/network-create';

@Component({
  selector: 'page-network-no',
  templateUrl: 'network-no.html'
})
export class NetworkNoPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams
  ) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad NetworkNoPage');
  }

  doFounder() {
    this.navCtrl.push(NetworkCreatePage);
  }

  goUndercover() {
    this.navCtrl.push(UndercoverPage);
  }

  goFaq() {
    this.navCtrl.push(NetworkFaqPage);
  }

}
