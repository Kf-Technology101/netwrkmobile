import { Component, ViewChild, ElementRef } from '@angular/core';
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

  private codeVal:any = '';
  private signUpErrorString: string;
  private codeErrorString: string;
  private termsAgreement:boolean = false;

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
    if (this.confirmCode == this.auth.confirmCode &&
        this.termsAgreement) {
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
    let errorTimer = setTimeout(() => {
      this.tools.showToast('Something went wrong, try again');
      this.tools.hideLoader();
    }, 10000);
    this.tools.showLoader();
    this.auth.verification(this.auth.registerData)
    .map(res => res.json())
    .subscribe(res => {
      this.tools.hideLoader();
      clearTimeout(errorTimer);
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
      clearTimeout(errorTimer);
      if (this.platform.is('cordova')) {
        this.tools.showToast(this.codeErrorString);
      } else {
        this.tools.pushPage(SignUpFacebookPage);
      }
    });
  }

  private checkCode(eventName?:string):void {
    if (this.codeVal.trim() != '' &&
        this.termsAgreement) {
      let state:string;
      switch(eventName){
        case 'focus':
          state = 'minimised';
          break;
        case 'blur':
          state = 'normal';
          break;
      }
      if (!eventName) {
        this.mainBtn.state = 'normal';
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
