import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { LocalStorage } from './local-storage';
import { Api } from './api';

import { TwitterConnect, InAppBrowser } from 'ionic-native';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

@Injectable()
export class Social {
  public static FACEBOOK: string = 'facebook';
  public static TWITTER: string = 'twitter';
  public static INSTAGRAM: string = 'instagram';
  public fbPermissions: Array<string> = [
    'public_profile',
    'user_friends',
    'email'
  ];

  constructor(
    public http: Http,
    public storage: LocalStorage,
    public api: Api,
    private facebook: Facebook
  ) {}

  public connectToFacebook(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.facebook.getLoginStatus().then((data: any) => {
        if (data.status && data.status == 'connected') {
          this.setSocialAuth(data.authResponse, Social.FACEBOOK);
          resolve(data);
        } else {
          this.facebook.login(['public_profile']).then((data: any) => {
            this.setSocialAuth(data.authResponse, Social.FACEBOOK);
            resolve(data);
          }, err => {
            console.log(err);
            reject(err);
          });
        }
      }, err => {
        console.log(err);
        reject(err);
      });
    })
  }

  connectToTwitter() {
    let connect = TwitterConnect.login().then(res => {
      this.setSocialAuth(res, Social.TWITTER);
    });
    return connect;
  }

  connectToInstagram(): Promise<any> {
    return new Promise((resolve, reject) => {
      let clientId = '2d3db558942e4eaabfafc953263192a7';
      let redirectUrl = 'http://192.168.1.13:3000/';
      let url = 'https://api.instagram.com/oauth/authorize/?client_id=' + clientId + '&redirect_uri=' + redirectUrl + '&response_type=token';

      let browser = new InAppBrowser(url, '_blank');
      browser.on('loadstop').subscribe(res => {
        console.log(res);
        if (res.url.indexOf(this.api.siteDomain) != -1) {
          let responseObj: any = {};
          if (res.url.indexOf('access_token')) {
            let splitUrl = res.url.split('#');
            let access_token = splitUrl[splitUrl.length - 1].split('=')[1];
            responseObj = { access_token: access_token }
          } else if (res.url.indexOf('code')) {
            let splitUrl = res.url.split('?');
            let code = splitUrl[splitUrl.length - 1].split('=')[1];
            responseObj = { code: code }
          }
          this.setSocialAuth(responseObj, Social.INSTAGRAM);
          browser.close();
          resolve();
        }
      }, (err) => {
        console.log(err);
        reject(err);
      })
    });
  }

  public setSocialAuth(authData: any, connectName: string): any {
    let socialAuthData = this.storage.get('social_auth_data') || {};
    socialAuthData[connectName] = authData;
    let status = this.storage.set('social_auth_data', socialAuthData);
    if (status) return connectName;
      else return false;
  }

  getFacebookData(): any { return this.getSocialAuth(Social.FACEBOOK); }

  getTwitterData(): any { return this.getSocialAuth(Social.TWITTER); }

  getInstagramData(): any { return this.getSocialAuth(Social.INSTAGRAM); }

  public getFriendList(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let fields: Array<string> = [
        'picture',
        'name',
        'first_name',
        'last_name',
        'devices'
      ];
      this.facebook.api(
        id + '/friends?fields=' + fields.join(','),
        this.fbPermissions
      ).then(res => {
        resolve(res);
      }).catch(err => reject(err))
    });
  }

  public getFbPermission() {

  }

  private getSocialAuth(socialName: string): any {
    let socialAuthData = this.storage.get('social_auth_data') || {};
    if (socialName == 'all') return socialAuthData;
    if (socialAuthData && socialAuthData[socialName]) return socialAuthData[socialName];
      else return false;
  }

}
