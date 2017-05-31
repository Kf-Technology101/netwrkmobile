import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { LocalStorage } from './local-storage';
import { Api } from './api';

import { BackgroundMode } from '@ionic-native/background-mode';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { TwitterConnect } from '@ionic-native/twitter-connect';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { AlertController } from 'ionic-angular';

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
    private twitter: TwitterConnect,
    private iab: InAppBrowser,
    private backgroundMode: BackgroundMode,
    private alertCtrl: AlertController
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
    // regex for image links
    // (http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))
    this.backgroundMode.disable();
    this.twitter.login().then(data => {
      let seq = this.api.post('profiles/connect_social',
      {
        user:
        {
          token: data.token,
          provider_name: 'twitter',
          secret: data.secret
        }
      }).share();
      seq.map(res => res.json()).subscribe( res => {
        console.log('[Twitter connect] twitter res:', res);
        this.setSocialAuth(data, Social.TWITTER);
      }, err => {
        console.error('[Twitter connect] twitter error:', err);
      });
      console.log('[Twitter connect] res:', data);
    }, err => {
      console.error('[Twitter connect] err:', err);
      let alert = this.alertCtrl.create({
        title: '',
        subTitle: 'You might need to install Twitter app to be able to login',
        buttons: ['Ok']
      });
      alert.present();
    });
  }

  parseInstagramData(res:any) {
    let responseObj: any = {};
    if (res.url.indexOf('access_token') !== -1) {
      let splitUrl = res.url.split('#');
      let access_token = splitUrl[splitUrl.length - 1].split('=')[1];
      responseObj = access_token ;
    }
    return responseObj;
  }

  connectToInstagram(): Promise<any> {
    return new Promise((resolve, reject) => {
      let clientId = '2d3db558942e4eaabfafc953263192a7';
      let clientSecret = 'bcf35f1ba4e94d59ad9f2c6c1322c640';
      let redirectUrl = 'http://192.168.1.13:3000/';
      let access_token:any;
      let autorization_link = `https://api.instagram.com/oauth/authorize/?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=token`;
      let browser = this.iab.create(autorization_link, '_blank');
      browser.on('loadstop').subscribe(res => {
        console.log('instagram first url data [res]:', res);
        if (res.url.indexOf(this.api.siteDomain) != -1) {
          if (this.parseInstagramData(res)) {
            access_token = this.parseInstagramData(res);
            browser.close();
          }

          let instagramData = {
            token: access_token,
            provider_name: 'instagram'
          };
          console.log('[instagram] instagramData:', instagramData);
          let seq = this.api.post('profiles/connect_social', {
            user: instagramData
          }).share();
          seq.map(res => res.json()).subscribe(res => {
            // this.setSocialAuth(responseObj, Social.INSTAGRAM);
            console.log('[instagram] res:', res);
          }, err => {
            console.error('[instagram] err:', err);
          });

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
