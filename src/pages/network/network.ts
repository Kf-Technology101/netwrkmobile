import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// Pages
import { ChatPage } from '../chat/chat';
import { ProfilePage } from '../profile/profile';
import { NetworkContactListPage } from '../network-contact-list/network-contact-list';

// Providers
import { Tools } from '../../providers/tools';
import { UndercoverProvider } from '../../providers/undercover';
import { NetworkProvider } from '../../providers/network';
import { Gps } from '../../providers/gps';
import { Chat } from '../../providers/chat';
import { Auth } from '../../providers/auth';

@Component({
  selector: 'page-network',
  templateUrl: 'network.html'
})
export class NetworkPage {
  public user: any = {};
  public users: Array<any> = [];
  public action: string;
  public invitationSent: boolean = false;
  public joined: boolean = false;
  public isUndercover: boolean = true;
  private textStrings: any = {};
  private networkParams: any = {};
  private accessed: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public toolsPrvd: Tools,
    public undercoverPrvd: UndercoverProvider,
    public gpsPrvd: Gps,
    public networkPrvd: NetworkProvider,
    public chatPrvd: Chat,
    public authPrvd: Auth
  ) {
    this.action = this.navParams.get('action');
    this.accessed = this.navParams.get('accessed');
    this.networkParams = { post_code: this.chatPrvd.localStorage.get('chat_zip_code') };
    this.user = this.authPrvd.getAuthData();

    this.textStrings.actionError = 'Something went wrong, please reload app and try again';
    this.textStrings.inviteError = 'Please, invite 20 or more friends for create netwrk';
    this.textStrings.created = 'The netwrk already created, please wait for connections';
    this.textStrings.joined = 'You have already joined, please wait for connections';
  }

  public goToProfile(data: any) {
    this.toolsPrvd.pushPage(ProfilePage, { id: data.id, public: true });
  }

  public sendEmails() {
    let params = {
      type: 'emails',
      accessed: this.accessed,
    };

    this.toolsPrvd.pushPage(NetworkContactListPage, params);
  }

  public sendSMS() {
    let params = {
      type: 'phones',
      accessed: this.accessed,
    };

    this.toolsPrvd.pushPage(NetworkContactListPage, params);
  }

  public doAction() {
    if (this.joined || this.accessed) {
      let state = this.isUndercover ? 'undercover' : 'area';
      this.chatPrvd.setState(state);

      let params: any = {
        zipCode: this.gpsPrvd.zipCode,
        action: this.chatPrvd.getState()
      };

      this.toolsPrvd.pushPage(ChatPage, params);
    } else {
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
  }

  private doCreate() {
    let access = this.networkPrvd.getInviteAccess();
    console.log(access);
    if (!access) {
      this.toolsPrvd.showToast(this.textStrings.inviteError);
      return false;
    }

    this.networkPrvd.create(this.networkParams).subscribe(user => {
      console.log(user);
      this.joined = true;
      this.users.push(user);
      this.toolsPrvd.showToast(this.textStrings.created);
    }, err => {
      console.log(err);
      this.toolsPrvd.showToast(this.textStrings.created);
    });
  }

  private formateAvatarUrl(users: any) {
    for (let u in users) {
      if (this.user.id == users[u].id) this.joined = true;
    }
    return users;
  }

  private doJoin() {

    this.networkPrvd.join(this.networkParams).subscribe(res => {
      console.log(res);
      let user = this.authPrvd.getAuthData();
      this.users.push(user);
      this.joined = true;
      this.afterJoin();
    }, err => {
      console.log(err);
      this.afterJoin();
    });
  }

  private afterJoin() {
    console.log('this.users', this.users);
    if (this.users.length >= 10) {
      let params: any = {
        action: 'netwrk',
        zipCode: this.navParams.get('zipCode'),
      };

      this.chatPrvd.setZipCode(this.gpsPrvd.zipCode);
      this.chatPrvd.setState(params.action);
      this.toolsPrvd.pushPage(ChatPage, params);
    } else {
      this.toolsPrvd.showToast(this.textStrings.joined);
      this.accessed = true;
    }
  }

  private getUsers() {
    if (this.action == 'create') return;
    this.networkPrvd.getUsers(this.networkParams).subscribe(res => {
      this.users = this.formateAvatarUrl(res);
      if (this.users.length >= 10) {
        this.isUndercover = false;
      }
    }, err => {
      console.log(err);
    });
  }

  goBack() { this.toolsPrvd.popPage(); }

  ionViewDidEnter() {
    console.log('ionViewDidLoad NetworkPage');
    this.getUsers();

    let invitation = this.networkPrvd.getInviteZipAccess();
    let zipCode = this.gpsPrvd.zipCode;
    if (invitation.indexOf(zipCode) !== -1) {
      this.invitationSent = true;
    }
  }

}
