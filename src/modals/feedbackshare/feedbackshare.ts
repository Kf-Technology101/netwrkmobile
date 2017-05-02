import { Component } from '@angular/core';
import { NavParams, ViewController, ModalController } from 'ionic-angular';
import { Chat } from '../../providers/chat';
import { toggleFade } from '../../includes/animations';
import { ShareListModal } from '../sharelist/sharelist';

import { SocialSharing } from '@ionic-native/social-sharing';

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

  private share: any = {
    message: <string> '',
    image: null,
    url: <string> ''
  }

  constructor(
    private params: NavParams,
    private viewCtrl: ViewController,
    private modalCtrl: ModalController,
    public chatPrvd: Chat,
    private socialShare: SocialSharing
  ) {
  }

  shareViaFacebook() {
    console.log('share message:', this.share.message);
    this.socialShare.shareViaFacebook(this.share.message).then((succ) => {
      console.log('[Facebook share] Success:', succ);
    }).catch(err => {
      console.log('[Facebook share] Error:', err);
    });
  }

  chooseToShare() {
    let sharelistModal = this.modalCtrl.create(ShareListModal);
    sharelistModal.present();
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

  ionViewDidEnter() {
    this.share.message = this.params.get('message');
    this.mainBtn.state = 'fadeInfast';
  }
}
