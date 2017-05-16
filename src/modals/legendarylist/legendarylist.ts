import { Component } from '@angular/core';
import { NavParams, ViewController, ModalController } from 'ionic-angular';

// Pages
import { ProfilePage } from '../../pages/profile/profile';

// Providers
import { Chat } from '../../providers/chat';
import { Tools } from '../../providers/tools';
import { Auth } from '../../providers/auth';

// Custom libs
import { MessageDateTimer } from '../../includes/messagedatetimer';

// Modals
import { FeedbackModal } from '../feedback/feedback';

// Animations
import {
  scaleMainBtn,
  toggleFade,
  chatAnim
} from '../../includes/animations';

@Component({
  selector: 'modal-legendarylist',
  templateUrl: 'legendarylist.html',
  animations: [
    scaleMainBtn,
    toggleFade,
    chatAnim
  ]
})
export class LegendaryListModal {

  private lgMessages: Array<any> = [];
  private netwrkId: number;
  private user: any;
  private messageDateTimer = new MessageDateTimer();

  constructor(
    private params: NavParams,
    private viewCtrl: ViewController,
    public chatPrvd: Chat,
    public authPrvd: Auth,
    public toolsPrvd: Tools,
    public modalCtrl: ModalController
  ) {}

  closeModal() {
    this.chatPrvd.mainBtn.setPrevState();
    this.viewCtrl.dismiss();
  }

  goToProfile(profileId?: number, profileTypePublic?: boolean) {
    this.chatPrvd.goToProfile(profileId, profileTypePublic).then(res => {
      this.toolsPrvd.pushPage(ProfilePage, res);
    });
  }

  openFeedbackModal(messageData, mIndex) {
    this.chatPrvd.sendFeedback(messageData, mIndex).then(res => {
      let feedbackModal = this.modalCtrl.create(FeedbackModal, res);
      feedbackModal.onDidDismiss(data => {
        if (data) {
          if (data.like) {
            this.lgMessages[mIndex].likes_count = data.like.total;
            this.lgMessages[mIndex].like_by_user = data.like.isActive;
          }
          if (data.legendary) {
            this.lgMessages[mIndex].legendary_count = data.legendary.total;
            this.lgMessages[mIndex].legendary_by_user = data.legendary.isActive;
          }
          if (data.isBlocked) {
            this.showLegendaryMessages();
          }
        } else {
          console.warn('[likeClose] Error, no data returned');
        }
      });
      setTimeout(() => {
        feedbackModal.present();
      }, chatAnim/2);
    })
  }

  showLegendaryMessages() {
    this.chatPrvd.getLegendaryHistory(this.netwrkId).subscribe(res => {
      console.log('[showLegendaryMessages] res:', res);
      this.lgMessages = res.messages;
    }, err => {
      console.error('[showLegendaryMessages] error:', err);
    })
  }

  ionViewDidEnter() {
    this.netwrkId = this.params.get('netwrk_id');
    console.log('[LegendaryList] netwrkId:', this.netwrkId);
    this.showLegendaryMessages();
  }
}
