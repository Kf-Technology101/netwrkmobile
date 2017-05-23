import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { LocalStorage } from './local-storage';
import { Api } from './api';

import { InAppBrowser } from 'ionic-native';
import { TwitterConnect } from '@ionic-native/twitter-connect';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

@Injectable()
export class Social {
  public static FACEBOOK: string = 'facebook';
  public static TWITTER: string = 'twitter';
  public static INSTAGRAM: string = 'instagram';
  public fbPermissions: Array<string> = [
    'public_profile',
    'user_friends',
    'email',
    'user_birthday',
    'user_posts',
  ];

  constructor(
    public http: Http,
    public storage: LocalStorage,
    public api: Api,
    private facebook: Facebook,
    private twitter: TwitterConnect
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
    this.twitter.login().then(res => {
      this.storage.set('twitter_fignya', res);
      let seq = this.api.post('sessions/oauth_login', res).share();
      seq.map(res => res.json()).subscribe( res => {
        console.log('[oauth_login] twitter res:', res);
      }, err => {
        console.error('[oauth_login] twitter error:', err);
      });
      console.log('[Twitter connect] res:', res);
    }, err => {
      console.error('[Twitter connect] err:', err);
      this.storage.set('twitter_fignya_err', err);
    });
  }



  connectToInstagram(): Promise<any> {
    return new Promise((resolve, reject) => {
      let clientId = '2d3db558942e4eaabfafc953263192a7';
      let redirectUrl = 'http://192.168.1.13:3000/';
      let url = 'https://api.instagram.com/oauth/authorize/?client_id=' + clientId + '&redirect_uri=' + redirectUrl + '&response_type=token';
      let acc_token:any = '';
      let browser = new InAppBrowser(url, '_blank');
      browser.on('loadstop').subscribe(res => {
        console.log(res);
        if (res.url.indexOf(this.api.siteDomain) != -1) {
          let responseObj: any = {};
          if (res.url.indexOf('access_token')) {
            let splitUrl = res.url.split('#');
            let access_token = splitUrl[splitUrl.length - 1].split('=')[1];
            responseObj = { access_token: access_token };
            acc_token = responseObj.access_token;
            acc_token = acc_token.slice(0, acc_token.indexOf('&'));
          } else if (res.url.indexOf('code')) {
            let splitUrl = res.url.split('?');
            let code = splitUrl[splitUrl.length - 1].split('=')[1];
            responseObj = { code: code };
          }
          this.setSocialAuth(responseObj, Social.INSTAGRAM);

          console.log('[instagram] acc_token:', acc_token);
          let instagramData = {
            provider_name: 'instagram',
            token: acc_token
          };
          console.log('[instagram] obj:', instagramData);
          let seq = this.api.post('sessions/oauth_login', { user: instagramData }).share();
          seq.map(res => res.json()).subscribe(res => {
            console.log('[instagram] res:', res);
          }, err => {
            console.error('[instagram] err:', err);
          });
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
      let requestPath: string = `${id}/friends?fields=${fields.join(',')}`;

      console.log('[Social][getFbUserPosts]', requestPath);
      this.facebook.api(requestPath, this.fbPermissions).then(res => {
        resolve(res);
      }).catch(err => reject(err))
    });
  }

  public getFbUserPosts(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let fields: Array<string> = [
        'created_time',
        'description',
        'is_published',
        'message',
        'link',
        'name',
        'picture',
        'full_picture',
        'type'
      ];
      let requestPath: string = `${id}/feed?fields=${fields.join(',')}&limit=10`

      console.log('[Social][getFbUserPosts]', requestPath);
      this.facebook.api(requestPath, this.fbPermissions).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err)
      })
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
