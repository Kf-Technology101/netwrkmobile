import { Component, ViewChild } from '@angular/core';
import {
  NavController,
  NavParams
} from 'ionic-angular';

// Pages
import { UndercoverCharacterPage } from '../undercover-character/undercover-character';
import { NetworkFindPage } from '../network-find/network-find';

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

  private validBirthdayErrorString: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public auth: Auth,
    public user: User,
    public tools: Tools,
    public undercoverPrvd: UndercoverProvider
  ) {
    this.maxBirthday = this.tools.getToday();
    this.validBirthdayErrorString = 'Please fill all fields';

    setTimeout(() => {
      if (!this.birthdayInput._isOpen) this.birthdayInput.open();
    }, 1500);
  }

  doSignUp(form: any) {
    console.log(form);
    if (form.valid) {
      // this.tools.showLoader();
      let updateObj = { user: { date_of_birthday: this.date_of_birthday } };

      this.user.update(this.auth.getAuthData().id, updateObj, 'facebook')
        .map(res => res.json()).subscribe(res => {
          // this.tools.hideLoader();
          this.tools.pushPage(
            this.undercoverPrvd.getCharacterPerson(UndercoverCharacterPage, NetworkFindPage)
          );
        }, err => {
          // this.tools.hideLoader();
          this.tools.showToast(JSON.stringify(err));
        });
    } else {
      this.tools.showToast(this.validBirthdayErrorString);
    }
  }

  goBack() { this.tools.popPage(); }

}
