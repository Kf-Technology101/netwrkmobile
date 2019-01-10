import { Component, ViewChild } from '@angular/core';
import {
  NavController,
  NavParams
} from 'ionic-angular';

// Pages

import { ChatPage } from '../chat/chat';
import { HoldScreenPage } from '../hold-screen/hold-screen';

// Providers
import { Auth } from '../../providers/auth';
import { User } from '../../providers/user';
import { Tools } from '../../providers/tools';
import { UndercoverProvider } from '../../providers/undercover';

@Component({
  selector: 'page-sign-up-after-fb',
  templateUrl: 'sign-up-after-fb.html'
})
export class SignUpAfterFbPage {
  @ViewChild('focusBirthday') birthdayInput;

  date_of_birthday: string;
  public maxBirthday: string;
  public passInput1:any = '';
  public passInput2:any = '';

  private validBirthdayErrorString: string;
  private validPasswordErrorString: string;
  private pass_length: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public auth: Auth,
    public user: User,
    public tools: Tools,
    public undercoverPrvd: UndercoverProvider
  ) {
    this.maxBirthday = this.tools.getToday(13);
    this.validBirthdayErrorString = 'Please fill all fields';
    this.validPasswordErrorString = 'Hmmm, it looks like they don\'t match';
    this.pass_length = 'We like your style, but for your own good, it needs to be longer';
  }

  doSignUp(form: any) {
    if (form.valid && this.passInput1==this.passInput2) {
        if (this.passInput1 && this.passInput2 && (this.passInput1 < 6 && this.passInput1 > 0) && (this.passInput2 > 0 && this.passInput2 < 6)) {
            this.tools.showToast(this.pass_length);
        }else{
            let updateObj = { user: { password: this.passInput1} };

            this.user.update(this.auth.getAuthData().id, updateObj, 'facebook')
                .map(res => res.json()).subscribe(res => {
                    this.tools.pushPage(HoldScreenPage)
                }, err => {
                    this.tools.showToast(JSON.stringify(err));
                });
        }
    } else {
        if (this.passInput1!=this.passInput2) {
            this.tools.showToast(this.validPasswordErrorString);
        }else{
            this.tools.showToast(this.validBirthdayErrorString);
        }
    }
  }

  goBack() { this.tools.popPage(); }
}
