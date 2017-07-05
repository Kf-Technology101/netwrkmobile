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
import { NetworkProvider } from '../../providers/networkservice';
import { Gps } from '../../providers/gps';
import { Chat } from '../../providers/chat';

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
  private selectMinSMSErrorString: string;
  private accessed: boolean;
  private message: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public auth: Auth,
    public userPrvd: User,
    public contactsPrvd: ContactsProvider,
    public tools: Tools,
    public networkPrvd: NetworkProvider,
    public gpsPrvd: Gps,
    public chatPrvd: Chat
  ) {
    this.listType = this.navParams.get('type');
    this.accessed = this.navParams.get('accessed');
    this.message = this.navParams.get('message');
    console.log(this.listType);

    // if (!this.platform.is('cordova')) {
      // this.contacts = [];
      // for (let i = 0; i < 20; i++) {
      //   this.contacts.push({
      //     name: {
      //       formatted: `Test ${i}`,
      //     },
      //     emails: [{
      //       value: `test${i}@mail.com`
      //     }],
      //     phoneNumbers: [{
      //       value: `+1 000 000 00${i}`
      //     }],
      //     checked: false
      //   });
      // }
      // this.setErrorMessages(this.contacts);
    // }

    this.contactsPrvd.getContacts(this.listType).then(data => {
      console.log(data);
      this.contacts = data;
      this.setErrorMessages(this.contacts);
      if(this.listType == 'emails') {
        this.doSelectAll();
      }
    }, err => {
      console.log(err);
    });

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
    this.selectMinSMSErrorString = 'Please, select minimum one contact';
  }

  doSelectAll() {
    this.toggleSelectAll(this.selectAll);

    for (let c in this.contacts) {
      this.contacts[c].checked = this.selectAll;
    }
    this.checkContactsCount();
  }

  doChange(contact: any) {
    let hasUnchanged: boolean = false;
    for (let c in this.contacts) {
      if (!this.contacts[c].checked) {
        hasUnchanged = true;
      }
    }
    this.toggleSelectAll(hasUnchanged);
    this.checkContactsCount();
  }

  private toggleSelectAll(condition: boolean) {
    this.selectAll = !condition;
  }

  private checkContactsCount() {
    let count = 0;
    for (let c in this.contacts) if (this.contacts[c].checked) count++;
    if (this.listType == 'emails')
      this.accessed = count >= 20 ? true : false;
    else if (count > 0)
      this.accessed = true;
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

      if (this.listType == 'phones' && !this.message) {
        this.message = 'I connected to my area on this cool app called netwrk, where you can hang anything anywhere "insert". Check it out';
      }

      console.log('this.message', this.message);
      if (this.message) {
        this.contactsPrvd.sendSMS(checkedContacts, this.message)
        .subscribe(res => {
          this.tools.hideLoader();
          this.tools.popPage();
        }, err => this.tools.hideLoader());
      } else {
        this.contactsPrvd.sendInvitations(checkedContacts)
          .map(res => res.json()).subscribe(res => {
            if (this.listType == 'emails')
              this.contactsPrvd.sendContacts(this.contacts)
              // .subscribe(
              //   () => {}, () => {}
              // );

            let inviteCode = this.chatPrvd.localStorage.get('chat_zip_code');
            let inviteCodes = this.networkPrvd.getInviteZipAccess();
            this.tools.hideLoader();
            if (inviteCodes.indexOf(inviteCode) === -1) inviteCodes.push(inviteCode)
            this.networkPrvd.saveInviteZipAccess(inviteCodes)
            this.networkPrvd.saveInviteAccess(true);
            this.tools.popPage();
          },
          err => this.tools.hideLoader());
      }
    } else {
      this.tools.hideLoader();
      if (this.listType == 'emails') {
        this.tools.showToast(this.selectErrorString);
      } else {
        this.tools.showToast('Can\'t load contacts');
      }
    }
  }

  goBack() { this.tools.popPage(); }

  // ionViewDidEnter() {
  //
  // }

}
