import { Component } from '@angular/core';
import {
  NavController,
  NavParams,
  Events
} from 'ionic-angular';

// Pages
import { SignUpPage } from '../sign-up/sign-up';
import { SignUpAfterFbPage } from '../sign-up-after-fb/sign-up-after-fb';
import { NetworkFindPage } from '../network-find/network-find';
import { UndercoverCharacterPage } from '../undercover-character/undercover-character';
import { SignUpFacebookPage } from '../sign-up-facebook/sign-up-facebook';

// Providers
import { Auth } from '../../providers/auth';
import { ContactsProvider } from '../../providers/contacts';
import { Tools } from '../../providers/tools';
import { UndercoverProvider } from '../../providers/undercover';
import { User } from '../../providers/user';

// import { Keyboard } from '@ionic-native/keyboard';

// Animations
import {
  scaleMainBtn,
  toggleFade
} from '../../includes/animations';

// Animations
import { chatAnim } from '../../includes/animations';
import { Toggleable } from '../../includes/toggleable';

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
  // public mainBtn: any = { state: 'normal' };
  private textStrings: any = {};

  public mainBtn = new Toggleable('normal', false);
  public postBtn = new Toggleable(false);

  constructor(
    public navCtrl: NavController,
    public authPrvd: Auth,
    public navParams: NavParams,
    public events: Events,
    public contactsPrvd: ContactsProvider,
    public tools: Tools,
    public undercoverPrvd: UndercoverProvider,
    public user: User
  ) {
    this.textStrings.login = 'Unable to login. Please check your account information and try again.';
    this.textStrings.fb = 'Unable to login with Facebook.';
    this.textStrings.require = 'Please fill all fields';

    // this.repeat(1000, () => Promise.all([this.myfunction()]))
    // .then(data => {
    //   console.log('repeat start')
    // });

    // this.keyboard.onKeyboardShow().subscribe(res => {
    //   // console.log(res);
    //   this.postBtn.setState(true);
    //   setTimeout(() => {
    //     this.mainBtn.setState('minimised');
    //     if (!this.chatPrvd.appendContainer.hidden) {
    //       this.mainBtn.setState('above_append');
    //     }
    //   }, chatAnim / 2 + 1);
    // }, err => {
    //   console.log(err);
    // });
    //
    // this.keyboard.onKeyboardHide().subscribe(res => {
    //   // console.log(res);
    //   setTimeout(() => {
    //     if (!this.chatPrvd.appendContainer.hidden) {
    //       this.mainBtn.setState('above_append');
    //     }
    //     if (this.chatPrvd.appendContainer.hidden) {
    //       this.mainBtn.setState('normal');
    //     }
    //     if (this.txtIn.value.trim() == '' &&
    //         !this.chatPrvd.appendContainer.isVisible()) {
    //       this.chatPrvd.postBtn.setState(false);
    //     }
    //   }, chatAnim/2 + 1);
    //
    // }, err => {
    //   console.log(err);
    // });
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
        this.undercoverPrvd.getCharacterPerson(
          UndercoverCharacterPage, NetworkFindPage) :
        SignUpFacebookPage;
      this.tools.pushPage(page);
    }, err => {
      this.tools.showToast(this.textStrings.login);
      this.tools.hideLoader();
    });
  }

  doFbLogin() {
    this.authPrvd.signUpFacebook().then((data: any) => {
      console.log(data);
      this.tools.showLoader();
      this.user.update(data.result.id, data.update, 'facebook')
      .map(res => res.json()).subscribe(res => {
        console.log(res);
        this.tools.hideLoader();
        if (res.date_of_birthday) {
          let date = new Date(res.date_of_birthday);
          if (typeof date == 'object') {
            this.authPrvd.setFbConnected();
            let page = this.undercoverPrvd.getCharacterPerson(
              UndercoverCharacterPage, NetworkFindPage);
            this.tools.pushPage(page);
          }
        } else this.tools.pushPage(SignUpAfterFbPage);
      }, err => {
        console.log(err);
        this.tools.hideLoader();
        this.tools.showToast(JSON.stringify(err));
      });
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
