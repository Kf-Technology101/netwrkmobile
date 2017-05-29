import { Component } from '@angular/core';
import { NavParams, ViewController, ModalController, AlertController } from 'ionic-angular';

import { Tools } from '../../providers/tools';
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
  };

  private postInf: any = {
    totalLegendary: 0,
    totalLikes: 0
  };

  private postStatus: any = {
    isLiked: null,
    isLegendary: null
  };

  private endResult:any = {
    like: null,
    legendary: null,
    isBlocked: false
  };

  private likeData:any;
  private data:any;

  constructor(
    private params: NavParams,
    private viewCtrl: ViewController,
    public chatPrvd: Chat,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public toolsPrvd: Tools
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
    let feedbackShareModal = this.modalCtrl.create(FeedbackShareModal, {
      message: this.params.get('messageText'),
      image: this.params.get('messageImage'),
      totalLikes: this.postInf.totalLikes,
      likedByUser: this.postStatus.likedByUser,
      totalLegendary: this.postInf.totalLegendary,
      legendaryByUser: this.postStatus.legendaryByUser
    });
    feedbackShareModal.onDidDismiss(data => {
      console.log('feedbackShareModal.onDidDismiss -> data:', data);
      this.postInf.totalLikes = data.totalLikes;
      this.postStatus.isLiked = data.likedByUser;
      this.postInf.totalLegendary = data.totalLegendary;
      this.postStatus.isLegendary = data.legendaryByUser;
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
        this.endResult.legendary = {
          total: <number> res.legendary_count,
          isActive: <boolean> res.legendary_by_user
        };
      } else if (type === 'like') {
        this.postInf.totalLikes = res.likes_count;
        this.postStatus.isLiked = !this.postStatus.isLiked;
        res.like_by_user = this.postStatus.isLiked;
        this.endResult.like = {
          total: <number> res.likes_count,
          isActive: <boolean> res.like_by_user
        };
      }
    }, err => {
      console.log('[' + type + '] err:', err);
      let errorMessage = JSON.parse(err['_body']).error;
      let alert = this.alertCtrl.create({
        title: 'Legendary',
        subTitle: errorMessage,
        buttons: ['Ok']
      });
      alert.present();
    });
  }

  blockMessage() {
    let confirmBlockAlert = this.alertCtrl.create({
      title: 'Confirm block',
      message: 'Are you sure you want to block this post?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Block',
          handler: () => {
            let messageId = [];
            messageId.push(this.likeData.message_id);
            this.chatPrvd.deleteMessages().subscribe(res => {
              console.log('[BLOCK MESSAGE] res:', res);
              let OkAlert = this.alertCtrl.create({
                title: 'Block info',
                subTitle: 'Post successfully blocked',
                buttons: [{
                  text: 'OK',
                  handler: () => {
                    this.endResult.isBlocked = true;
                    this.closeModal();
                  }
                }]
              });
              OkAlert.present();
            }, err => {
              console.log('[BLOCK MESSAGE] err:', err);
              let ErrAlert = this.alertCtrl.create({
                title: 'Block error',
                subTitle: 'Error blocking post\n(' + err.status + ') ' + err.statusText,
                buttons: ['OK']
              });
              ErrAlert.present();
            });
          }
        }
      ]
    });
    confirmBlockAlert.present();
  }

  ionViewDidEnter() {
    this.toolsPrvd.hideLoader();
    this.postInf.totalLikes = this.params.get('totalLikes');
    this.postStatus.isLiked = this.params.get('likedByUser');
    this.postInf.totalLegendary = this.params.get('totalLegendary');
    this.postStatus.isLegendary = this.params.get('legendaryByUser');

    console.log('postInf:', this.postInf);
    console.log('postStatus:', this.postStatus);
    console.log('isLegendary:', this.postStatus.isLegendary);
    if (!this.postInf.totalLikes) {
      this.postInf.totalLikes = 0;
    }
    if (!this.postInf.totalLegendary) {
      this.postInf.totalLegendary = 0;
    }
    this.mainBtn.state = 'fadeInfast';
  }

}
