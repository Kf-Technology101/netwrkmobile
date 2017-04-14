import { Injectable } from '@angular/core';

import { LocalStorage } from './local-storage';

@Injectable()
export class Chat {

  constructor(
    public localStorage: LocalStorage
  ) {
    console.log('Hello Chat Provider');
  }

  public getState(): string {
    let state = this.localStorage.get('chat_state');
    let result = state ? state : 'undercover';
    return result;
  }

  public chatZipCode(): number {
    let chatZipCode = this.localStorage.get('chat_zip_code');
    let result = chatZipCode ? chatZipCode : 0;
    return result;
  }

}
