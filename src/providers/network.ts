import { Injectable } from '@angular/core';

// Providers
import { Api } from './api';

@Injectable()
export class Network {

  constructor(
    public api: Api
  ) {
    console.log('Hello Network Provider');
  }

  public create(data: any): any {
    let seq = this.api.post('networks', data).share();
    return seq;
  }

  public join(data: any): any {
    let seq = this.api.post('members', data).share();
    return seq;
  }

}
