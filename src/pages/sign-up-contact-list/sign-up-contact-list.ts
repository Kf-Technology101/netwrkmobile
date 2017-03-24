import { Component } from '@angular/core';
import {
  NavController,
  NavParams,
  Platform
} from 'ionic-angular';
import { Contacts } from 'ionic-native';

// import { HomePage } from '../home/home';
import { ProfileSettingPage } from '../profile-setting/profile-setting';

// Providers
import { User } from '../../providers/user';
import { ContactsProvider } from '../../providers/contacts';
import { Tools } from '../../providers/tools';


@Component({
  selector: 'page-sign-up-contact-list',
  templateUrl: 'sign-up-contact-list.html'
})
export class SignUpContactListPage {
  contacts: Array<any>;
  selectAll: boolean = false;
  hiddenMainBtn: boolean = false;

  private selectErrorString: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public user: User,
    public contactsPrvd: ContactsProvider,
    public tools: Tools
  ) {
    if (!this.platform.is('cordova')) this.contacts = [
      {
        name: {
          formatted: 'Test 1',
        },
        emails: [{
          value: 'test1@mail.com'
        }],
        phoneNumbers: [{
          value: '+1 000 111 2222'
        }],
        checked: false
      },
      {
        name: {
          formatted: 'Test 2',
        },
        emails: [{
          value: 'test2@mail.com'
        }],
        phoneNumbers: [{
          value: '333.444.5555'
        }],
        checked: true
      }
    ];
    this.getContacts();

    this.selectErrorString = 'Please, select at least one contact to continue';
  }

  getContacts() {
    this.tools.showLoader();
    Contacts.find(['emails']).then((data) => {
      this.tools.hideLoader();
      let contacts: Array<any> = [];
      for (let i in data) {
        if (data[i].emails && contacts.length < 500) {
          contacts.push(data[i]);
        }
      }
      this.contacts = contacts;
      console.log(this.contacts);
    }, err => {
      this.tools.hideLoader();
    })
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
        checkedContacts.push({
          name: this.contacts[c].name.formatted || '',
          email: this.contacts[c].emails[0].value || '',
        });
      }
    }

    if (checkedContacts.length > 0) {
      this.contactsPrvd.sendEmails(checkedContacts)
        .map(res => res.json()).subscribe(
        res => {
          this.user.update(
            this.user.getAuthData().id,
            { user: { invitation_sent: true } },
            null
          ).map(res => res.json()).subscribe(res => {
              this.tools.hideLoader();
              this.navCtrl.push(ProfileSettingPage);
            }, err => {
              this.tools.hideLoader();
              this.tools.showToast(JSON.stringify(err));
            });
        },
        err => console.error('ERROR', err)
      );
    } else {
      this.tools.hideLoader();
      this.tools.showToast(this.selectErrorString);
    }
  }

  goBack() { this.navCtrl.pop(); }

  ionViewDidLoad() { this.hiddenMainBtn = true; }
  ionViewWillEnter() { this.hiddenMainBtn = false; }
  ionViewWillLeave() { this.hiddenMainBtn = true; }

}
