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
// import { NetworkContactListPage } from '../network-contact-list/network-contact-list';
import { NetworkFindPage } from '../network-find/network-find';

// Providers
import { User } from '../../providers/user';
import { ContactsProvider } from '../../providers/contacts';
import { Tools } from '../../providers/tools';

// Interfaces
import { ResponseAuthData } from '../../interfaces/user';

// Animations
import {
  scaleMainBtn,
  toggleFade
} from '../../includes/animations';

@Component({
  selector: 'page-log-in',
  templateUrl: 'log-in.html',
  animations: [
    scaleMainBtn,
    toggleFade
  ]
})

export class LogInPage {

  account: { login: string, password: string } = {
    login: '',
    password: ''
    // login: '+380971460376',
    // password: '11111111',
  };

  contentState: string = 'fadeOut';

  hiddenMainBtn: boolean = false;
  // mainBtnState: string = 'hidden';
  mainBtn: any = {
    state: 'normal'
  };

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
      this.tools.pushPage(NetworkFindPage);
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
          this.tools.pushPage(NetworkFindPage);
        }
      } else this.tools.pushPage(SignUpAfterFbPage);
    }, err => {
      this.tools.hideLoader();
      this.tools.showToast(this.textStrings.fb);
    });
  }

  goToSignUp() { this.tools.pushPage(SignUpPage); }

  ionViewDidLoad() {
    this.hiddenMainBtn = true;
  }
  ngOnInit(){
    this.contentState = 'fadeIn';
  }
  ionViewWillEnter() { this.hiddenMainBtn = false; }
  ionViewWillLeave() { this.hiddenMainBtn = true; }
}
