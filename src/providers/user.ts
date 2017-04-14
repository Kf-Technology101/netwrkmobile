import { Injectable } from '@angular/core';

import { Api } from './api';
import { Auth } from './auth';

@Injectable()
export class User {

  constructor(
    public api: Api,
    public auth: Auth
  ) {}

  public update(id: number, accountInfo: any, type?: string) {
    let seq = this.api.patch('registrations/' + id, accountInfo).share();
    seq.map(res => res.json()).subscribe(
      res => {
        console.log(res);
        if (type === 'fb') {
          this.auth.fbResponseData = null;
          this.auth.saveAuthData(res, 'facebook');
        }
      }, err => console.error('ERROR', err)
    );

    return seq;
  }

  public getUserData(id: number): any {
    let seq = this.api.get('profiles/' + id).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }
}
