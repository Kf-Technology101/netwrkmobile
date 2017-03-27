import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import {
  Events,
  ToastController,
  LoadingController
} from 'ionic-angular';

import { ContactsProvider } from './contacts';
import { User } from './user';

@Injectable()
export class Tools {
  private toast: any;
  private loader: any;

  constructor(
    public http: Http,
    public events: Events,
    public contactsPrvd: ContactsProvider,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public user: User
  ) {}

  doBackButton(page: string, callback: any) {
    this.events.unsubscribe('backButton:clicked');
    this.events.subscribe('backButton:clicked', () => {
      callback(page);
    });
  }

  getLoginPage(HomePage, SignUpContactListPage) {
    return new Promise((resolve, reject) => {
      let userData = this.user.getAuthData();
      userData.invitation_sent ? resolve(HomePage) : resolve(SignUpContactListPage);
    });
  }

  showToast(message: string, duration?: number, position?: string) {
    this.toast = this.toastCtrl.create({
      message: message,
      duration: duration ? duration : 3000,
      position: position ? position : 'top',
    });
    this.toast.present();
  }

  showLoader() {
    this.loader = this.loadingCtrl.create({
      content: "Please wait..."
    });

    this.loader.present();
  }

  hideLoader() {
    this.loader.dismiss();
  }

}
