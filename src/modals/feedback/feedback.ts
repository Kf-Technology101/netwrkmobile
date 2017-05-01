import { Component } from '@angular/core';
import { NavParams, ViewController, ModalController } from 'ionic-angular';

import { Chat } from '../../providers/chat';
import { toggleFade } from '../../includes/animations';

import { FeedbackShareModal } from '../feedbackshare/feedbackshare';
import { LegendaryListModal } from '../legendarylist/legendarylist';

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
  };

  private postInf: any = {
    totalLegendary: 0,
    totalLikes: 0
  };

  private postStatus: any = {
    isLiked: false,
    isLegendary: false
  };

  private feedData:any;

  constructor(
    private params: NavParams,
    private viewCtrl: ViewController,
    public chatPrvd: Chat,
    public modalCtrl: ModalController
  ) {
    let data = params.get('data');
    this.feedData = {
      user_like: {
        user_id: data.user.id,
        message_id: data.message_id,
        message_index: data.message_index
      }
    }
  }

  closeModal() {
    this.chatPrvd.mainBtn.setPrevState();
    this.viewCtrl.dismiss();
  }

  goShare() {
    let feedbackShareModal = this.modalCtrl.create(FeedbackShareModal);
    feedbackShareModal.present();
  }

  makeLegendary() {
    // let legendaryModal = this.modalCtrl.create(LegendaryListModal);
    // legendaryModal.present();
  }

  toggleLikes() {
    this.chatPrvd.sendFeedbackData(this.feedData).subscribe(res => {
      console.log('[likes] res:', res);
      this.postInf.totalLikes = res.likes_count;
      this.postStatus.isLiked = !this.postStatus.isLiked;
    }, err => {
      console.log('[likes] err:', err);
    });
  }

  ionViewDidEnter() {
    this.postInf.totalLikes = this.params.get('totalLikes');
    this.postStatus.isLiked = this.params.get('likedByUser');
    if (!this.postInf.totalLikes) {
      this.postInf.totalLikes = 0;
    }
    this.mainBtn.state = 'fadeInfast';
  }

}
