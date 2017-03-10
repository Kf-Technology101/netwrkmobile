import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Events } from 'ionic-angular';

import { ContactsProvider } from './contacts';

@Injectable()
export class MainFunctions {

  constructor(
    public http: Http,
    public events: Events,
    public contactsPrvd: ContactsProvider
  ) {
    console.log('Hello Main Provider');
  }

  doBackButton(page: string, callback: any) {
    this.events.unsubscribe('backButton:clicked');
    this.events.subscribe('backButton:clicked', () => {
      callback(page);
    });
  }

  getLoginPage(userId, HomePage, SignUpContactListPage) {
    let inviteId = this.contactsPrvd.getInviteStatus();
    return inviteId && inviteId === userId ? HomePage : SignUpContactListPage;
  }

}
