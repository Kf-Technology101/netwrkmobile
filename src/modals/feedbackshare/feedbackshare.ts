import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

import { Chat } from '../../providers/chat';
import { toggleFade } from '../../includes/animations';

@Component({
  selector: 'modal-feedbackshare',
  templateUrl: 'feedbackshare.html',
  animations: [
    toggleFade
  ]
})
export class FeedbackShareModal {

  private mainBtn: any = {
    state: 'fadeOut',
    hidden: false
  }

  constructor(
    private params: NavParams,
    private viewCtrl: ViewController,
    public chatPrvd: Chat
  ) {
  }

  closeModal() {
    // this.chatPrvd.mainBtn.setPrevState();
    this.viewCtrl.dismiss();
  }

  ionViewDidEnter() {
    this.mainBtn.state = 'fadeInfast';
  }
}
