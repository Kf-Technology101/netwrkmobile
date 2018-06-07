import { Component, NgZone } from '@angular/core';
import { NavParams, ViewController, ModalController, AlertController, Platform } from 'ionic-angular';

import { NetworkContactListPage } from '../../pages/network-contact-list/network-contact-list';

import { Chat } from '../../providers/chat';
import { Tools } from '../../providers/tools';
import { Gps } from '../../providers/gps';
import { Auth } from '../../providers/auth';

import { toggleFade } from '../../includes/animations';

import { SocialSharing } from '@ionic-native/social-sharing';
import { Facebook } from '@ionic-native/facebook';
import { FeedbackService } from '../../providers/feedback.service';

@Component({
  selector: 'modal-feedbackshare',
  templateUrl: 'feedbackshare.html',
  animations: [
    toggleFade
  ]
})
export class FeedbackShareModal {

  private mainBtn: any = {
    state: 'fadeInfast',
    hidden: false
  }

  private share: any = {
    coords: null,
    message: null,
    image: null,
    url: 'http://netwrkapp.com' /*'http://netwrk.com'*/
  }

  private backBtn:any = {
    hidden: null
  };

  constructor(
    private params: NavParams,
    private viewCtrl: ViewController,
    private modalCtrl: ModalController,
    public chatPrvd: Chat,
    public toolsPrvd: Tools,
    private socialShare: SocialSharing,
    private facebook: Facebook,
    private alertCtrl: AlertController,
    private gpsPrvd: Gps,
    private plt: Platform,
    public auth: Auth,
    public feedback: FeedbackService
  ) { }

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
    console.log('fb this.share:', this.share);
    this.toolsPrvd.showLoader();
    this.feedback.autoPostToFacebook(this.share).then(res => {
      this.toolsPrvd.hideLoader();
      console.log(res);
    }, err => {
      this.toolsPrvd.hideLoader();
      console.error(err);
    });

  }

  shareViaTwitter() {
    console.log('twtr this.share:', this.share);
    this.toolsPrvd.showLoader();
    this.socialShare.shareViaTwitter(this.share.message, this.share.image)
    .then(result => {
      // Success!
      this.toolsPrvd.hideLoader();
      console.log('[Twitter share] success!:', result);
    }, err => {
      // An error occurred. Show a message to the user
      this.toolsPrvd.hideLoader();
      console.error('[Twitter share] error:', err);
      let alert = this.alertCtrl.create({
        title: '',
        subTitle: 'You might need to install Twitter app',
        buttons: ['OK']
      });
      alert.present();
    });
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
    console.log('feedbackShare modal [did enter]');
    this.backBtn.hidden = false;
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
    // this.mainBtn.state = 'fadeInfast';
  }
}
