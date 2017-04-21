import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

import { Chat } from '../../providers/chat';
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

  private postInf: any = {
    totalLegendary: 0,
    totalLikes: 0
  }

  constructor(
    private params: NavParams,
    private viewCtrl: ViewController,
    public chatPrvd: Chat
  ) {
    let data = params.get('data');
    this.postInf.totalLikes = data.totalLikes;
    this.postInf.totalLegendary = data.totalLegendary;
  }

  closeModal() {
    this.chatPrvd.mainBtn.setPrevState();
    this.viewCtrl.dismiss();
  }

  ionViewDidEnter() {
    this.mainBtn.state = 'fadeInfast';
  }

}
