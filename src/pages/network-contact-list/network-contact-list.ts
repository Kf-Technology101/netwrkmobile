import { Component } from '@angular/core';
import {
  NavController,
  NavParams,
  Platform
} from 'ionic-angular';

// import { HomePage } from '../home/home';
// import { NetworkFindPage } from '../network-find/network-find';

// Providers
import { Auth } from '../../providers/auth';
import { User } from '../../providers/user';
import { ContactsProvider } from '../../providers/contacts';
import { Tools } from '../../providers/tools';
import { Network } from '../../providers/network';
import { Gps } from '../../providers/gps';

// Pipes
// import { ContactListPipe } from '../../pipes/contact-list';

@Component({
  selector: 'page-network-contact-list',
  templateUrl: 'network-contact-list.html'
})
export class NetworkContactListPage {
  contacts: Array<any>;
  selectAll: boolean = false;

  public listType: string;
  private selectErrorString: string;
  private selectMinErrorString: string;
  private accessed: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public auth: Auth,
    public userPrvd: User,
    public contactsPrvd: ContactsProvider,
    public tools: Tools,
    public networkPrvd: Network,
    public gpsPrvd: Gps
  ) {
    this.listType = this.navParams.get('type');
    this.accessed = this.navParams.get('accessed');
    console.log(this.listType);

    // if (!this.platform.is('cordova')) {
      this.contacts = [];
      for (let i = 0; i < 20; i++) {
        this.contacts.push({
          name: {
            formatted: `Test ${i}`,
          },
          emails: [{
            value: `test${i}@mail.com`
          }],
          phoneNumbers: [{
            value: `+1 000 000 00${i}`
          }],
          checked: false
        });
      }
      this.setErrorMessages(this.contacts);
    // }

    // this.contactsPrvd.getContacts(this.listType).then(data => {
    //   console.log(data);
    //   this.contacts = data;
    //   this.setErrorMessages(this.contacts);
    // }, err => {
    //   console.log(err);
    // });

  }

  private setErrorMessages(contacts: Array<any>) {
    let count: number = 20;
    if (contacts.length > count) {
      this.selectMinErrorString = `You need to select ${count} or more contacts`
      this.selectErrorString = `Please, select ${count} or more contacts to continue`;
    } else {
      this.selectMinErrorString = 'You need to select all contacts';
      this.selectErrorString = 'Please, select all contacts to continue';
    }
  }

  doSelectAll() {
    this.toggleSelectAll(this.selectAll);

    for (let c in this.contacts) {
      this.contacts[c].checked = this.selectAll;
    }
  }

  doChange(contact: any) {
    let hasUnchanged: boolean = false;
    for (let c in this.contacts) {
      if (!this.contacts[c].checked) {
        hasUnchanged = true;
      }
    }
    this.toggleSelectAll(hasUnchanged);
  }

  private toggleSelectAll(condition: boolean) {
    this.selectAll = !condition;
  }

  goHome() {
    this.tools.showLoader();
    var checkedContacts: Array<any> = [];

    for (let c in this.contacts) {
      if (this.contacts[c].checked) {
        let checkedObj = {
          name: this.contacts[c].name.formatted || '',
          email: null,
          phone: null,
        }
        if (this.listType == 'emails') {
          checkedObj.email = this.contacts[c].emails[0].value || '';
        } else if (this.listType == 'phones') {
          checkedObj.phone = this.contacts[c].phoneNumbers[0].value || '';
        }

        checkedContacts.push(checkedObj);
      }
    }

    if (checkedContacts.length > 0) {
      if (this.listType == 'emails' && checkedContacts.length < 20) {
        this.tools.hideLoader();
        this.tools.showToast(this.selectMinErrorString);
        return;
      }
      this.contactsPrvd.sendInvitations(checkedContacts)
        .map(res => res.json()).subscribe(
        res => {
          this.userPrvd.update(
            this.auth.getAuthData().id,
            { user: { invitation_sent: true } }
          ).map(res => res.json()).subscribe(res => {
            this.accessed = true;
            let inviteCode = this.gpsPrvd.zipCode;
            let inviteCodes = this.networkPrvd.getInviteZipAccess();
            this.tools.hideLoader();
            if (inviteCodes.indexOf(inviteCode) === -1) inviteCodes.push(inviteCode)
            this.networkPrvd.saveInviteZipAccess(inviteCodes)
            this.networkPrvd.saveInviteAccess(true);
            this.tools.popPage();
          }, err => {
            this.tools.hideLoader();
            this.tools.showToast(JSON.stringify(err));
          });
        },
        err => this.tools.hideLoader()
      );
    } else {
      this.tools.hideLoader();
      this.tools.showToast(this.selectErrorString);
    }
  }

  goBack() { this.tools.popPage(); }

}
