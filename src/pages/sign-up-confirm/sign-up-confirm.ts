import { Component } from '@angular/core';
import {
  NavController,
  NavParams,
  Platform,
  Events
} from 'ionic-angular';

// Pages
import { SignUpFacebookPage } from '../sign-up-facebook/sign-up-facebook';

// Providers
import { Auth } from '../../providers/auth';
import { Tools } from '../../providers/tools';

// Animations
import {
  scaleMainBtn,
  toggleFade
} from '../../includes/animations';

@Component({
  selector: 'page-sign-up-confirm',
  templateUrl: 'sign-up-confirm.html',
  animations: [
    scaleMainBtn,
    toggleFade
  ]
})
export class SignUpConfirmPage {
  confirmCode: number;
  contentState: string = 'fadeOut';
  mainBtn: any = {
    state: 'hidden'
  };

  private signUpErrorString: string;
  private codeErrorString: string;

  constructor(
    public navCtrl: NavController,
    public auth: Auth,
    public navParams: NavParams,
    public platform: Platform,
    public tools: Tools,
    public events: Events
  ) {
    this.signUpErrorString = 'Unable to Sign Up. Please check your account information and try again.';
    this.codeErrorString = 'We wish it was right... But its not.';
  }

  doSignUp() {
    console.log('data', this.auth.registerData);
    console.log('sms', this.confirmCode);
    this.tools.showLoader();
    if (this.confirmCode == this.auth.confirmCode) {
      this.auth.signup(this.auth.registerData)
        .map(res => res.json())
        .subscribe(resp => {
          this.tools.hideLoader();
          console.log(resp);
          this.tools.pushPage(SignUpFacebookPage);
        }, err => {
          this.tools.hideLoader();
          this.tools.showToast(this.signUpErrorString);
        });
    } else {
      this.tools.hideLoader();
      this.tools.showToast(this.codeErrorString);
    }
  }

  sendCode() {
    this.tools.showLoader();
    this.auth.verification(this.auth.registerData)
      .map(res => res.json())
      .subscribe(res => {
        this.tools.hideLoader();
        switch (res.login_type) {
          case 'email':
          case 'phone':
            this.auth.registerData.type = res.login_type;
            this.auth.saveRegisterData(this.auth.registerData);
            break;
          default: this.tools.showToast(this.codeErrorString);
        }
        this.tools.showToast(res.login_message);
    }, err => {
      this.tools.hideLoader();
      if (this.platform.is('cordova')) {
        this.tools.showToast(this.codeErrorString);
      } else {
        this.tools.pushPage(SignUpFacebookPage);
      }
    });
  }

  private checkCode(event:any, eventName?:string):void {
    if (event.target.value.trim() != '') {
      let state:string;
      switch(eventName){
        case 'focus':
          state = 'minimised';
          break;
        case 'blur':
          state = 'normal';
          break;
      }
      this.mainBtn.state = state;
    } else {
      this.mainBtn.state = 'hidden';
    }
  }

  goBack() {
    this.events.publish('signup:return', true);
    this.tools.popPage();
  }

}
