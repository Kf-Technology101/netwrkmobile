import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// Pages
import { UndercoverPage } from '../undercover/undercover';
import { ProfilePage } from '../profile/profile';
import { NetworkContactListPage } from '../network-contact-list/network-contact-list';

// Providers
import { Tools } from '../../providers/tools';
import { Network } from '../../providers/network';
import { Gps } from '../../providers/gps';
import { UndercoverProvider } from '../../providers/undercover';

@Component({
  selector: 'page-network-create',
  templateUrl: 'network-create.html'
})
export class NetworkCreatePage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public tools: Tools,
    public network: Network,
    public gps: Gps,
    public undercover: UndercoverProvider
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
    let data = { post_code: this.gps.zipCode };
    this.network.create(data)
      .map(res => res.json())
      .subscribe(res => {
        console.log(res);
        // this.undercover.setActivePerson(false);
        // this.tools.pushPage(UndercoverPage);
      }, err => {
        console.log(err);
      });
  }

  goBack() { this.tools.popPage(); }

}
