import { Injectable } from '@angular/core';

import { LogInPage } from '../pages/log-in/log-in';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { BackgroundMode } from '@ionic-native/background-mode';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AlertController } from 'ionic-angular';
import { Api } from './api';
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
  private loader: any = null;
  public isCameraReady: boolean = false;
  public hideSplash: boolean = false;

  constructor(
    public events: Events,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public auth: Auth,
    public app: App,
    private iab: InAppBrowser,
    private backgroundMode: BackgroundMode,
    public alertCtrl: AlertController,
    public splash: SplashScreen,
    public api: Api
  ) {}

  public sendPointData(pointData):any {
    let seq = this.api.post('profiles/change_points_count', pointData).share();
    let messMap = seq.map(res => res.json());
    return messMap;
  }

  public isLegendaryAvailable():any {
    let seq = this.api.get('legendary_likes').share();
    let messMap = seq.map(res => res.json());
    return messMap;
  }

  public checkIfHeroAvalable():any {
    let seq = this.api.get('profiles/disabled_hero').share();
    let messMap = seq.map(res => res.json());
    return messMap;
  }

  /**
  *  Send user id to toggle terms of use acceptance status on the DB
    Observable positive result is .message == 'ok'
  */
  public toggleUsersTermsStatus(userId:number):any {
    let seq = this.api.patch('profiles/accept_terms_of_use', {
      id: userId
    }).share();
    let messMap = seq.map(res => res.json());
    return messMap;
  }

  public hideSplashScreen():void {
    this.splash.hide();
  }
  // // public showSplashScreen():void {
  // //   this.splash.show();
  // // }

  public doBackButton() {
    console.log(this.app.getActiveNav());
  }

  public notAvailableAlert() {
    let alert = this.alertCtrl.create({
      title: '',
      subTitle: 'This feature is not available at the moment',
      buttons: ['Ok']
    });
    alert.present();
  }

  public handleLinkClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.target.tagName == 'A') {
      this.backgroundMode.disable();
      this.iab.create(event.target.href, '_blank');
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

  showLoader(message?:string) {
    let loaderMessage:any = message ?  message : 'Please wait...';
    let loaderContent:any = '<div class="glowing-icon"></div><span class="loading-text">' + loaderMessage + '</span>';
    try {
      if (!this.loader && this.loader == null) {
        this.loader = this.loadingCtrl.create({
          spinner: 'hide',
          content: loaderContent
        });
        this.loader.present();
      }
    } catch (err) {
      console.warn('[loader open] Error:', err);
      this.showLoader();
    };
  }

  hideLoader() {
    try {
      if (this.loader !== null)
        this.loader.dismiss();
    } catch (err) {
      console.warn('[loader close] Error:', err);
    }
    this.loader = null;
  }

  public pushPage(page: any, params?: any, animate?: boolean) {
    this.app.getActiveNav().push(page, params, { animate: animate ? animate : false });
  }

  public popPage(animate?: boolean, params?: any) {
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

  public getToday(age?: number):string {
    let date = moment().subtract(age, 'years').toISOString();
    console.log('date:', date);
    return date;
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
    this.app.getActiveNav().setRoot(LogInPage, {}, {
      animate: true,
      direction: 'up',
      duration: 3500
    });
  }

}
