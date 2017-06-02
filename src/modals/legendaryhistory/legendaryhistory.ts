import { Component, ViewChild } from '@angular/core';
import { NavParams, ViewController, ModalController, Content } from 'ionic-angular';

// Pages
import { ProfilePage } from '../../pages/profile/profile';

// Providers
import { Chat } from '../../providers/chat';
import { Tools } from '../../providers/tools';
import { Auth } from '../../providers/auth';
// Modals
import { FeedbackModal } from '../feedback/feedback';

// Animations
import {
  scaleMainBtn,
  toggleFade,
  chatAnim
} from '../../includes/animations';

@Component({
  selector: 'modal-legendaryhistory',
  templateUrl: 'legendaryhistory.html',
  animations: [
    scaleMainBtn,
    toggleFade
  ]
})
export class LegendaryModal {
  @ViewChild(Content) content: Content;

  private areSomeLegendary: boolean = false;
  public lgMessages: any = [];
  public netwrkId: number;
  public userId: number;
  private mainBtn: any = {
    state: 'fadeOut',
    hidden: false
  };

  constructor(
    public params: NavParams,
    public viewCtrl: ViewController,
    public chatPrvd: Chat,
    public toolsPrvd: Tools,
    public modalCtrl: ModalController,
    public authPrvd: Auth
  ) {
    this.userId = this.params.get('user_id');
  }

  closeModal(params?:any) {
    this.chatPrvd.mainBtn.setPrevState();
    this.viewCtrl.dismiss(params);
  }

  goToProfile(profileId?: number, profileTypePublic?: boolean) {
    this.chatPrvd.goToProfile(profileId, profileTypePublic).then(res => {
      this.toolsPrvd.pushPage(ProfilePage, res);
    });
  }

  openFeedback(messageData: any, mIndex: any) {
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

  refreshLegendaryList(refresher) {
    console.log('[refreshLegendaryList] Begin async operation', refresher);
    this.chatPrvd.getLegendaryHistory(this.netwrkId)
    .subscribe(res => {
      console.log('[REFRESHER] res:', res);
      if (res.messages && res.messages.length > 0 &&
          this.lgMessages.length != res.messages.length) {
        this.areSomeLegendary = true;
        res = this.chatPrvd.organizeMessages(res.messages);
        this.lgMessages = res.messages;
        this.chatPrvd.messageDateTimer.start(this.lgMessages);
      }
      refresher.complete();
    }, err => {
      refresher.complete();
      console.error('[refreshLegendaryList] Err:', err);
    });
  }

  showLegendaryMessages() {
    this.chatPrvd.showMessages(this.lgMessages, 'legendary').then(res => {
      if (res.messages && res.messages.length > 0 &&
          this.lgMessages.length != res.messages.length) {
        this.areSomeLegendary = true;
        this.lgMessages = res.messages;
        res.callback(this.lgMessages);
        this.chatPrvd.scrollToBottom(this.content);
      }
    }, err => {
      console.error('[showLegendaryMessages] Error:', err);
    });
  }

  private joinNetwork() {
    this.closeModal({
      joinNetwork: true
    });
  }

  ionViewDidEnter() {
    this.mainBtn.state = 'minimisedForCamera';
    console.log('[LegendaryList][DidEnter]');
    this.netwrkId = this.params.get('netwrk_id');
    console.log('[LegendaryList][DidEnter] netwrkId:', this.netwrkId);
    this.showLegendaryMessages();
  }
}
