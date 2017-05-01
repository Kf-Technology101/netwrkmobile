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
import { Chat } from '../../providers/chat';

@Component({
  selector: 'page-network',
  templateUrl: 'network.html'
})
export class NetworkPage {
  public users: Array<any> = [];
  public action: string;
  private textStrings: any = {};
  private networkParams: any = {};

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public toolsPrvd: Tools,
    public undercoverPrvd: UndercoverProvider,
    public gps: Gps,
    public networkPrvd: Network,
    public chatPrvd: Chat
  ) {
    this.action = this.navParams.get('action');
    this.networkParams = { post_code: this.gps.zipCode };
    this.textStrings.actionError = 'Something went wrong, please reload app and try again';
    this.textStrings.inviteError = 'Please, invite 20 or more friends for create netwrk';
    this.textStrings.created = 'The netwrk already created, please wait for connections';
    this.textStrings.joined = 'You have already joined, please wait for connections';
  }

  public goToProfile(data: any) {
    this.toolsPrvd.pushPage(ProfilePage, { id: data.id, public: true });
  }

  public sendEmails() {
    this.toolsPrvd.pushPage(NetworkContactListPage, { type: 'emails' });
  }

  public sendSMS() {
    this.toolsPrvd.pushPage(NetworkContactListPage, { type: 'phones' });
  }

  public doAction() {
    switch(this.action) {
      case 'create':
        this.doCreate();
      break;
      case 'join':
        this.doJoin();
      break;
      default: this.toolsPrvd.showToast(this.textStrings.actionError);
    }
  }

  private doCreate() {
    let access = this.networkPrvd.getInviteAccess();
    console.log(access);
    if (!access) {
      this.toolsPrvd.showToast(this.textStrings.inviteError);
      return false;
    }

    this.networkPrvd.create(this.networkParams).subscribe(res => {
      console.log(res);
      this.users = this.formateAvatarUrl(res.users);
      this.toolsPrvd.showToast(this.textStrings.created);
    }, err => {
      console.log(err);
      this.toolsPrvd.showToast(this.textStrings.created);
    });
  }

  private formateAvatarUrl(users: any) {
    for (let u in users) {
      if (!users[u].avatar_url) {
        users[u].avatar_url = this.toolsPrvd.defaultAvatar;
        console.log('!users[u].avatar_url', users[u].avatar_url)
      } else {
        users[u].avatar_url = this.chatPrvd.hostUrl + users[u].avatar_url;
        console.log('users[u].avatar_url', users[u].avatar_url)
      }
    }
    return users;
  }

  private doJoin() {

    this.networkPrvd.join(this.networkParams).subscribe(res => {
      console.log(res);
      this.users = this.formateAvatarUrl(res.users);
      this.afterJoin();
    }, err => {
      console.log(err);
      this.afterJoin();
    });
  }

  private afterJoin() {
    if (this.users.length >= 10) {
      let params: any = {
        action: 'netwrk',
        zipCode: this.navParams.get('zipCode'),
      };

      this.chatPrvd.setZipCode(this.gps.zipCode);
      this.chatPrvd.setState(params.action);
      this.toolsPrvd.pushPage(ChatPage, params);
    } else {
      this.toolsPrvd.showToast(this.textStrings.joined);
    }
  }

  private getUsers() {
    if (this.action == 'create') return;
    this.networkPrvd.getUsers(this.networkParams).subscribe(res => {
      console.log(res);
      this.users = this.formateAvatarUrl(res);;
    }, err => {
      console.log(err);
    });
  }

  goBack() { this.toolsPrvd.popPage(); }

  ionViewDidLoad() {
    this.getUsers();
    console.log('ionViewDidLoad NetworkPage');
  }

}
