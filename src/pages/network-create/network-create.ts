import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// Pages
import { ProfilePage } from '../profile/profile';
import { NetworkContactListPage } from '../network-contact-list/network-contact-list';

@Component({
  selector: 'page-network-create',
  templateUrl: 'network-create.html'
})
export class NetworkCreatePage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams
  ) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad NetworkCreatePage');
  }

  goToProfile() {
    this.navCtrl.push(ProfilePage);
  }

  sendEmails() {
    this.navCtrl.push(NetworkContactListPage, { type: 'emails' });
  }

  sendSMS() {
    this.navCtrl.push(NetworkContactListPage, { type: 'phones' });
  }

  goBack() { this.navCtrl.pop(); }

}
