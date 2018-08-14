import { Injectable } from '@angular/core';

import { Http, Headers, RequestOptions } from '@angular/http';

import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { Api } from './api';
import { LocalStorage } from './local-storage';
import { NetworkProvider } from './networkservice';
import { Social } from './social';

import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

import * as moment from 'moment';

@Injectable()
export class Auth {
  public confirmCode: any;
  public registerData: any;
  public hostUrl: string;

  constructor(
    public api: Api,
    public storage: LocalStorage,
    public network: NetworkProvider,
    public social: Social,
    public facebook: Facebook
  ) {
    this.hostUrl = this.api.hostUrl;
  }

  public checkLogin(params: any) {
    let seq = this.api.get('registrations/check_login', params).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  public getSocialStatus():any {
    let seq = this.api.get('profiles/social_net_status').share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  public verification(accountInfo: any) {
    let data = {
      country_code: this.storage.get('country_code'),
      login: accountInfo.login
    }

    let seq = this.api.post('sessions/verification', data).share();
    seq.map(res => res.json()).subscribe(
      res => {
        this.confirmCode = res.login_code;
      }, err => console.error('verification ERROR', err));

    return seq;
  }

  public login(accountInfo: any) {
    let user = { user: accountInfo };

    let seq = this.api.post('sessions', user).share();
    console.log('[login] user:', user);
    seq.map(res => res.json()).subscribe(
      res => this.saveAuthData(res, 'email'),
      err => console.error('login ERROR', err));

    return seq;
  }


  public signup(accountInfo: any) {
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
      err => console.error('signup ERROR', err));

    return seq;
  }

  public signUpFacebook(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.facebook.getLoginStatus().then((data: FacebookLoginResponse) => {

        if (data.status && data.status == 'connected') {
          this.loginWithFacebook(data, resolve, reject, true);
        } else {
          this.facebook.login(this.social.fbPermissions)
            .then((data: FacebookLoginResponse) => {
            this.loginWithFacebook(data, resolve, reject, true);
          }, err => reject(err));
        }
      }, err => reject(err));
    });
  }

  public logout(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let authType:any = this.getAuthType();
      console.log('[logout] authType:', authType);
      if (authType == 'facebook') {
        this.facebook.logout().then(() => {
          console.log('facebook logout OK');
          resolve();
        }).catch(() => {
          console.warn('facebook logout rejected');
          reject(false);
        });
      } else {
        resolve();
      }
    });
  }

  public getAuthType():any { return this.storage.get('auth_type'); }

  public getAuthData():any { return this.storage.get('auth_data'); }

  public saveRegisterData(data: any) { this.registerData = data; }

  public saveAuthData(authData: any, type?: string) {
    if (type) this.storage.set('auth_type', type);
    this.storage.set('auth_data', authData);
    this.network.saveInviteAccess(authData.invitation_sent);
  }

  public getFbLoginStatus() { return this.facebook.getLoginStatus(); }

  public setFbConnected() {
    this.storage.set('facebook_connected', true);
  }

  public getFbConnected() {
    let authData = this.storage.get('facebook_connected');
    let result = authData ? this.facebook.getLoginStatus() : null;
    return result;
  }

  public connectAccountToFb(accountInfo: any, fbData: FacebookLoginResponse): Promise<any> {
    return new Promise((resolve, reject) => {
      let seq = this.api.post('providers', accountInfo).share();
      let seqMap = seq.map(res => res.json()).subscribe(res => {
        this.loginWithFacebook(fbData, resolve, reject, false);
      }, err => reject(err));
    });
  }

  private loginWithFacebook(data: FacebookLoginResponse, resolve, reject, oAuth: boolean) {
    this.social.setSocialAuth(data.authResponse, Social.FACEBOOK);

    let fields: Array<string> = [
      'birthday',
      'email',
      'first_name',
      'last_name',
      'name',
      'gender',
    ];
    this.facebook.api(
      '/me?fields=' + fields.join(','),
      this.social.fbPermissions
    ).then(res => {
      console.log('facebook', res);
      let birthday = res.birthday ? new Date(res.birthday).toISOString() : null;
      let updateObj = {
        user: {
          date_of_birthday: birthday ? this.formateDate(birthday) : null,
          name: res.name || null,
          gender: res.gender || 'male'
        }
      }

      let time = new Date().getTime();
      let authData = {
        user: {
          provider_name: 'fb',
          provider_id: data.authResponse.userID,
          phone: time,
          email: res.email || time + '@mail.com',
          token: data.authResponse.accessToken,
          image_url: null
        }
      }

      this.facebook.api(
        'me/picture?width=320&height=320&redirect=false',
        this.social.fbPermissions
      ).then(pic => {
        console.log(pic);
        authData.user.image_url = pic ? pic.data.url : null;

        let resolveObj = {
          update: updateObj,
          auth: authData,
          result: this.getAuthData()
        }

        if (oAuth) {
          let seq = this.api.post('sessions/oauth_login', authData).share();
          seq.map(res => res.json()).subscribe(
            res => {
              resolveObj.result = res;
              this.saveAuthData(res, 'facebook');
              resolve(resolveObj);
            }, err => reject(err)
          );
        } else {
          this.setFbConnected();
          resolve(resolveObj);
        }

      }).catch(err => reject(err))
    }).catch(err => reject(err))
  }

  private formateDate(date?: string) {
    return moment(date).format('YYYY-MM-DD');
  }

}
