import { Component } from '@angular/core';
import {
  NavController,
  NavParams
} from 'ionic-angular';

// Pages
// import { HomePage } from '../home/home';
import { SignUpContactListPage } from '../sign-up-contact-list/sign-up-contact-list';
import { ProfileSettingPage } from '../profile-setting/profile-setting';

// Providers
import { User } from '../../providers/user';
import { Tools } from '../../providers/tools';

@Component({
  selector: 'page-sign-up-after-fb',
  templateUrl: 'sign-up-after-fb.html'
})
export class SignUpAfterFbPage {
  date_of_birthday: string;
  hiddenMainBtn: boolean = false;
  maxBirthday: number;

  private validBirthdayErrorString: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public user: User,
    public tools: Tools
  ) {
    this.maxBirthday = new Date().getFullYear() - 1;
    this.validBirthdayErrorString = 'Please fill all fields';
  }

  doSignUp(form: any) {
    console.log(form);
    if (form.valid) {
      this.tools.showLoader();
      let updateObj = { user: { date_of_birthday: this.date_of_birthday } };

      this.user.update(this.user.fbResponseData.id, updateObj, 'fb')
        .map(res => res.json()).subscribe(res => {
          this.tools.hideLoader();
          this.tools.getLoginPage(ProfileSettingPage, SignUpContactListPage).then(
            res => this.navCtrl.push(res),
            err => this.navCtrl.push(ProfileSettingPage)
          );
        }, err => {
          this.tools.hideLoader();
          this.tools.showToast(JSON.stringify(err));
        });
    } else {
      this.tools.showToast(this.validBirthdayErrorString);
    }
  }

  goBack() { this.navCtrl.pop(); }

  ionViewDidLoad() { this.hiddenMainBtn = true; }
  ionViewWillEnter() { this.hiddenMainBtn = false; }
  ionViewWillLeave() { this.hiddenMainBtn = true; }

}
