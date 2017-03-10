import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-sign-up-after-fb',
  templateUrl: 'sign-up-after-fb.html'
})
export class SignUpAfterFbPage {
  date_of_birthday: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams
  ) {}

  doSignUp(form: any) {
    form.ngSubmit.emit();
    console.log('date_of_birthday', this.date_of_birthday, form);
  }

  goBack() {
    this.navCtrl.pop();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignUpAfterFbPage');
  }

}
