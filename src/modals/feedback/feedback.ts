import { Component, ViewChild } from '@angular/core';
import { NavParams, ViewController, ModalController, AlertController } from 'ionic-angular';

import { Tools } from '../../providers/tools';
import { Chat } from '../../providers/chat';
import { toggleFade } from '../../includes/animations';
import { Api } from '../../providers/api';
import { Auth } from '../../providers/auth';
import { ReportService } from '../../providers/reportservice';

import { FeedbackShareModal } from '../feedbackshare/feedbackshare';

@Component({
  selector: 'modal-feedback',
  templateUrl: 'feedback.html',
  animations: [
    toggleFade
  ]
})
export class FeedbackModal {

  @ViewChild('likebutton') likebtn;

  private user:any;

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

  private displayToolbar:any = false;
  private likeData:any;
  private messageData:any;
  private data:any;
  private isUndercover:boolean;

  constructor(
    private params: NavParams,
    private viewCtrl: ViewController,
    public chatPrvd: Chat,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public toolsPrvd: Tools,
    public api: Api,
    public auth: Auth,
    public report: ReportService
  ) {
    this.data = params.get('data');
    this.likeData = {
      user_id: this.data.user.id,
      message_id: this.data.message_id
    };
    this.user = this.auth.getAuthData();
  }

  closeModal() {
    console.log('feedback results:', this.endResult);
    this.chatPrvd.mainBtn.setPrevState();
    this.viewCtrl.dismiss(this.endResult);
  }

  goShare() {
    let feedbackShareModal = this.modalCtrl.create(FeedbackShareModal, {
      message: this.params.get('messageText'),
      image: this.params.get('messageImage'),
      totalLikes: this.postInf.totalLikes,
      likedByUser: this.postStatus.isLiked,
      totalLegendary: this.postInf.totalLegendary,
      legendaryByUser: this.postStatus.isLegendary,
      coords: {
        lat: this.data.lat,
        lng: this.data.lng
      }
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

  public toggleLikes(type:string) {
    if (type == 'likes')
      this.likebtn.nativeElement.classList.add('no-events');
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
      if (type === 'legendary') { // 15 points
        this.toolsPrvd.sendPointData({
          points: this.postStatus.isLegendary ? -15 : 15,
          user_id: this.likeData.user_id
        }).subscribe(res => {
            if(this.postStatus.isLiked==15){
                this.messageData.notification_type="legendary";
                this.chatPrvd.sendNotification(this.messageData).subscribe(notificationRes => {
                    console.log('Notification Res', notificationRes);
                }, err => console.error(err));
            }

          console.log('sendPointData res:', res);
        });
        this.postInf.totalLegendary = res.legendary_count;
        this.postStatus.isLegendary = !this.postStatus.isLegendary;
        res.legendary_by_user = this.postStatus.isLegendary;
        this.endResult.legendary = {
          total: <number> res.legendary_count,
          isActive: <boolean> res.legendary_by_user
        };
      } else if (type === 'like') { // 5 points
        this.toolsPrvd.sendPointData({
          points: this.postStatus.isLiked ? -5 : 5,
          user_id: this.likeData.user_id
        }).subscribe(res => {
            if(this.postStatus.isLiked==5){
                this.messageData.notification_type="like";
                this.chatPrvd.sendNotification(this.messageData).subscribe(notificationRes => {
                    console.log('Notification Res', notificationRes);
                }, err => console.error(err));
            }
          console.log('sendPointData res:', res);
          this.likebtn.nativeElement.classList.remove('no-events');
        }, err => this.likebtn.nativeElement.classList.remove('no-events'));
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
        title: '',
        subTitle: 'Looks like you\'ll have to wait until next month',
        buttons: [{
          cssClass: 'active',
          text: 'Ok'
        }]
      });
      alert.present();
    });
  }

  blockMessage() {
    let confirmBlockAlert = this.alertCtrl.create({
      title: '',
      subTitle: 'Are you sure you want to block this post?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          cssClass: 'active',
          text: 'Block',
          handler: () => {
            this.toolsPrvd.sendPointData({
              points: -15,
              user_id: this.likeData.user_id
            }).subscribe(res => {
              console.log('sendPointData res:', res);
            });
            let messageId: number = this.likeData.message_id;
            this.chatPrvd.blockPost(messageId).subscribe(res => {
              console.log('[BLOCK MESSAGE] res:', res);
              for (let m = 0; m < this.chatPrvd.postMessages.length; m++) {
                if (this.chatPrvd.postMessages[m].id == messageId) {
                  this.chatPrvd.postMessages.splice(m, 1);
                  break;
                }
              }
              let OkAlert = this.alertCtrl.create({
                title: '',
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
                title: '',
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
    this.isUndercover = this.params.get('isUndercover');
    this.messageData = this.params.get('message');

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
    this.toolsPrvd.isLegendaryAvailable().subscribe(res => {
      console.log('isLegendaryAvailable:', res);
      this.displayToolbar = res.able_to_post_legendary;
    });
  }

}
