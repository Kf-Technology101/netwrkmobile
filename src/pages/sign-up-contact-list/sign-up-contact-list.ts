import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, Platform, ToastController } from 'ionic-angular';
import { Contacts } from 'ionic-native';

import { HomePage } from '../home/home';

// Providers
import { User } from '../../providers/user';
import { ContactsProvider } from '../../providers/contacts';


@Component({
  selector: 'page-sign-up-contact-list',
  templateUrl: 'sign-up-contact-list.html'
})
export class SignUpContactListPage {
  contacts: Array<any>;
  selectAll: boolean = false;

  private selectErrorString: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    public toastCtrl: ToastController,
    public user: User,
    public contactsPrvd: ContactsProvider
  ) {
    if (!this.platform.is('cordova')) this.contacts = [
      {
        name: {
          formatted: 'sss',
        },
        emails: [{
          value: 'sddfdsfsdf'
        }],
        phoneNumbers: [{
          value: 'aaaaaaa'
        }],
        checked: false
      },
      {
        name: {
          formatted: 'sss',
        },
        emails: [{
          value: 'sddfdsfsdf'
        }],
        phoneNumbers: [{
          value: 'aaaaaaa'
        }],
        checked: true
      }
    ];
    this.getContacts();

    this.selectErrorString = 'Please, select at least one contact to continue';
  }

  getContacts() {
    let loader = this.loadingCtrl.create({
      content: "Please wait..."
    });

    loader.present();
    Contacts.find(['emails']).then((data) => {
      let contacts: Array<any> = [];
      for (let i in data) {
        // console.log(data[i].emails, data[i].phoneNumbers);
        if (data[i].emails) {
          contacts.push(data[i]);
        }
      }
      this.contacts = contacts;
      console.log(this.contacts);
      loader.dismiss();
    }, (err) => {
      console.log(err);
      loader.dismiss();
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
    let loader = this.loadingCtrl.create({
      content: "Please wait..."
    });

    loader.present();
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
      this.contactsPrvd.sendEmails(checkedContacts).map(res => res.json()).subscribe(
        res => {
          this.user.update(this.user.getAuthData().id, { user: { invitation: true } }, null)
            .map(res => res.json()).subscribe(res => {
              loader.dismiss();
              this.navCtrl.push(HomePage);
            }, err => {
              loader.dismiss();
              let toast = this.toastCtrl.create({
                message: JSON.stringify(err),
                duration: 3000,
                position: 'top'
              });
              toast.present();
            });
        },
        err => console.error('ERROR', err)
      );
    } else {
      loader.dismiss();
      let toast = this.toastCtrl.create({
        message: this.selectErrorString,
        duration: 3000,
        position: 'top'
      });
      toast.present();
    }
  }

  goBack() {
    this.navCtrl.pop();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignUpContactListPage');
  }

}
