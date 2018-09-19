

import { Component,ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams,Events,AlertController } from 'ionic-angular';

// Pages
import { SignUpPage } from '../sign-up/sign-up';
import { SignUpAfterFbPage } from '../sign-up-after-fb/sign-up-after-fb';
import { SignUpFacebookPage } from '../sign-up-facebook/sign-up-facebook';
import { HoldScreenPage } from '../hold-screen/hold-screen';

// Providers
import { Auth } from '../../providers/auth';
import { ContactsProvider } from '../../providers/contacts';
import { Tools } from '../../providers/tools';
import { UndercoverProvider } from '../../providers/undercover';
import { User } from '../../providers/user';
import { Chat } from '../../providers/chat';
import { LocationChange } from '../../providers/locationchange';
import { Keyboard } from '@ionic-native/keyboard';
import { LocalStorage } from '../../providers/local-storage';
import { Social } from '../../providers/social';
import { Gps } from '../../providers/gps';

// Animations
import {scaleMainBtn,toggleFade,
  chatAnim
} from '../../includes/animations';
//LogInPage.prototype.doFbLogin
// Custom classes
import { Toggleable } from '../../includes/toggleable';

@IonicPage()
@Component({
    selector: 'page-log-in',
    templateUrl: 'log-in.html',
    animations: [
        scaleMainBtn,
        toggleFade
    ]
})

export class LogInPage {
  @ViewChild('loginForm') logForm: ElementRef;
  private showLoginForm: boolean = false;
  public account: any = {
    login: '',
    password: ''
  };

  public controls: any = {
    state: 'fadeOut',
    hidden: true
  };
  private textStrings: any = {};

  public postBtn = new Toggleable(false);
  public form = new Toggleable('fadeOut', true);

  constructor(
    public navCtrl: NavController,
    public authPrvd: Auth,
    public navParams: NavParams,
    public events: Events,
    public contactsPrvd: ContactsProvider,
    public tools: Tools,
    public undercoverPrvd: UndercoverProvider,
    public user: User,
    public chatPrvd: Chat,
    public locationchange: LocationChange,
    public keyboard: Keyboard,
    private storage: LocalStorage,
    private alertCtrl: AlertController,
    private gps: Gps
  ) {
    this.textStrings.login = 'Unable to login. Please check your account information and try again.';
    this.textStrings.fb = 'Unable to login with Facebook.';
    this.textStrings.require = 'Please fill all fields';
  }

  private toggleLoginForm():void {
    if (!this.form.isVisible()) {
      this.form.show();
      this.form.setState('fadeInfast');
    } else {
      this.form.setState('fadeOutfast');
      setTimeout(() => {
        this.form.hide();
      }, 400); // animation speed is 400ms
    }
  }


  /*
    Toggle user terms of use status, providing user id.
    This function used for log in control.
  */
  private patchUserTerms(userId:number):Promise<any> {
    return new Promise((resolve, reject) => {
      this.tools.showLoader();
      this.tools.toggleUsersTermsStatus(userId).subscribe(res => {
        this.tools.hideLoader();
        if (res.message == 'ok') resolve();
      }, err => {
        this.tools.hideLoader();
        console.error('[patchUserTerms]', err);
        reject();
      });
    });
  }

  doLogin(form:any) {
    if (form.invalid) {this.tools.showToast(this.textStrings.require); return;}

    this.tools.showLoader();
    this.authPrvd.login(this.account).map(res => res.json()).subscribe(resp => {
      console.log('login resp:', resp);
      if (resp.tou_accepted) {
        //let page = resp.fb_connected ? this.undercoverPrvd.getCharacterPerson(HoldScreenPage, ChatPage) : SignUpFacebookPage;
        //if (page == NetworkFindPage) {
        //  this.skipNetworkFindPage();
        //} else {
        //  this.tools.pushPage(page);
        //}
          this.tools.pushPage(HoldScreenPage);
      } else if (!resp.tou_accepted &&
        typeof resp.tou_accepted == 'boolean'){
        this.termsAlertShow('form', resp.id);
      }
    }, err => {
      this.tools.showToast(this.textStrings.login);
      this.tools.hideLoader();
    });
  }

  doFbLogin() {
    this.tools.showLoader();
    this.authPrvd.signUpFacebook().then(data => {
      console.log("Inside facebook Signup");
      console.log('signUpFacebook data:', data);
      // check user's terms of use acceptance status
      if (data.result.tou_accepted) {
        this.user.update(data.result.id, data.update, 'facebook')
        .map(res => res.json()).subscribe(res => {
          if (res.date_of_birthday) {
            let date = new Date(res.date_of_birthday);
            if (typeof date == 'object') {
              this.authPrvd.setFbConnected();
                this.chatPrvd.detectNetwork()
                this.tools.pushPage(HoldScreenPage)
            }
          } else {
            this.tools.hideLoader();
            this.tools.pushPage(SignUpAfterFbPage);
          }
        }, err => {
          console.error(err);
          this.tools.hideLoader();
          this.tools.showToast(JSON.stringify(err));
        });
      } else if (!data.result.tou_accepted &&
                 typeof data.result.tou_accepted == 'boolean'){
        this.termsAlertShow('fb', data.result.id);
      }
    }, err => {
      console.error(err);
      this.tools.hideLoader();
      this.tools.showToast(this.textStrings.fb);
    });
  }

  public inputBlured():void {
    this.chatPrvd.mainBtn.setState('centered');
  }

  public inputFocused():void {
    this.chatPrvd.mainBtn.setState('minimised');
  }

  private goToSignUp():void { this.tools.pushPage(SignUpPage); }

  public termsAlertShow(loginType:string, userId:number):void {
    let alert = this.alertCtrl.create({
      enableBackdropDismiss: false,
      title: '',
      subTitle: 'Do you agree to the ',
      buttons: [
        {
          cssClass: 'active',
          text: 'I agree',
          handler: () => {
            this.patchUserTerms(userId).then(res => {
              if (loginType == 'fb') this.doFbLogin();
              else this.doLogin(this.logForm);
              alert.dismiss();
            }, err => console.error('[pathUserTerms]', err));
            return false;
          }
        },
        {
          text: 'Decline',
          handler: () => {
            alert.dismiss();
            this.tools.hideLoader();
          }
        }
      ]
    });
    alert.present().then(res => {
      let alertSt = document.querySelector('.alert-sub-title');
      alertSt.innerHTML +=
      '<a href="http://netwrkapp.com/terms_of_use" target="_blank">Terms of Use</a>?';
    });
  }

  ngOnInit() {
    this.inputBlured();
  }

  ionViewDidEnter() {
    this.tools.hideLoader();
    this.keyboard.onKeyboardHide().subscribe(res => {
      this.chatPrvd.mainBtn.setState('centered');
    }, err => console.error(err));
    // console.log('[log-in] did enter');
    let mainBtn:any;
    setTimeout(() => {
      mainBtn = <HTMLElement>document.getElementById('main-btn');
      this.controls.hidden = true;
      this.controls.state = 'fadeOut';
      this.chatPrvd.mainBtn.setState('centered');
      setTimeout(() => {
        if (this.tools.hideSplash)
          this.tools.hideSplashScreen();
      }, 1);
    }, 1);
    setTimeout(() => {
      this.storage.rm('facebook_connected');
      //this.storage.rm('auth_data');
      //this.storage.rm('auth_type');
      this.storage.rm('social_auth_data');
      this.storage.rm('current_network');
      this.controls.hidden = false;
      this.controls.state = 'fadeIn';
      mainBtn.classList.add('anim-glow');
    }, 2000);
  }
}
