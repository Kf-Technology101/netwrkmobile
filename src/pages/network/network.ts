import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// Pages
import { ChatPage } from '../chat/chat';
import { ProfilePage } from '../profile/profile';
import { NetworkContactListPage } from '../network-contact-list/network-contact-list';

// Providers
import { Tools } from '../../providers/tools';
import { Undercover } from '../../providers/undercover';
import { Network } from '../../providers/network';
import { Gps } from '../../providers/gps';

@Component({
  selector: 'page-network',
  templateUrl: 'network.html'
})
export class NetworkPage {
  public people: Array<any>;
  public action: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public tools: Tools,
    public undercoverPrvd: Undercover,
    public gps: Gps,
    public networkPrvd: Network
  ) {
    this.action = this.navParams.get('action');
  }

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
    switch(this.action) {
      case 'create':
        this.doCreate();
      break;
      case 'join':
        this.doJoin();
      break;
      default: this.tools.showToast('Error');
    }
  }

  private doCreate() {
    let data = { post_code: this.gps.zipCode };
    this.networkPrvd.create(data)
      .map(res => res.json())
      .subscribe(res => {
        console.log(res);
        // this.undercover.setActivePerson(false);
        // this.tools.pushPage(ChatPage);
      }, err => {
        console.log(err);
      });
  }

  private doJoin() {
    let data = { post_code: this.gps.zipCode };
    this.networkPrvd.join(data)
      .map(res => res.json())
      .subscribe(res => {
        console.log(res);
        // this.undercover.setActivePerson(false);
        // this.tools.pushPage(ChatPage);
      }, err => {
        console.log(err);
      });
  }

  goBack() { this.tools.popPage(); }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NetworkPage');
  }

}
