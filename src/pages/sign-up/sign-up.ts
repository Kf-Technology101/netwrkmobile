import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

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
  account: {phone: string, password: string, date_of_birthday: string} = {
    phone: '+380971460376',
    password: '11111111',
    date_of_birthday: '1993-10-02',
  };

  private signUpErrorString: string;
  private fbSignUpErrorString: string;

  constructor(
    public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public navParams: NavParams
  ) {
    this.fbSignUpErrorString = 'Unable to SignUp with Facebook.';
  }

  doSignUp() {
    this.user.getSMSCode();
    this.user.saveRegisterData(this.account);
    this.navCtrl.push(SignUpConfirmPage);
  }

  doFbLogin() {
    this.user.signUpFacebook().then((data) => {
      console.log(data);
      this.navCtrl.push(HomePage);
    }, (err) => {
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
