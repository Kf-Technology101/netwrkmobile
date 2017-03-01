import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

// Pages
import { HomePage } from '../home/home';

// Providers
import { User } from '../../providers/user';

@Component({
  selector: 'page-sign-up-confirm',
  templateUrl: 'sign-up-confirm.html'
})
export class SignUpConfirmPage {
  smsCode: number;

  private signUpErrorString: string;

  constructor(
    public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public navParams: NavParams
  ) {
    this.signUpErrorString = 'Unable to Sign Up. Please check your account information and try again.';
  }

  doSignUp() {
    console.log('data', this.user._registerData);
    console.log('sms', this.smsCode);
    if (this.smsCode == this.user._smsCode) {
      this.user.signup(this.user._registerData).subscribe((resp) => {
        console.log(resp);
        this.navCtrl.push(HomePage);
      }, (err) => {
        console.log(err);
        let toast = this.toastCtrl.create({
          message: this.signUpErrorString,
          duration: 3000,
          position: 'top'
        });
        toast.present();
      });
    } else {
      let toast = this.toastCtrl.create({
        message: 'SMS code error!',
        duration: 3000,
        position: 'top'
      });
      toast.present();
    }
  }

  sendSMS() {
    this.user.getSMSCode();
  }

  goBack() {
    this.navCtrl.pop();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignUpConfirmPage');
  }

}
