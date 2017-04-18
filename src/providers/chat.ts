import { Injectable } from '@angular/core';

import { LocalStorage } from './local-storage';
import { Gps } from './gps';
import { Api } from './api';

@Injectable()
export class Chat {

  constructor(
    public localStorage: LocalStorage,
    public api: Api,
    public gps: Gps
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
      post_code: this.gps.zipCode,
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

}
