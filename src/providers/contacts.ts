import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Api } from './api';
import { LocalStorage } from './local-storage';
import 'rxjs/add/operator/map';

@Injectable()
export class ContactsProvider {

  constructor(
    public http: Http,
    public api: Api,
    public storage: LocalStorage
  ) {}

  sendEmails(list: Array<any>) {
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

}
