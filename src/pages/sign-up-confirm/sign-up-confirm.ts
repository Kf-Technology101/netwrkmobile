import { Component } from '@angular/core';
import {
  NavController,
  NavParams,
  Platform
} from 'ionic-angular';

// Pages
import { SignUpContactListPage } from '../sign-up-contact-list/sign-up-contact-list';

// Providers
import { User } from '../../providers/user';
import { Tools } from '../../providers/tools';

@Component({
  selector: 'page-sign-up-confirm',
  templateUrl: 'sign-up-confirm.html'
})
export class SignUpConfirmPage {
  confirmCode: number;
  hiddenMainBtn: boolean = false;

  private signUpErrorString: string;
  private codeErrorString: string;

  constructor(
    public navCtrl: NavController,
    public user: User,
    public navParams: NavParams,
    public platform: Platform,
    public tools: Tools
  ) {
    this.signUpErrorString = 'Unable to Sign Up. Please check your account information and try again.';
    this.codeErrorString = 'Code error!';
  }

  doSignUp() {
    console.log('data', this.user.registerData);
    console.log('sms', this.confirmCode);
    this.tools.showLoader();
    if (this.confirmCode == this.user.confirmCode) {
      this.user.signup(this.user.registerData)
        .map(res => res.json())
        .subscribe((resp) => {
          this.tools.hideLoader();
          console.log(resp);
          this.navCtrl.push(SignUpContactListPage);
        }, (err) => {
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
    this.user.verification(this.user.registerData)
      .map(res => res.json())
      .subscribe(res => {
        this.tools.hideLoader();
        switch (res.login_type) {
          case 'email':
          case 'phone':
            this.user.registerData.type = res.login_type;
            this.user.saveRegisterData(this.user.registerData);
            break;
          default: this.tools.showToast(this.codeErrorString);
        }
        this.tools.showToast(res.login_message);
    }, err => {
      this.tools.hideLoader();
      if (this.platform.is('cordova')) {
        this.tools.showToast(this.codeErrorString);
      } else {
        this.navCtrl.push(SignUpContactListPage);
      }
    });
  }

  goBack() { this.navCtrl.pop(); }

  ionViewDidLoad() { this.hiddenMainBtn = true; }
  ionViewWillEnter() { this.hiddenMainBtn = false; }
  ionViewWillLeave() { this.hiddenMainBtn = true; }

}
