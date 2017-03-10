import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, Events } from 'ionic-angular';

// Pages
import { SignUpPage } from '../sign-up/sign-up';
import { HomePage } from '../home/home';
import { SignUpAfterFbPage } from '../sign-up-after-fb/sign-up-after-fb';

// Providers
import { User } from '../../providers/user';

import { ResponseAuthData } from '../../providers/user.interface';

@Component({
  selector: 'page-log-in',
  templateUrl: 'log-in.html',
})
export class LogInPage {
  account: {login: string, password: string} = {
    login: '',
    password: '',
    // login: '+380971460376',
    // password: '11111111',
  };

  private loginErrorString: string;
  private fbLoginErrorString: string;

  constructor(
    public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public navParams: NavParams,
    public events: Events
  ) {
    this.loginErrorString = 'Unable to login. Please check your account information and try again.';
    this.fbLoginErrorString = 'Unable to login with Facebook.';

    events.subscribe('backButton:clicked', () => {
      console.log('backButton');
    });
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
    this.user.signUpFacebook().then((data: ResponseAuthData) => {
      console.log(data);
      if (data.date_of_birthday) {
        let date = new Date(data.date_of_birthday);
        if (typeof date == 'object') {
          this.navCtrl.push(HomePage);
        }
      } else this.navCtrl.push(SignUpAfterFbPage);
    }, (err) => {
      this.navCtrl.push(SignUpAfterFbPage);
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
