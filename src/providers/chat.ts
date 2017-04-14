import { Injectable } from '@angular/core';

import { LocalStorage } from './local-storage';

@Injectable()
export class Chat {

  constructor(
    public localStorage: LocalStorage
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
    let result = chatZipCode ? chatZipCode : 0;
    return result;
  }

}
