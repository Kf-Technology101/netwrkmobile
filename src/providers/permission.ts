import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Diagnostic } from '@ionic-native/diagnostic';

@Injectable()
export class Permission {

  constructor(
    public http: Http,
    private diagnostic: Diagnostic
  ) {
    console.log('Hello Permission Provider');
  }

  public geolocationPermission() {
    console.log(this.diagnostic);
  }

}
