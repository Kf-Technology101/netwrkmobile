import { Injectable } from '@angular/core';

import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { Api } from './api';
import { LocalStorage } from './local-storage';
import { Network } from './network';
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
    public network: Network,
    public social: Social,
    private facebook: Facebook
  ) {
    this.hostUrl = this.api.hostUrl;
  }

  public checkLogin(params: any) {

    let seq = this.api.get('registrations/check_login', params).share();
    let seqMap = seq.map(res => res.json());

    return seqMap;
  }

  public verification(accountInfo: any) {
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

  public login(accountInfo: any) {
    let user = { user: accountInfo };

    let seq = this.api.post('sessions', user).share();
    seq.map(res => res.json()).subscribe(
      res => this.saveAuthData(res, 'email'),
      err => console.error('ERROR', err)
    );

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
      err => console.error('ERROR', err)
    );

    return seq;
  }

  public signUpFacebook(): Promise<any> {

    return new Promise((resolve, reject) => {
      this.facebook.getLoginStatus().then((data: FacebookLoginResponse) => {

        if (data.status && data.status == 'connected') {
          this.loginWithFacebook(data, resolve, reject);
        } else {
          this.facebook.login(this.social.fbPermissions)
            .then((data: FacebookLoginResponse) => {
            this.loginWithFacebook(data, resolve, reject);
          }, err => {
            reject(err);
          });
        }
      }, err => {
        reject(err);
      });
    });
  }

  public logout() {
    this.storage.rm('auth_type');
    this.storage.rm('auth_data');
  }

  public getAuthType():any { return this.storage.get('auth_type'); }

  public getAuthData():any { return this.storage.get('auth_data'); }

  public saveRegisterData(data: any) { this.registerData = data; }

  public saveAuthData(authData: any, type: string) {
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

    this.network.saveInviteAccess(authData.invitation_sent);
  }

  public getFbLoginStatus() { return this.facebook.getLoginStatus(); }

  public setFbConnected() {
    this.storage.set('facebook_connected', true);
  }

  public getFbConnected() {
    let authData = this.storage.get('facebook_connected');;
    let result = authData ? this.facebook.getLoginStatus() : null;
    return result;
  }

  public connectAccountToFb(accountInfo: any, fbData: FacebookLoginResponse) {
    return new Promise((resolve, reject) => {
      let seq = this.api.post('providers', accountInfo).share();
      let seqMap = seq.map(res => res.json()).subscribe(res => {
        this.loginWithFacebook(fbData, resolve, reject, false);
      }, err => reject(err));
    });
  }

  private loginWithFacebook(data: FacebookLoginResponse, resolve, reject, oAuth: boolean = true) {
    this.social.setSocialAuth(data.authResponse, Social.FACEBOOK);

    let fields: Array<string> = [
      'birthday',
      'email',
      'first_name',
      'last_name',
      'name'
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
          first_name: res.first_name || null,
          last_name: res.last_name || null,
          name: res.name || null
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
