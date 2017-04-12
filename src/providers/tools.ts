import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import {
  Events,
  ToastController,
  LoadingController,
  App
} from 'ionic-angular';

import { User } from './user';

@Injectable()
export class Tools {
  private toast: any;
  private loader: any;

  constructor(
    public http: Http,
    public events: Events,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public user: User,
    public app: App
  ) {}

  public doBackButton() {
    console.log(this.app.getActiveNav());
  }

  getLoginPage(DefaultPage: any, InvitationPage: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let userData = this.user.getAuthData();
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
    this.loader.dismiss();
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

  public getToday(): string {
    let myDate = new Date();
    let year = myDate.getFullYear();
    let month = myDate.getMonth() < 10 ? '0' + (myDate.getMonth() + 1) : myDate.getMonth() + 1;
    let day = myDate.getDate() < 10 ? '0' + myDate.getDate() : myDate.getDate();
    return `${year}-${month}-${day}`;
  }

  public subscribeViewDidEnter(view: any) {
    let transparentPages: Array<string> = [
      'ChatPage',
      'CameraPage',
    ];
    let name: string = view.instance.constructor.name;
    let action: boolean = transparentPages.indexOf(name) !== -1;
    this.changeBodyClass(action);
  }

  private changeBodyClass(add?: boolean) {
    let body = document.getElementsByTagName('html')[0];
    let className = 'transparent-background';
    add ? body.classList.add(className) : body.classList.remove(className);
  }

}
