import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

// Pages
import { SignUpPage } from '../sign-up/sign-up';
import { HomePage } from '../home/home';

// Providers
import { User } from '../../providers/user';

@Component({
  selector: 'page-log-in',
  templateUrl: 'log-in.html',
})
export class LogInPage {
  account: {phone: string, password: string} = {
    phone: '+380971460376',
    password: '11111111'
  };

  private loginErrorString: string;
  private fbLoginErrorString: string;

  constructor(
    public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public navParams: NavParams
  ) {
    this.loginErrorString = 'Unable to login. Please check your account information and try again.';
    this.fbLoginErrorString = 'Unable to login with Facebook.';
  }

  doLogin() {
    this.user.login(this.account).subscribe((resp) => {
      console.log(resp);
      this.navCtrl.push(HomePage);
    }, (err) => {
      console.log(err);
      let toast = this.toastCtrl.create({
        message: this.loginErrorString,
        duration: 3000,
        position: 'top'
      });
      toast.present();
    });
  }

  doFbLogin() {
    this.user.signUpFacebook().then((data) => {
      this.navCtrl.push(HomePage);
    }, (err) => {
      let toast = this.toastCtrl.create({
        message: this.fbLoginErrorString,
        duration: 3000,
        position: 'top'
      });
      toast.present();
    });
  }

  goToSignUp() {
    this.navCtrl.push(SignUpPage);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LogInPage');
  }

}
