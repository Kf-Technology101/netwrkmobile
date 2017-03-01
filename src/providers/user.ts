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
  _user: any;
  _smsCode: any;
  _registerData: any;

  constructor(
    public http: Http,
    public api: Api,
    public storage: LocalStorage
  ) {
    console.log('Hello User Provider');
  }

  login(accountInfo: any) {
    let user = {
      'user': accountInfo,
    }

    let seq = this.api.post('sessions', user).share();
    seq.map(res => res.json()).subscribe(res => {
      this.saveAuthData(res, 'email');
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }

  /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  signup(accountInfo: any) {
    let user = {
      user: accountInfo,
    }

    let seq = this.api.post('registrations', user).share();
    seq.map(res => res.json()).subscribe(res => {
      this.saveAuthData(res, 'email');
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }

  signUpFacebook() {
    return new Promise((resolve, reject) => {
      Facebook.getLoginStatus().then((data) => {
        console.log(data);

        if (data.status && data.status == 'connected') {
          this.loginWithFacebook(data, resolve, reject);
        } else {
          Facebook.login(['public_profile']).then((data) => {
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

  private loginWithFacebook(data, resolve, reject) {
    let authData = {
      user: {
        provider_name: 'fb',
        provider_id: data.authResponse.userID,
      }
    }

    let seq = this.api.post('sessions/oauth_login', authData).share();
    seq.map(res => res.json()).subscribe(res => {
      resolve(res);
      this.saveAuthData(res, 'facebook');
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

  /**
   * Process a login/signup response to store user data
   */
  _loggedIn(resp) {
    this._user = resp.user;
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
    this._registerData = data;
  }

  getSMSCode() {
    this._smsCode = this.geterateCode();
    console.log(this._smsCode);
  }

  private geterateCode(): number {
    return Math.floor((Math.random() * 8999) + 1000);
  }

}
