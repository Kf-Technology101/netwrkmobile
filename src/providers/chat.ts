import { Injectable } from '@angular/core';

import { LocalStorage } from './local-storage';
import { Gps } from './gps';
import { Api } from './api';
import { Tools } from './tools';

@Injectable()
export class Chat {
  public users: any = {};

  constructor(
    public localStorage: LocalStorage,
    public api: Api,
    public gps: Gps,
    public tools: Tools
  ) {
    console.log('Hello Chat Provider');
  }

  public setState(state: string) {
    this.localStorage.set('chat_state', state);
  }

  public getState(): string {
    let state = this.localStorage.get('chat_state');
    let result = state ? state : 'undercover';
    return result;
  }

  public setZipCode(zipCode: any) {
    this.localStorage.set('chat_zip_code', zipCode);
  }

  public chatZipCode(): number {
    let chatZipCode = this.localStorage.get('chat_zip_code');
    console.log(chatZipCode);
    let result = chatZipCode ? chatZipCode : 0;
    console.log(result);
    return result;
  }

  public sendMessage(data: any): any {
    let seq = this.api.post('messages', {
      image: data.image,
      text: data.text,
      user_id: data.user_id,
      network_id: this.getNetwork() ? this.getNetwork().id : null,
      lat: this.gps.coords.lat,
      lng: this.gps.coords.lng,
      undercover: data.undercover,
    }).share();
    let seqMap = seq.map(res => res.json());

    return seqMap;
  }

  public getMessages(undercover: boolean) {
    let data = {
      post_code: this.gps.zipCode,
      undercover: undercover,
      lat: this.gps.coords.lat,
      lng: this.gps.coords.lng,
    };
    let seq = this.api.get('messages', data).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  public saveNetwork(network: any) {
    this.localStorage.set('current_network', network);
  }

  public setStorageUsers(users: Array<any>) {
    let stUsers: any = {};
    if (users.length)
      for (let i = 0; i < users.length; i++)
        stUsers[users[i].id] = users[i];
    this.users = stUsers;
  }

  public organizeMessages(data: any): any {
    let messages: Array<any> = [];
    for (let d in data) {
      data[d].date = this.tools.getTime(data[d].created_at);
      messages.push(data[d]);
    }
    return messages;
  }

  private getNetwork(): any {
    return this.localStorage.get('current_network');
  }

}
