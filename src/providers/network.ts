import { Injectable } from '@angular/core';

// Providers
import { Api } from './api';
import { LocalStorage } from './local-storage';
import { Gps } from './gps';

@Injectable()
export class Network {

  constructor(
    public api: Api,
    public localStorage: LocalStorage,
    public gps: Gps
  ) {}

  public create(data: any): any {
    let seq = this.api.post('networks', data).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  public join(data: any): any {
    let seq = this.api.post('members', data).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  public getUsers(data: any): any {
    let seq = this.api.get('networks_users', data).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  public getNetworkId(): number {
    return this.localStorage.get('current_network').id;
  }

  public getInviteAccess(): boolean {
    return this.localStorage.get('invitation_sent');
  }

  public saveInviteAccess(invitationSent: boolean): boolean {
    return this.localStorage.set('invitation_sent', invitationSent);
  }

  public getInviteZipAccess(): Array<number> {
    let invites = this.localStorage.get('invitation_zip_codes');
    if (!invites) invites = [];
    return invites;
  }

  public saveInviteZipAccess(invites: Array<number>) {
    return this.localStorage.set('invitation_zip_codes', invites);
  }

}
