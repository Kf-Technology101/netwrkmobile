import { Component } from '@angular/core';
import { NavParams, ViewController, ModalController, AlertController } from 'ionic-angular';

import { NetworkContactListPage } from '../../pages/network-contact-list/network-contact-list';

import { Chat } from '../../providers/chat';
import { Tools } from '../../providers/tools';
import { Gps } from '../../providers/gps';

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
    coords: null,
    message: null,
    image: null,
    url: 'http://34.208.20.67' /*'http://netwrk.com'*/
  }

  constructor(
    private params: NavParams,
    private viewCtrl: ViewController,
    private modalCtrl: ModalController,
    public chatPrvd: Chat,
    public toolsPrvd: Tools,
    private socialShare: SocialSharing,
    private facebook: Facebook,
    private alertCtrl: AlertController,
    private gpsPrvd: Gps
  ) {
  }

  public sendSMS() {
    if (!this.share.message) {
      this.toolsPrvd.showToast('The post doesn\'t have text message');
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

    if (!this.share.image)
      this.share.image = this.share.url + '/assets/logo-88088611a0d6230481f2a5e9aabf7dee19b26eb5b8a24d0576000c6c33ccc867.png';
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

    // this.facebook.login(['publish_actions']).then(data => {
    //   console.log(data);
    // }, err => {
    //   console.log(err);
    // });
  }
  shareViaTwitter() {
    this.toolsPrvd.showLoader();
    let self = this;
    this.socialShare.shareViaTwitter(this.share.message, this.share.image)
    .then(function(result) {
      // Success!
      self.toolsPrvd.hideLoader();
      console.log('[Twitter share] success!:', result);
    }, function(err) {
      // An error occurred. Show a message to the user
      self.toolsPrvd.hideLoader();
      console.error('[Twitter share] error:', err);
      let alert = this.alertCtrl.create({
        title: '',
        subTitle: 'You might need to install Twitter app',
        buttons: ['OK']
      });
      alert.present();
    });
  }

  chooseToShare() {
    let sharelistModal = this.modalCtrl.create(ShareListModal);
    sharelistModal.present();
  }

  closeModal() {
    this.viewCtrl.dismiss({
      totalLikes: this.params.get('totalLikes'),
      totalLegendary: this.params.get('totalLegendary'),
      likedByUser: this.params.get('likedByUser'),
      legendaryByUser: this.params.get('legendaryByUser')
    });
  }

  ionViewDidEnter() {
    console.log('chat state:', this.chatPrvd.getState() + ' ');
    if (this.chatPrvd.getState() == 'undercover') {
      this.share.coords = this.params.get('coords');
      this.gpsPrvd.getGoogleAdress(this.share.coords.lat, this.share.coords.lng)
      .map(res => res.json()).subscribe(res => {
        console.log('[google address] res:', res);
        this.share.message = res.results[0].formatted_address;
      }, err => {
        console.log('[google address] error:', err);
      });
    } else {
      this.share.message = this.params.get('message');
      this.share.image = this.params.get('image');
    }
    this.mainBtn.state = 'fadeInfast';
  }
}
