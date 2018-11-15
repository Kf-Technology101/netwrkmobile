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
    //
    //setTimeout(() => {
    //  if (!this.birthdayInput._isOpen) this.birthdayInput.open();
    //}, 1500);
  }

  doSignUp(form: any) {
    if (form.valid && this.passInput1==this.passInput2) {
      let updateObj = { user: { password: this.passInput1} };

      this.user.update(this.auth.getAuthData().id, updateObj, 'facebook')
        .map(res => res.json()).subscribe(res => {
          this.tools.pushPage(
            this.undercoverPrvd.getCharacterPerson(HoldScreenPage, ChatPage)
          );
        }, err => {
          this.tools.showToast(JSON.stringify(err));
        });
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
