import { Component } from '@angular/core';
import {
  NavController,
  NavParams,
  Events
} from 'ionic-angular';

// Pages
import { SignUpPage } from '../sign-up/sign-up';
// import { HomePage } from '../home/home';
import { SignUpAfterFbPage } from '../sign-up-after-fb/sign-up-after-fb';
import { SignUpContactListPage } from '../sign-up-contact-list/sign-up-contact-list';
import { ProfileSettingPage } from '../profile-setting/profile-setting';

// Providers
import { User } from '../../providers/user';
import { ContactsProvider } from '../../providers/contacts';
import { Tools } from '../../providers/tools';

// Interfaces
import { ResponseAuthData } from '../../interfaces/user';

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

  hiddenMainBtn: boolean = false;

  private textStrings: any = {};

  constructor(
    public navCtrl: NavController,
    public user: User,
    public navParams: NavParams,
    public events: Events,
    public contactsPrvd: ContactsProvider,
    public tools: Tools
  ) {
    this.textStrings.login = 'Unable to login. Please check your account information and try again.';
    this.textStrings.fb = 'Unable to login with Facebook.';
    this.textStrings.require = 'Please fill all fields';

    events.subscribe('backButton:clicked', () => {
      console.log('backButton');
    });
  }

  doLogin(form: any) {
    console.log(form);
    if (form.invalid) {
      this.tools.showToast(this.textStrings.require);
      return;
    }

    this.tools.showLoader();
    this.user.login(this.account).map(res => res.json()).subscribe(resp => {
      console.log(resp);
      this.tools.hideLoader();
      this.tools.getLoginPage(ProfileSettingPage, SignUpContactListPage).then(
        res => this.navCtrl.push(res),
        err => this.navCtrl.push(ProfileSettingPage)
      );
    }, err => {
      this.tools.showToast(this.textStrings.login);
      this.tools.hideLoader();
    });
  }

  doFbLogin() {
    this.tools.showLoader();
    this.user.signUpFacebook().then((data: ResponseAuthData) => {
      console.log(data);
      this.tools.hideLoader();
      if (data.date_of_birthday) {
        let date = new Date(data.date_of_birthday);
        if (typeof date == 'object') {
          this.tools.getLoginPage(ProfileSettingPage, SignUpContactListPage).then(
            res => this.navCtrl.push(res),
            err => this.navCtrl.push(ProfileSettingPage)
          );
        }
      } else this.navCtrl.push(SignUpAfterFbPage);
    }, err => {
      this.tools.hideLoader();
      this.tools.showToast(this.textStrings.fb);
    });
  }

  goToSignUp() { this.navCtrl.push(SignUpPage); }

  ionViewDidLoad() { this.hiddenMainBtn = true; }
  ionViewWillEnter() { this.hiddenMainBtn = false; }
  ionViewWillLeave() { this.hiddenMainBtn = true; }


}
