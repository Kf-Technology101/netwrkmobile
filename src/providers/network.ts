import { Injectable } from '@angular/core';

// Providers
import { Api } from './api';
import { LocalStorage } from './local-storage';

@Injectable()
export class Network {

  constructor(
    public api: Api,
    public localStorage: LocalStorage,
  ) {
    console.log('Hello Network Provider');
  }

  public create(data: any): any {
    return this.api.post('networks', data).share();
  }

  public join(data: any): any {
    return this.api.post('members', data).share();
  }

  public getUsers(data: any): any {
    return this.api.get('networks_users', data).share();
  }

  public getInviteAccess(): boolean {
    return this.localStorage.get('invitation_sent');
  }

  public saveInviteAccess(invitationSent: boolean): boolean {
    return this.localStorage.set('invitation_sent', invitationSent);
  }

}
