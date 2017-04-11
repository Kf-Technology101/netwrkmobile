import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { Api } from './api';
import { LocalStorage } from './local-storage';
import { Social } from './social';
// import { UndercoverProvider } from './undercover';

import { Facebook } from 'ionic-native';

@Injectable()
export class User {
  confirmCode: any;
  registerData: any;
  fbResponseData: any;

  constructor(
    public http: Http,
    public api: Api,
    public storage: LocalStorage,
    public social: Social,
    // public undercover: UndercoverProvider
  ) {}

  verification(accountInfo: any) {
    let data = {
      country_code: this.storage.get('country_code'),
      login: accountInfo.login,
    }

    let seq = this.api.post('sessions/verification', data).share();
    seq.map(res => res.json()).subscribe(
      res => {
        this.confirmCode = res.login_code;
      }, err => console.error('ERROR', err)
    );

    return seq;
  }

  login(accountInfo: any) {
    let user = { user: accountInfo };

    let seq = this.api.post('sessions', user).share();
    seq.map(res => res.json()).subscribe(
      res => this.saveAuthData(res, 'email'),
      err => console.error('ERROR', err)
    );

    return seq;
  }

  signup(accountInfo: any) {
    let info = {
      user: {
        date_of_birthday: accountInfo.date_of_birthday,
        password: accountInfo.password
      }
    }

    info.user[accountInfo.type] = accountInfo.login;

    let time = new Date().getTime();
    switch (accountInfo.type) {
      case 'email': info.user['phone'] = time; break;
      case 'phone': info.user['email'] = time + '@mail.com'; break;
    }

    let seq = this.api.post('registrations', info).share();
    seq.map(res => res.json()).subscribe(
      res => this.saveAuthData(res, 'email'),
      err => console.error('ERROR', err)
    );

    return seq;
  }

  update(id: number, accountInfo: any, type?: string) {
    let seq = this.api.patch('registrations/' + id, accountInfo).share();
    seq.map(res => res.json()).subscribe(
      res => {
        console.log(res);
        if (type === 'fb') {
          this.fbResponseData = null;
          this.saveAuthData(res, 'facebook');
        }
      }, err => console.error('ERROR', err)
    );

    return seq;
  }

  signUpFacebook(): Promise<any> {

    return new Promise((resolve, reject) => {
      Facebook.getLoginStatus().then((data: any) => {

        if (data.status && data.status == 'connected') {
          this.loginWithFacebook(data, resolve, reject);
        } else {
          Facebook.login(['public_profile']).then((data: any) => {
            this.loginWithFacebook(data, resolve, reject);
          }, (err) => {
            reject(err);
          });
        }
      }, (err) => {
        reject(err);
      });
    });
  }

  logout() {
    this.storage.rm('auth_type');
    this.storage.rm('auth_data');
  }

  getFbLoginStatus() { return Facebook.getLoginStatus(); }

  getAuthType():any { return this.storage.get('auth_type'); }

  getAuthData():any { return this.storage.get('auth_data'); }

  saveRegisterData(data: any) { this.registerData = data; }

  private loginWithFacebook(data: any, resolve, reject) {
    this.social.setSocialAuth(data.authResponse, Social.FACEBOOK);

    let time = new Date().getTime();
    let authData = {
      user: {
        provider_name: 'fb',
        provider_id: data.authResponse.userID,
        phone: time,
        email: time + '@mail.com',
        token: data.authResponse.accessToken,
      }
    }

    let seq = this.api.post('sessions/oauth_login', authData).share();
    seq.map(res => res.json()).subscribe(
      res => {
        if (res.date_of_birthday) {
          let date = new Date(res.date_of_birthday);
          if (typeof date == 'object') this.saveAuthData(res, 'facebook');
        } else this.fbResponseData = res;
        resolve(res);
      }, err => reject(err)
    );
  }

  private saveAuthData(authData: any, type: string) {
    this.storage.set('auth_type', type);
    this.storage.set('auth_data', authData);

    let undercover = {
      name: authData.role_name,
      description: authData.role_description,
      imageUrl: authData.role_image_url,
      active: false
    };

    if (undercover.name && undercover.description && undercover.imageUrl) {
      this.storage.set('undercover_person', undercover);
    }
  }
}
