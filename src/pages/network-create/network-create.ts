import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// Pages
import { ProfilePage } from '../profile/profile';
import { NetworkContactListPage } from '../network-contact-list/network-contact-list';

import { Tools } from '../../providers/tools';

@Component({
  selector: 'page-network-create',
  templateUrl: 'network-create.html'
})
export class NetworkCreatePage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public tools: Tools
  ) {}

  goToProfile() {
    this.tools.pushPage(ProfilePage);
  }

  sendEmails() {
    this.tools.pushPage(NetworkContactListPage, { type: 'emails' });
  }

  sendSMS() {
    this.tools.pushPage(NetworkContactListPage, { type: 'phones' });
  }

  doAction() {

  }

  goBack() { this.tools.popPage(); }

}
