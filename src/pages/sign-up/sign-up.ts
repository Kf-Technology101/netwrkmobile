import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, Platform } from 'ionic-angular';

// Pages
import { HomePage } from '../home/home';
import { SignUpConfirmPage } from '../sign-up-confirm/sign-up-confirm';

// Providers
import { User } from '../../providers/user';

@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html'
})
export class SignUpPage {
  account: {
    login: string,
    password: string,
    confirm_password: string,
    date_of_birthday: string,
    type: string,
  } = {
    login: '',
    password: '',
    confirm_password: '',
    date_of_birthday: '',
    // login: '+380971460376',
    // password: '11111111',
    // confirm_password: '11111111',
    // date_of_birthday: '1993-10-02',
    type: '',
  };

  private fbSignUpErrorString: string;
  private validLoginErrorString: string;

  constructor(
    public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public navParams: NavParams,
    public platform: Platform
  ) {
    this.fbSignUpErrorString = 'Unable to SignUp with Facebook.';
    this.validLoginErrorString = 'Please enter valid login';
  }

  doSignUp() {
    console.log(this.account);
    this.user.saveRegisterData(this.account);
    this.user.verification(this.account)
      .map(res => res.json())
      .subscribe(res => {
        switch (res.login_type) {
          case 'email':
          case 'phone':
            this.account.type = res.login_type;
            this.navCtrl.push(SignUpConfirmPage);
            break;
        }
        let toast = this.toastCtrl.create({
          message: res.login_message,
          duration: 3000,
          position: 'top'
        });
        toast.present();
    }, err => {
      if (this.platform.is('cordova')) {
        let toast = this.toastCtrl.create({
          message: this.validLoginErrorString,
          duration: 3000,
          position: 'top'
        });
        toast.present();
      } else {
        this.navCtrl.push(SignUpConfirmPage);
      }
    });
  }

  doFbLogin() {
    this.user.signUpFacebook().then(data => {
      console.log(data);
      this.navCtrl.push(HomePage);
    }, err => {
      let toast = this.toastCtrl.create({
        message: this.fbSignUpErrorString,
        duration: 3000,
        position: 'top'
      });
      toast.present();
    });
  }

  goBack() {
    this.navCtrl.pop();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignUpPage');
  }

}
