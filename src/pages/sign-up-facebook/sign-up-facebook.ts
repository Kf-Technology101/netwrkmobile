import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// Pages
import { UndercoverCharacterPage } from '../undercover-character/undercover-character';

// Providers
import { Social } from '../../providers/social';
import { Tools } from '../../providers/tools';
import { Auth } from '../../providers/auth';
import { User } from '../../providers/user';

// Interfaces
// import { User } from '../../interfaces/user';

@Component({
  selector: 'page-sign-up-facebook',
  templateUrl: 'sign-up-facebook.html'
})
export class SignUpFacebookPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public socialPrvd: Social,
    public toolsPrvd: Tools,
    public authPrvd: Auth,
    public userPrvd: User
  ) {}

  public connectToFacebook() {
    this.socialPrvd.connectToFacebook().then(fbRes => {
      let data: any = {
        provider: {
          name: 'fb',
          token: fbRes.authResponse.accessToken
        }
      };

      let authData = this.authPrvd.getAuthData();

      this.authPrvd.connectAccountToFb(data, fbRes).then(connectRes => {
        this.userPrvd.update(authData.id, connectRes.update)
        .map(connectRes => connectRes.json()).subscribe(updateRes => {
          console.log(updateRes);
          this.toolsPrvd.showToast('Facebook already connected');
          this.toolsPrvd.pushPage(UndercoverCharacterPage);
        }, err => {
          console.log(err);
          // this.toolsPrvd.showToast(JSON.stringify(err));
        });
      }).catch(err => console.error('ERROR', err));
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignUpFacebookPage');
  }

}
