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

  private endResult:any;

  private feedData:any;

  private currentUser:any;
  private data:any;

  constructor(
    private params: NavParams,
    private viewCtrl: ViewController,
    public chatPrvd: Chat,
    public modalCtrl: ModalController
  ) {
    this.data = params.get('data');
    this.feedData = {
      user_like: {
        user_id: this.data.user.id,
        message_id: this.data.message_id,
        message_index: this.data.message_index
      }
    }
  }

  closeModal() {
    this.chatPrvd.mainBtn.setPrevState();
    this.viewCtrl.dismiss(this.endResult);
  }

  goShare() {
    let feedbackShareModal = this.modalCtrl.create(FeedbackShareModal,
        {
          user: this.data.data.user,
          message: this.params.get('messageText')
        });
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
      res.like_by_user = this.postStatus.isLiked;
      this.endResult = res;
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
