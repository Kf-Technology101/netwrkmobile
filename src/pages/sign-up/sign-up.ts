import {
  Component,
  ViewChild,
  ElementRef
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import {
  NavController,
  NavParams,
  Platform,
  Events
} from 'ionic-angular';

// Pages
// import { HomePage } from '../home/home';
import { SignUpConfirmPage } from '../sign-up-confirm/sign-up-confirm';
import { SignUpAfterFbPage } from '../sign-up-after-fb/sign-up-after-fb';
// import { NetworkContactListPage } from '../network-contact-list/network-contact-list';
// import { ProfileSettingPage } from '../profile-setting/profile-setting';
// import { NetworkFindPage } from '../network-find/network-find';

// Providers
import { Auth } from '../../providers/auth';
import { Tools } from '../../providers/tools';

// Animations
import {
  animSpeed,
  scaleMainBtn,
  toggleInputsFade
} from '../../includes/animations';

@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html',
  animations: [
    scaleMainBtn,
    toggleInputsFade
  ]
})

export class SignUpPage {
  @ViewChild('focusBirthday') birthdayInput;
  public passInput1:any = '';
  public passInput2:any = '';
  public account: any;

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

  mainBtn: any = {
    state: 'hidden'
  }

  public maxBirthday: string;

  private textStrings: any = {};

  public signUpForm: any;

  constructor(
    public navCtrl: NavController,
    public auth: Auth,
    public navParams: NavParams,
    public platform: Platform,
    public tools: Tools,
    public formBuilder: FormBuilder,
    public events: Events
  ) {
    this.maxBirthday = this.tools.getToday(13);

    this.textStrings.fb = 'Unable to SignUp with Facebook.';
    this.textStrings.login = 'Check it again my friend, something is off';
    this.textStrings.password = 'Hmmm, it looks like they don\'t match';
    this.textStrings.pass_length = 'We like your style, but for your own good, it needs to be longer';
    this.textStrings.require = 'Please fill all fields';
    this.textStrings.email = 'Email is not valid';
    this.textStrings.phone = 'Phone is not valid';
    this.textStrings.alreadyRegistered = 'You have already registered, please login with your login';

    this.signUpForm = formBuilder.group({
		  'login' : [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(50),
        ])
      ],
		  'password': [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(6),
        ])
      ],
      'confirm_password': [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(6),
        ])
      ],
		  'date_of_birthday' : [null, Validators.required]
		})
  }

  doSignUp(form: any) {
    let valid = this.formValidate(form);
    if (!valid) return;

    let signUpProcess = () => {
      if (this.activeStateId == 1) this.openDatePicker();

      this.activeStateId++;
      console.log('current state id:', this.activeStateId);
      this.mainBtn.state = 'hidden';

      this.updateActiveStates();

      this.account = {
        login: form.controls.login.value,
        password: form.controls.password.value,
        date_of_birthday: form.controls.date_of_birthday.value,
        type: ''
      }

      if (this.activeStateId == 3) {
        this.tools.showLoader();
        this.auth.saveRegisterData(this.account);
        this.auth.verification(this.account)
          .map(res => res.json())
          .subscribe(res => {
            console.log(res);
            this.tools.hideLoader();

            if (res.login_type == 'error') {
              this.activeStateId = 0;
              this.updateActiveStates();
            } else {
              this.account.type = res.login_type;
              this.tools.pushPage(SignUpConfirmPage);
            }

            this.tools.showToast(res.login_message);
        }, err => {
          this.tools.hideLoader();
          if (this.platform.is('cordova')) {
            this.tools.showToast(this.textStrings.login);
          } else {
            this.tools.pushPage(SignUpConfirmPage);
          }
        });
      }
    }

    if (this.activeStateId == 0) {
      let valid = this.validateLogin(form.controls.login.value);
      if (!valid.status) return;
      let data = {
        login: form.controls.login.value,
        type: valid.type
      }
      this.auth.checkLogin(data).subscribe(res => {
        console.log(res);
        signUpProcess();
      }, err => {
        if (err.status && err.status == 422) {
          this.tools.showToast(this.textStrings.alreadyRegistered);
        }
      });
    } else {
      signUpProcess();
    }
  }

  goBack() {
    if (this.activeStateId == 0) {
      this.tools.popPage();
    } else {
      this.activeStateId--;
      this.updateActiveStates();
    }
    setTimeout(() => {

    }, 100);
  }

  private updateStates(){
    for(let i in this.states){
      this.states[i].str = this.states[i].bool ? 'shown' : 'hidden';
    }
  }

  private formValidate(form: any): boolean {
    let status = true;
    if (this.activeStateId == 0) {
      if (!form.controls.login.valid) {
        this.tools.showToast(this.textStrings.login);
        status = false;
      }
    } else if (this.activeStateId == 1) {
      if (form.controls.password.valid && form.controls.confirm_password.valid) {
        if (form.controls.password.value != form.controls.confirm_password.value) {
          this.tools.showToast(this.textStrings.password);
          status = false;
        }
      } else {
        if (form.controls.password.value &&
            form.controls.confirm_password.value &&
            (form.controls.password.value.length < 6 &&
            form.controls.password.value.length > 0) &&
            (form.controls.confirm_password.value.length > 0 &&
            form.controls.confirm_password.value.length < 6)) {
          this.tools.showToast(this.textStrings.pass_length);
        }
        if (!form.controls.password.value ||
            !form.controls.confirm_password.value) {
          this.tools.showToast(this.textStrings.require);
        }

        status = false;
      }
    } else if (this.activeStateId == 2) {
      if (!form.controls.date_of_birthday.valid) {
        this.tools.showToast(this.textStrings.require);
        status = false;
      }
    }

    return status;
  }

  private updateActiveStates() {
    for (let i in this.states) {
      if (this.states[i].id == this.activeStateId) {
        let self = this;
        setTimeout(() => {
          self.states[i].str = 'shown';
          self.states[i].bool = true;
        }, animSpeed.fadeOut);
      } else {
        this.states[i].str = 'hidden';
        let self = this;
        setTimeout(() => {
          self.states[i].bool = false;
        }, animSpeed.fadeOut);
      }
    }
  }

  private openDatePicker() {
    setTimeout(() => {
      if (!this.birthdayInput._isOpen) this.birthdayInput.open();
    }, 1500);
  }

  private validateLogin(value: string): any {
    let valid = null;
    let type = null;
    if (value.indexOf('@') !== -1) {
      valid = this.tools.validateEmail(value);
      type = 'email';
      if (!valid) this.tools.showToast(this.textStrings.email);
    } else {
      valid = this.tools.validatePhone(value);
      type = 'phone';
      if (!valid) this.tools.showToast(this.textStrings.phone);
    }
    let result = {
      status: valid,
      type: type
    }
    return result;
  }

  private checkInputLength(inputValue:any):boolean {
    if (this.activeStateId == 1)
      return (this.passInput1.trim().length > 0 &&
          this.passInput2.trim().length > 0 &&
          (this.passInput1.trim().length ==
          this.passInput2.trim().length))
    else return inputValue.trim().length > 0;
  }

  private fieldChange(event:any) {
    if (this.checkInputLength(event.target.value))
      this.mainBtn.state = 'minimised';
    else
      this.mainBtn.state = 'hidden';
  }

  private inputOnBlur(event:any):void {
    if (this.checkInputLength(event.target.value))
      this.mainBtn.state = 'normal';
  }

  private inputOnFocus(event:any):void {
    if (this.checkInputLength(event.target.value))
      this.mainBtn.state = 'minimised';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad');
    this.activeStateId++;
    this.updateStates();
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter');
    if (this.activeStateId == 3) {
      this.openDatePicker();
      this.activeStateId--;
      this.updateActiveStates();
    }
    this.events.subscribe('signup:return', data => {
      if (data) this.mainBtn.state = 'normal';
    });
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave');
  }

  ionViewWillUnload() {
    console.log('ionViewWillUnload');
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave');
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter');
  }
}
