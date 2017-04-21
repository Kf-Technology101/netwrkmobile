import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

import { toggleFade } from '../../includes/animations';

@Component({
  selector: 'modal-feedback',
  templateUrl: 'feedback.html',
  animations: [
    toggleFade
  ]
})
export class FeedbackModal {

  private mainBtn: any = {
    state: 'fadeOut',
    hidden: false
  }

  constructor(
    params: NavParams,
    private viewCtrl: ViewController
  ) {
    console.log('UserId', params.get('feedData'));
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

  ionViewDidEnter() {
    this.mainBtn.state = 'fadeInfast';
  }

}
