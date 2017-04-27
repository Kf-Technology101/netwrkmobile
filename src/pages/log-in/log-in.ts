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
import { UndercoverCharacterPage } from '../undercover-character/undercover-character';
import { SignUpFacebookPage } from '../sign-up-facebook/sign-up-facebook';

// Providers
import { Auth } from '../../providers/auth';
import { ContactsProvider } from '../../providers/contacts';
import { Tools } from '../../providers/tools';
import { UndercoverProvider } from '../../providers/undercover';

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
  public account: { login: string, password: string } = {
    login: '',
    password: ''
  };
  public contentState: string = 'fadeOut';
  public mainBtn: any = { state: 'normal' };
  private textStrings: any = {};

  constructor(
    public navCtrl: NavController,
    public authPrvd: Auth,
    public navParams: NavParams,
    public events: Events,
    public contactsPrvd: ContactsProvider,
    public tools: Tools,
    public undercoverPrvd: UndercoverProvider
  ) {
    this.textStrings.login = 'Unable to login. Please check your account information and try again.';
    this.textStrings.fb = 'Unable to login with Facebook.';
    this.textStrings.require = 'Please fill all fields';
  }

  doLogin(form: any) {
    console.log(form);
    if (form.invalid) {
      this.tools.showToast(this.textStrings.require);
      return;
    }

    this.tools.showLoader();
    this.authPrvd.login(this.account).map(res => res.json()).subscribe(resp => {
      console.log(resp);
      this.tools.hideLoader();
      let fbConnected = this.authPrvd.getFbConnected();
      let page = fbConnected ?
        this.undercoverPrvd.getCharacterPerson(UndercoverCharacterPage, NetworkFindPage) :
        SignUpFacebookPage;
      this.tools.pushPage(page);
    }, err => {
      this.tools.showToast(this.textStrings.login);
      this.tools.hideLoader();
    });
  }

  doFbLogin() {
    this.authPrvd.signUpFacebook().then((data: ResponseAuthData) => {
      console.log(data);
      
      // if (data.date_of_birthday) {
      //   let date = new Date(data.date_of_birthday);
      //   if (typeof date == 'object') {
      //     this.authPrvd.setFbConnected();
      //     let page = this.undercoverPrvd.getCharacterPerson(UndercoverCharacterPage, NetworkFindPage);
      //     this.tools.pushPage(page);
      //   }
      // } else this.tools.pushPage(SignUpAfterFbPage);
    }, err => {
      console.log(err);
      this.tools.showToast(this.textStrings.fb);
    });
  }

  goToSignUp() { this.tools.pushPage(SignUpPage); }

  ngOnInit(){
    this.contentState = 'fadeIn';
  }
}
