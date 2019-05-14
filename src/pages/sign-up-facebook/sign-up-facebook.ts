import { Component,ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams,Events,AlertController } from 'ionic-angular';

// Providers

import { FeedbackService } from "../../providers/feedback.service";

// Pages
import { SignUpPage } from '../sign-up/sign-up';
import { SignUpAfterFbPage } from '../sign-up-after-fb/sign-up-after-fb';
import { SignUpFacebookPage } from '../sign-up-facebook/sign-up-facebook';
import { HoldScreenPage } from '../hold-screen/hold-screen';


import { ChatPage } from '../chat/chat';

// Providers
import { Auth } from '../../providers/auth';
import { ContactsProvider } from '../../providers/contacts';
import { Tools } from '../../providers/tools';
import { UndercoverProvider } from '../../providers/undercover';
import { User } from '../../providers/user';
import { Chat } from '../../providers/chat';
import { LocationChange } from '../../providers/locationchange';
import { Keyboard } from '@ionic-native/keyboard';
import { LocalStorage } from '../../providers/local-storage';
import { Social } from '../../providers/social';
import { Gps } from '../../providers/gps';


// Interfaces
// import { User } from '../../interfaces/user';

@Component({ 
  selector: 'page-sign-up-facebook',
  templateUrl: 'sign-up-facebook.html'
})
export class SignUpFacebookPage {

  constructor(
    public events: Events,
    public contactsPrvd: ContactsProvider,
    public undercoverPrvd: UndercoverProvider,
    public chatPrvd: Chat,
    public locationchange: LocationChange,
    public keyboard: Keyboard,
    private storage: LocalStorage,
    private alertCtrl: AlertController,
    private gps: Gps,
  
  
  
    public navCtrl: NavController,
    public navParams: NavParams,
    public socialPrvd: Social,
    public toolsPrvd: Tools,
    public authPrvd: Auth,
    public userPrvd: User,
    private feedbackService: FeedbackService
  ) {}

  public connectToFacebook() {
    this.socialPrvd.connectToFacebook().then(fbRes => {
      let data: any = {
        provider: {
          name: 'fb',
          token: fbRes.authResponse.accessToken
        }
      };

      let authData = this.authPrvd.getAuthData();

      this.authPrvd.connectAccountToFb(data, fbRes).then(connectRes => {
        this.userPrvd.update(authData.id, connectRes.update, 'facebook')
        .map(connectRes => connectRes.json()).subscribe(updateRes => {
          console.log('user.update res:', updateRes);

          // ####################### FACEBOOK AUTOPOST #########################
          //
          // this.feedbackService.autoPostToFacebook();
          //
          // ###################################################################

          this.toolsPrvd.showToast('Facebook successfully connected');
          this.toolsPrvd.pushPage(ChatPage);
        }, err => {
          console.log(err);
          // this.toolsPrvd.showToast(JSON.stringify(err));
        });
      }).catch(err => console.error('ERROR', err));
    });
  }


  public skipConnectToFacebook() {
      this.toolsPrvd.pushPage(ChatPage);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignUpFacebookPage');
  }

  ionViewDidEnter() {
    this.toolsPrvd.hideLoader();
  }

}
