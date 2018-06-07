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
    let contactList = { invitation: list };
    let seq = this.api.post('invitations', contactList).share();
    seq.map(res => res.json()).subscribe(
      res => {
        this.storage.set('invite_sent', this.storage.get('auth_data').id);
      }, err => console.error('ERROR', err)
    );
    return seq;
  }

  public sendContacts(list: Array<any>) {
    let emails: Array<string> = [];
    console.log(list)
    for (let contact of list) {
      console.log(contact)
      for (let email of contact.emails) {
        console.log(email)
        emails.push(email.value);
      }
    }
    let contactList = { contact_list: emails };

    let seq = this.api.post('contacts', contactList).share();
    let seqMap = seq.map(res => res.json());

    return seqMap;
  }

  public getContacts(type: string): Promise<any> {
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

  public getAllContacts(): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log('getAllContacts()...');
      var contactsArray:any = [];
      if (this.contacts['emails'].length > 0)
        contactsArray = contactsArray.concat(this.contacts['emails']);
      if (this.contacts['phones'].length > 0)
        contactsArray = contactsArray.concat(this.contacts['phones']);
      console.log('contactsArray.length:', contactsArray.length);
      if (contactsArray.length == 0) {
        this.readContacts().then(data => {
          let interval = setInterval(() => {
            if (this.contacts['emails'].length > 0 ||
                this.contacts['phones'].length > 0) {
              clearInterval(interval);
              if (this.contacts['emails'].length > 0) {
                contactsArray = contactsArray.concat(this.contacts['emails']);
              }
              if (this.contacts['phones'].length > 0) {
                contactsArray = contactsArray.concat(this.contacts['phones']);
              }
              resolve(contactsArray);
            }
          }, 10);
        }, err => reject(err))
      } else {
        resolve(contactsArray);
      }
    });
  }

  sendSMS(contacts: any, message: string) {
    let numbers = [];
    console.log('[sendSMS] contacts ', contacts);
    for (let c of contacts) numbers.push(c.phone);
    console.log('[sendSMS] numbers ', numbers);
    let params = {
      phone_numbers: numbers,
      message: message
    }

    let seq = this.api.post('messages/sms_sharing', params).share();
    let seqMap = seq.map(res => res.json());

    return seqMap;
  }

  private readContacts() {
    this.tools.showLoader();
    return Contacts.find(['emails']).then(data => {
      this.contacts.emails = [];
      this.contacts.phones = [];
      for (let i in data) {
        if (data[i].emails)
          this.contacts.emails.push(data[i]);
        if (data[i].phoneNumbers)
          this.contacts.phones.push(data[i]);
      }
      this.tools.hideLoader();
      console.log('[contacts provider] contacts:', this.contacts);
    }, err => {
      this.tools.hideLoader();
    });
  }

}
