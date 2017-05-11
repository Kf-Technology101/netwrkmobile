import { Component } from '@angular/core';
import { NavParams, ViewController, ModalController } from 'ionic-angular';

import { NetworkContactListPage } from '../../pages/network-contact-list/network-contact-list';

import { Chat } from '../../providers/chat';
import { Tools } from '../../providers/tools';

import { toggleFade } from '../../includes/animations';

import { ShareListModal } from '../sharelist/sharelist';

import { SocialSharing } from '@ionic-native/social-sharing';
import { Facebook } from '@ionic-native/facebook';

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
    message: null,
    image: null,
    url: 'http://netwrk.com'
  }

  constructor(
    private params: NavParams,
    private viewCtrl: ViewController,
    private modalCtrl: ModalController,
    public chatPrvd: Chat,
    public toolsPrvd: Tools,
    private socialShare: SocialSharing,
    private facebook: Facebook
  ) {
  }

  public sendSMS() {
    if (!this.share.message) {
      this.toolsPrvd.showToast('The post doesn\'t has text message');
      return;
    }

    let params = {
      type: 'phones',
      accessed: true,
      message: this.share.message
    };

    this.toolsPrvd.pushPage(NetworkContactListPage, params);
  }

  shareViaFacebook() {
    console.log('share:', this.share);

    // if (!this.share.image)
    //   this.share.image = 'http://netwrk.com/assets/logo-88088611a0d6230481f2a5e9aabf7dee19b26eb5b8a24d0576000c6c33ccc867.png';
    if (!this.share.message)
      this.share.message = 'Shared from netwrk';

    this.facebook.showDialog({
      method: 'share',
      href: this.share.url,
      caption: 'Netwrk',
      description: this.share.message,
      picture: this.share.image
    }).then(res => {
      console.log('shareViaFacebook', res);
    }).catch(err => console.log(err));
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
    this.share.image = this.params.get('image');

    this.mainBtn.state = 'fadeInfast';
  }
}
