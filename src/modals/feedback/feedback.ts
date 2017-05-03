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

  private likeData:any;
  private data:any;

  constructor(
    private params: NavParams,
    private viewCtrl: ViewController,
    public chatPrvd: Chat,
    public modalCtrl: ModalController
  ) {
    this.data = params.get('data');
    this.likeData = {
      user_id: this.data.user.id,
      message_id: this.data.message_id
    }
  }

  closeModal() {
    this.chatPrvd.mainBtn.setPrevState();
    this.viewCtrl.dismiss(this.endResult);
  }

  goShare() {
    let feedbackShareModal = this.modalCtrl.create(FeedbackShareModal,
      {
        message: this.params.get('messageText')
      });
    feedbackShareModal.present();
  }

  toggleLikes(type:string) {
    let sendObj:any;
    let sendUrl:string;
    switch (type) {
      case 'legendary':
        sendObj = { legendary: this.likeData };
        sendUrl = 'legendary_likes';
      break;
      case 'like':
        sendObj = { user_like: this.likeData };
        sendUrl = 'user_likes';
      break;
    }
    this.chatPrvd.sendFeedbackData(sendUrl, sendObj).subscribe(res => {
      console.log('[' + type + '] res:', res);
      if (type === 'legendary') {
        this.postInf.totalLegendary = res.legendary_count;
        this.postStatus.isLegendary = !this.postStatus.isLegendary;
        res.legendary_by_user = this.postStatus.isLegendary;
        this.endResult = res;
      } else if (type === 'like') {
        this.postInf.totalLikes = res.likes_count;
        this.postStatus.isLiked = !this.postStatus.isLiked;
        res.like_by_user = this.postStatus.isLiked;
        this.endResult = res;
      }
    }, err => {
      console.log('[' + type + '] err:', err);
    });
  }

  ionViewDidEnter() {
    this.postInf.totalLikes = this.params.get('totalLikes');
    this.postStatus.isLiked = this.params.get('likedByUser');
    this.postInf.totalLegendary = this.params.get('totalLegendary');
    this.postStatus.isLegendary= this.params.get('legendaryByUser');
    if (!this.postInf.totalLikes) {
      this.postInf.totalLikes = 0;
    }
    if (!this.postInf.totalLegendary) {
      this.postInf.totalLegendary = 0;
    }
    this.mainBtn.state = 'fadeInfast';
  }

}
