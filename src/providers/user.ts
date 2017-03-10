import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Api } from './api';
import { LocalStorage } from './local-storage';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { Facebook } from 'ionic-native';

@Injectable()
export class User {
  confirmCode: any;
  registerData: any;

  constructor(
    public http: Http,
    public api: Api,
    public storage: LocalStorage
  ) {
    console.log('Hello User Provider');
  }

  verification(accountInfo: any) {
    let data = {
      country_code: this.storage.get('country_code'),
      login: accountInfo.login,
    }

    let seq = this.api.post('sessions/verification', data).share();
    seq.map(res => res.json()).subscribe(res => {
      console.log(res);
      this.confirmCode = res.login_code;
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }

  login(accountInfo: any) {
    let user = {
      'user': accountInfo
    }

    let seq = this.api.post('sessions', user).share();
    seq.map(res => res.json()).subscribe(res => {
      this.saveAuthData(res, 'email');
    }, err => {
      console.error('ERROR', err);
    });

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
      case 'email':
        info.user['phone'] = time;
      break;
      case 'phone':
        info.user['email'] = time + '@mail.com';
      break;
    }
    // console.log(info);

    let seq = this.api.post('registrations', info).share();
    seq.map(res => res.json()).subscribe(res => {
      this.saveAuthData(res, 'email');
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }

  signUpFacebook() {

    return new Promise((resolve, reject) => {
      Facebook.getLoginStatus().then((data: any) => {
        console.log(data);

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

  getFbLoginStatus() {
    return Facebook.getLoginStatus();
  }

  private loginWithFacebook(data: any, resolve, reject) {
    let time = new Date().getTime();
    let authData = {
      user: {
        provider_name: 'fb',
        provider_id: data.authResponse.userID,
        phone: time,
        email: time + '@mail.com',
      }
    }

    let seq = this.api.post('sessions/oauth_login', authData).share();
    seq.map(res => res.json()).subscribe(res => {
      console.log(res);
      resolve(res);
      if (data.date_of_birthday) {
        let date = new Date(data.date_of_birthday);
        if (typeof date == 'object') {
          this.saveAuthData(res, 'facebook');
        }
      }
    }, err => {
      reject(err);
    });
  }

  /**
   * Log the user out, which forgets the session
   */
  logout() {
    this.storage.rm('auth_type');
    this.storage.rm('auth_data');
  }

  private saveAuthData(authData: any, type: string) {
    this.storage.set('auth_type', type);
    this.storage.set('auth_data', authData);
  }

  getAuthType():any {
    return this.storage.get('auth_type');
  }

  getAuthData():any {
    return this.storage.get('auth_data');
  }

  saveRegisterData(data: any) {
    this.registerData = data;
  }

}
