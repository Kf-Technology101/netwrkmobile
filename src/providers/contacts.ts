import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Api } from './api';
import { LocalStorage } from './local-storage';
import { Tools } from './tools';

import { Contacts } from 'ionic-native';

@Injectable()
export class ContactsProvider {
  public contacts: {
    emails: Array<any>,
    phones: Array<any>,
  } = {
    emails: [],
    phones: [],
  };

  constructor(
    public http: Http,
    public api: Api,
    public storage: LocalStorage,
    public tools: Tools
  ) {}

  sendInvitations(list: Array<any>) {
    let contactList = { contact_list: list }

    let seq = this.api.post('invitations', contactList).share();
    seq.map(res => res.json()).subscribe(
      res => {
        this.storage.set('invite_sent', this.storage.get('auth_data').id);
      },
      err => console.error('ERROR', err)
    );

    return seq;
  }

  getContacts(type: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.contacts[type].length > 0) {
        resolve(this.contacts[type]);
      } else {
        this.readContacts().then(data => {
          let interval = setInterval(() => {
            if (this.contacts[type].length > 0) {
              clearInterval(interval);
              resolve(this.contacts[type]);
            }
          }, 10);
        }, err => reject(err))
      }
    });
  }

  private readContacts() {
    this.tools.showLoader();
    return Contacts.find(['emails']).then(data => {
      this.contacts.emails = [];
      this.contacts.phones = [];
      for (let i in data) {
        if (data[i].emails) {
          this.contacts.emails.push(data[i]);
        }
        if (data[i].phoneNumbers) {
          this.contacts.phones.push(data[i]);
        }
      }
      this.tools.hideLoader();
      console.log(this.contacts);
    }, err => {
      this.tools.hideLoader();
    });
  }

}
