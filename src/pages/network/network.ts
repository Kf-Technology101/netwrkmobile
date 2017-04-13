import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// Pages
import { ChatPage } from '../chat/chat';
import { ProfilePage } from '../profile/profile';
import { NetworkContactListPage } from '../network-contact-list/network-contact-list';

// Providers
import { Tools } from '../../providers/tools';
import { UndercoverProvider } from '../../providers/undercover';
import { Network } from '../../providers/network';
import { Gps } from '../../providers/gps';

@Component({
  selector: 'page-network',
  templateUrl: 'network.html'
})
export class NetworkPage {
  public people: Array<any> = [];
  public action: string;
  private textStrings: any = {};
  private networkParams: any = {};

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public tools: Tools,
    public undercoverPrvd: UndercoverProvider,
    public gps: Gps,
    public networkPrvd: Network
  ) {
    this.action = this.navParams.get('action');
    this.networkParams = { post_code: this.gps.zipCode };
    this.textStrings.actionError = 'Something went wrong, please reload app and try again';
    this.textStrings.inviteError = 'Please, invite 20 or more friends for create netwrk';
    this.textStrings.created = 'The netwrk already created, please wait for connections';
  }

  goToProfile(data: any) {
    this.tools.pushPage(ProfilePage, { id: data.id });
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
      default: this.tools.showToast(this.textStrings.actionError);
    }
  }

  private doCreate() {
    let access = this.networkPrvd.getInviteAccess();
    console.log(access);
    if (!access) {
      this.tools.showToast(this.textStrings.inviteError);
      return false;
    }

    this.networkPrvd.create(this.networkParams)
      .map(res => res.json())
      .subscribe(res => {
        console.log(res);
        // this.undercover.setActivePerson(false);
        // this.tools.pushPage(ChatPage);
        this.tools.pushPage(ChatPage);
        this.tools.showToast(this.textStrings.created);
      }, err => {
        console.log(err);
        this.tools.pushPage(ChatPage);
        this.tools.showToast(this.textStrings.created);
      });
  }

  private doJoin() {
    this.networkPrvd.join(this.networkParams)
      .map(res => res.json())
      .subscribe(res => {
        console.log(res);
        // this.undercover.setActivePerson(false);
        this.tools.pushPage(ChatPage);
      }, err => {
        console.log(err);
        this.tools.pushPage(ChatPage);
      });
  }

  private getUsers() {
    this.networkPrvd.getUsers(this.networkParams)
      .map(res => res.json())
      .subscribe(res => {
        console.log(res);
        this.people = res;
      }, err => {
        console.log(err);
      });
  }

  goBack() { this.tools.popPage(); }

  ionViewDidLoad() {
    this.getUsers();
    console.log('ionViewDidLoad NetworkPage');
  }

}
