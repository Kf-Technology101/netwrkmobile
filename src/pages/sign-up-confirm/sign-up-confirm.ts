import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, Platform } from 'ionic-angular';

// Pages
import { SignUpContactListPage } from '../sign-up-contact-list/sign-up-contact-list';

// Providers
import { User } from '../../providers/user';

@Component({
  selector: 'page-sign-up-confirm',
  templateUrl: 'sign-up-confirm.html'
})
export class SignUpConfirmPage {
  confirmCode: number;

  private signUpErrorString: string;
  private codeErrorString: string;

  constructor(
    public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public navParams: NavParams,
    public platform: Platform
  ) {
    this.signUpErrorString = 'Unable to Sign Up. Please check your account information and try again.';
    this.codeErrorString = 'Code error!';
  }

  doSignUp() {
    // if (this.platform.is('cordova')) {
      console.log('data', this.user.registerData);
      console.log('sms', this.confirmCode);
      if (this.confirmCode == this.user.confirmCode) {
        this.user.signup(this.user.registerData)
          .map(res => res.json())
          .subscribe((resp) => {
            console.log(resp);
            this.navCtrl.push(SignUpContactListPage);
          }, (err) => {
            //
            // let body = JSON.parse(err._body);
            // console.log(body, body[this.user.registerData.type]);
            this.navCtrl.push(SignUpContactListPage);
            let toast = this.toastCtrl.create({
              message: this.signUpErrorString,
              duration: 3000,
              position: 'top'
            });
            toast.present();
          });
      } else {
        let toast = this.toastCtrl.create({
          message: this.codeErrorString,
          duration: 3000,
          position: 'top'
        });
        toast.present();
      }
    // } else {
    //   this.navCtrl.push(SignUpContactListPage);
    // }
  }

  sendCode() {
    this.user.verification(this.user.registerData)
      .map(res => res.json())
      .subscribe(res => {
        switch (res.login_type) {
          case 'email':
          case 'phone':
            this.user.registerData.type = res.login_type;
            this.user.saveRegisterData(this.user.registerData);
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
          message: this.codeErrorString,
          duration: 3000,
          position: 'top'
        });
        toast.present();
      } else {
        this.navCtrl.push(SignUpContactListPage);
      }
    });
  }

  goBack() {
    this.navCtrl.pop();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignUpConfirmPage');
  }

}
