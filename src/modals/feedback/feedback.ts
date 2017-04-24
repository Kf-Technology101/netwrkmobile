import { Component } from '@angular/core';
import { NavParams, ViewController, ModalController } from 'ionic-angular';

import { Chat } from '../../providers/chat';
import { toggleFade } from '../../includes/animations';

import { FeedbackShareModal } from '../feedbackshare/feedbackshare';

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
    public chatPrvd: Chat,
    public modalCtrl: ModalController
  ) {
    let data = params.get('data');
    this.postInf.totalLikes = data.totalLikes;
    this.postInf.totalLegendary = data.totalLegendary;
  }

  closeModal() {
    this.chatPrvd.mainBtn.setPrevState();
    this.viewCtrl.dismiss();
  }

  goShare() {
    let feedbackShareModal = this.modalCtrl.create(FeedbackShareModal);
    feedbackShareModal.present();
  }

  ionViewDidEnter() {
    this.mainBtn.state = 'fadeInfast';
  }

}
