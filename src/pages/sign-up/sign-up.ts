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

// Native
import { Keyboard } from '@ionic-native/keyboard';

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
  @ViewChild('birthdayIn') birthdayInput;
  public passInput1:any = '';
  public passInput2:any = '';
  public account: any;

  // object for toggling input elements relative to registration steps
  public states: any = {
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
    }
  };

  // id of the active state (this.states[n].id). Default: -1
  activeStateId: number = -1;

  public mainBtn: any = {
    state: 'hidden',
    disabled: false
  }
  public maxBirthday: string;
  public minBirthday: string = '1900';

  private textStrings: any = {};

  public signUpForm: any;

  constructor(
    public navCtrl: NavController,
    public auth: Auth,
    public navParams: NavParams,
    public platform: Platform,
    public tools: Tools,
    public formBuilder: FormBuilder,
    public events: Events,
    public keyboard: Keyboard
  ) {
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

  public doSignUp(form: any) {
    this.setMainBtnState({disabled: true, forced: true});
    let valid = this.formValidate(form);
    if (!valid) { this.setMainBtnState({disabled: false}); return; }
    let signUpProcess = () => {
      console.log('current state id:', this.activeStateId);
      this.activeStateId++;
      this.setMainBtnState({state: 'hidden', disabled: true});
      this.updateActiveStates();

      this.account = {
        login: form.controls.login.value,
        password: form.controls.password.value,
        date_of_birthday: form.controls.date_of_birthday.value,
        type: ''
      }
	  if(this.activeStateId == 1){
		if(this.signUpForm.controls['password'].valid && this.signUpForm.controls['confirm_password'].valid){
			this.setMainBtnState({state: 'minimised', disabled: false});
		}else{
			this.setMainBtnState({state: 'hidden', disabled: true});
		}  
	  }	  
      if (this.activeStateId == 2) {
        this.setMainBtnState({state: 'normal', disabled: false});
        this.openDatePicker();
      }
      if (this.activeStateId == 3) {
        this.tools.showLoader();
        this.auth.saveRegisterData(this.account);
        this.auth.verification(this.account)
          .map(res => res.json())
          .subscribe(res => {
            console.log('verification res:', res);
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
        console.log('check login res:', res);
        if (res.message == 'ok') signUpProcess();
      }, err => {
        if (err.status && err.status == 422) {
          this.tools.showToast(this.textStrings.alreadyRegistered);
        }
      });
    } else {
      signUpProcess();
    }
  }

  private setMainBtnState(options:any):void {
    console.log('options:', options);
    for (let key in options) {
      if (key != 'forced') {
        setTimeout(() => {
          this.mainBtn[key] = options[key];
        }, 10);
      } else this.mainBtn[key] = options[key];
    }
  }

  goBack() {
    if (this.activeStateId == 0) {
      this.tools.popPage();
    } else {
      this.activeStateId--;
      this.updateActiveStates();
      setTimeout(() => {
        this.setMainBtnState({
          state: 'normal',
          disabled: false
        });
      }, animSpeed.fadeOut);
    }
  }

  private updateStates() {
    for(let i in this.states) {
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

  private updateActiveStates():void {
    for (let i in this.states) {
      if (this.states[i].id == this.activeStateId) {
        setTimeout(() => {
          this.states[i].str = 'shown';
          this.states[i].bool = true;
        }, animSpeed.fadeOut);
      } else {
        this.states[i].str = 'hidden';
        setTimeout(() => {
          this.states[i].bool = false;
        }, animSpeed.fadeOut);
      }
    }
  }

  private showDatePicker():void {
    if (!this.birthdayInput['_isOpen']) this.birthdayInput.open();
  }

  public openDatePicker(options?:any):void {
    if (options && !options.delay) {
      this.showDatePicker();
    } else {
      setTimeout(() => {
        this.showDatePicker();
      }, animSpeed.fadeOut*2);
    }
  }

  private validateLogin(value: string): any {
    let valid = null;
    let type = null;
	
    /* if (value.indexOf('@') !== -1) {
      valid = this.tools.validateEmail(value);
      type = 'email';
      if (!valid) this.tools.showToast(this.textStrings.email);
    } else {
      valid = this.tools.validatePhone(value);
      type = 'phone';
      if (!valid) this.tools.showToast(this.textStrings.phone);
    } */ 
	
	valid = this.tools.validateEmail(value);
	type = 'email';
	if (!valid) this.tools.showToast(this.textStrings.email);
	
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

  public fieldChange(event:any):void {
    if (this.checkInputLength(event.target.value)) {
      this.setMainBtnState({state: 'minimised', disabled: false});
    } else {
      this.setMainBtnState({state: 'hidden', disabled: true});
    }
  }

  public inputOn(event:any, state:string):void {
    if (this.checkInputLength(event.value)) {
      this.setMainBtnState({
        state: state == 'blur' ? 'normal' : 'minimised',
        disabled: false
      });
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad');
    this.activeStateId++;
    this.updateStates();
  }

  ionViewWillEnter() {
    this.maxBirthday = this.tools.getToday(17);
    console.log('ionViewWillEnter');
    if (this.activeStateId == 3) {
      this.setMainBtnState({disabled: false});
      this.openDatePicker();
      this.activeStateId--;
      this.updateActiveStates();
    }
    this.events.subscribe('signup:return', data => {
      if (data) this.setMainBtnState({state: 'normal', disabled: false});
    });
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter');
    if (this.platform.is('ios')) {
      this.keyboard.onKeyboardShow().subscribe(res => {
        try {
          let footerEl = <HTMLElement>document.querySelector('.signUpFooter');
          let scrollEl = <HTMLElement>document.querySelector('.scroll-content');
          scrollEl.style.bottom = res.keyboardHeight + 'px';
          footerEl.style.bottom = res.keyboardHeight + 'px';
        } catch (e) {
          console.error('on-keyboard-show error:', e);
        }

      }, err => console.error(err));

      this.keyboard.onKeyboardHide().subscribe(res => {
        try {
          let footerEl = <HTMLElement>document.querySelector('.signUpFooter');
          let scrollEl = <HTMLElement>document.querySelector('.scroll-content');
          footerEl.style.bottom = '0';
          scrollEl.style.bottom = '0';
        } catch (e) {
          console.error('on-keyboard-hide error:', e);
        }
      }, err => console.error(err));
    }
  }
}
