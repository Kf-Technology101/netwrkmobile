import { Injectable } from '@angular/core';

import { LogInPage } from '../pages/log-in/log-in';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { BackgroundMode } from '@ionic-native/background-mode';
import * as moment from 'moment';

import {
  Events,
  ToastController,
  LoadingController,
  App
} from 'ionic-angular';

import { Auth } from './auth';

@Injectable()
export class Tools {
  public defaultAvatar: string = 'assets/images/incognito.png';
  private toast: any;
  private loader: any;

  constructor(
    public events: Events,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public auth: Auth,
    public app: App,
    private iab: InAppBrowser,
    private backgroundMode: BackgroundMode
  ) {}

  public doBackButton() {
    console.log(this.app.getActiveNav());
  }

  public handleLinkClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.target.tagName == 'A') {
      this.backgroundMode.disable();
      let browser = this.iab.create(event.target.href, '_blank');
    }
  }

  getLoginPage(DefaultPage: any, InvitationPage: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let userData = this.auth.getAuthData();
      userData.invitation_sent ? resolve(DefaultPage) : resolve(InvitationPage);
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
    setTimeout(() => {
      this.loader.dismiss().catch( err => {
        console.log('[loader close] Error:', err);
      });
    }, 1);
  }

  public pushPage(page: any, params?: any, animate?: boolean) {
    this.app.getActiveNav().push(page, params, { animate: animate ? animate : false });
  }

  public popPage(animate?: boolean) {
    this.app.getActiveNav().pop({ animate: animate ? animate : false });
  }

  public validateEmail(phone: string): any {
    let regexEmail = /^[A-Za-z0-9](\.?[A-Za-z0-9_-]){0,}@[a-z0-9-]+\.([a-z]{1,6}\.)?[a-z]{2,6}$/g;
    let result = phone.match(regexEmail);
    return result;
  }

  public validatePhone(phone: string): any {
    let regexPhone = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/;
    let result = phone.match(regexPhone);
    return result;
  }

  public getToday(age?: number): string {
    let myDate = new Date();
    let year = myDate.getFullYear();
    if (age) year = year - age;
    let month = myDate.getMonth() < 10 ? '0' + (myDate.getMonth() + 1) : myDate.getMonth() + 1;
    let day = myDate.getDate() < 10 ? '0' + myDate.getDate() : myDate.getDate();
    return `${year}-${month}-${day}`;
  }

  public getTime(date?: string): string {
    try {
      return moment(date).fromNow();
    } catch (e) {
      return null;
    }
  }

  public errorHandler(error) {
    console.log(error);
    this.app.getActiveNav().setRoot(LogInPage);
  }

}
