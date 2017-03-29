import {
  Component
} from '@angular/core';

import {
  NavController,
  NavParams,
  Platform
} from 'ionic-angular';

// Pages
// import { HomePage } from '../home/home';
import { SignUpConfirmPage } from '../sign-up-confirm/sign-up-confirm';
import { SignUpAfterFbPage } from '../sign-up-after-fb/sign-up-after-fb';
// import { NetworkContactListPage } from '../network-contact-list/network-contact-list';
// import { ProfileSettingPage } from '../profile-setting/profile-setting';
import { NetworkFindPage } from '../network-find/network-find';

// Providers
import { User } from '../../providers/user';
import { Tools } from '../../providers/tools';

// Interfaces
import { ResponseAuthData } from '../../interfaces/user';

// Animations
import { animSpeed } from '../../includes/animations';
import { toggleInputsFade } from '../../includes/animations';

@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html',
  animations: [
    toggleInputsFade
  ]
})

export class SignUpPage {
  account: {
    login: string,
    password: string,
    confirm_password: string,
    date_of_birthday: string,
    type: string
  } = {
    login: '',
    password: '',
    confirm_password: '',
    date_of_birthday: '',
    // login: '+380971460376',
    // password: '11111111',
    // confirm_password: '11111111',
    // date_of_birthday: '1993-10-02',
    type: ''
  };

  // object for toggling input elements relative to registration steps
  states: any = {
    login: {
      str: 'hidden',
      bool: true,
      id: 0
    },
    password: {
      str: 'hidden',
      bool: false,
      id: 1
    },
    date_of_birthday: {
      str: 'hidden',
      bool: false,
      id: 2
    },
  };

  // id of the active state (this.states[n].id). Default: -1
  activeStateId: number = -1;

  hiddenMainBtn: boolean = false;
  maxBirthday: number;

  private textStrings: any = {};

  constructor(
    public navCtrl: NavController,
    public user: User,
    public navParams: NavParams,
    public platform: Platform,
    public tools: Tools
  ) {
    this.maxBirthday = new Date().getFullYear() - 1;

    this.textStrings.fb = 'Unable to SignUp with Facebook.';
    this.textStrings.login = 'Please enter valid login';
    this.textStrings.password = 'The passwords not match!';
    this.textStrings.require = 'Please fill all fields';
  }

  doSignUp(form: any) {
    console.log(form, this.account);

    // --- validation needed ---
    let accKeys = Object.keys(this.account);
    if(this.account[accKeys[this.activeStateId]].trim() != ''){
      this.activeStateId++;
    }
    // -------------------------

    for(let i in this.states){
      if(this.states[i].id == this.activeStateId){
        let self = this;
        setTimeout(() => {
          self.states[i].str = "shown";
          self.states[i].bool = true;
        }, animSpeed.fadeOut);
      }else{
        this.states[i].str = "hidden";
        let self = this;
        setTimeout(() => {
          self.states[i].bool = false;
        }, animSpeed.fadeOut);
      }
    }

    // if (form.invalid) {
    //   this.tools.showToast(this.textStrings.require);
    //   return;
    // }
    //
    // this.tools.showLoader();
    // if (this.account.password == this.account.confirm_password) {
    //   this.user.saveRegisterData(this.account);
    //   this.user.verification(this.account)
    //     .map(res => res.json())
    //     .subscribe(res => {
    //       console.log(res);
    //       this.tools.hideLoader();
    //
    //       this.account.type = res.login_type;
    //       this.navCtrl.push(SignUpConfirmPage);
    //
    //       this.tools.showToast(res.login_message);
    //   }, err => {
    //     this.tools.hideLoader();
    //     if (this.platform.is('cordova')) {
    //       this.tools.showToast(this.textStrings.login);
    //     } else {
    //       this.navCtrl.push(SignUpConfirmPage);
    //     }
    //   });
    // } else {
    //   this.tools.hideLoader();
    //   this.tools.showToast(this.textStrings.password);
    // }
  }

  doFbLogin() {
    this.user.signUpFacebook().then((data: ResponseAuthData) => {
      console.log(data);
      if (data.date_of_birthday) {
        let date = new Date(data.date_of_birthday);
        if (typeof date == 'object') {
          this.navCtrl.push(NetworkFindPage);
          // this.tools.getLoginPage(ProfileSettingPage, NetworkContactListPage).then(
          //   res => this.navCtrl.push(res),
          //   err => this.navCtrl.push(ProfileSettingPage)
          // );
        }
      } else this.navCtrl.push(SignUpAfterFbPage);
    }, err => {
      this.tools.showToast(this.textStrings.fb);
    });
  }

  goBack() { this.navCtrl.pop(); }

  updateStates(){
    for(let i in this.states){
      this.states[i].str = this.states[i].bool ? 'shown' : 'hidden';
    }
  }

  ionViewDidLoad() {
    this.activeStateId++;
    this.hiddenMainBtn = true;
    this.updateStates();
  }
  ionViewWillEnter() { this.hiddenMainBtn = false; }
  ionViewWillLeave() { this.hiddenMainBtn = true; }

}
