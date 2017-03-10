import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, Platform } from 'ionic-angular';

import { HomePage } from '../home/home';

import { Contacts } from 'ionic-native';

@Component({
  selector: 'page-sign-up-contact-list',
  templateUrl: 'sign-up-contact-list.html'
})
export class SignUpContactListPage {
  contacts: Array<any>;
  selectAll: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public platform: Platform
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
  }

  getContacts() {
    let loader = this.loadingCtrl.create({
      content: "Please wait..."
    });
    loader.present();
    Contacts.find(['emails']).then((data) => {
      let contacts: Array<any> = [];
      for (let i in data) {
        console.log(data[i].emails, data[i].phoneNumbers);
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
    this.navCtrl.push(HomePage);
  }

  goBack() {
    this.navCtrl.pop();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignUpContactListPage');
  }

}
