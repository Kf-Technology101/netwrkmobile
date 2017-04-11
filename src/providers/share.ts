import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { SocialSharing } from '@ionic-native/social-sharing';

@Injectable()
export class Share {

  constructor(
    public http: Http,
    private socialSharing: SocialSharing
  ) {
    console.log('Hello Share Provider');

    this.socialSharing.shareViaInstagram('aaa', 'https://www.w3schools.com/css/img_fjords.jpg').then(res => {
      console.log(res);
    }, err => {
      console.log(err);
    });
  }

}
