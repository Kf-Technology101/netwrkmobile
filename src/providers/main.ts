import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Events } from 'ionic-angular';

@Injectable()
export class MainFunctions {

  constructor(public http: Http, public events: Events) {
    console.log('Hello Main Provider');
  }

  doBackButton(page: string, callback: any) {
    this.events.unsubscribe('backButton:clicked');
    this.events.subscribe('backButton:clicked', () => {
      callback(page);
    });
  }

}
