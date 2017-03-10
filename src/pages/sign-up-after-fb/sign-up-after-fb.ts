import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

// Pages
import { HomePage } from '../home/home';

// Providers
import { User } from '../../providers/user';

@Component({
  selector: 'page-sign-up-after-fb',
  templateUrl: 'sign-up-after-fb.html'
})
export class SignUpAfterFbPage {
  date_of_birthday: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public user: User,
    public toastCtrl: ToastController
  ) {}

  doSignUp(form: any) {
    form.ngSubmit.emit();
    let updateObj = {
      user: {
        date_of_birthday: this.date_of_birthday
      }
    };

    this.user.update(this.user.fbResponseData.id, updateObj, 'fb')
      .map(res => res.json()).subscribe(res => {
        this.navCtrl.push(HomePage);
      }, err => {
        let toast = this.toastCtrl.create({
          message: JSON.stringify(err),
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
    console.log('ionViewDidLoad SignUpAfterFbPage');
  }

}
