import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { LocalStorage } from './local-storage';
import { Api } from './api';

import { BackgroundMode } from '@ionic-native/background-mode';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { TwitterConnect } from '@ionic-native/twitter-connect';
import { Facebook } from '@ionic-native/facebook';
import { AlertController, Platform } from 'ionic-angular';
import { AppAvailability } from "@ionic-native/app-availability";

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
    'user_posts'
  ];

  public connect: any = {
    facebook: false,
    instagram: false,
    twitter: false,
    snapchat: false
  };

  constructor(
    public http: Http,
    public storage: LocalStorage,
    public api: Api,
    private facebook: Facebook,
    private twitter: TwitterConnect,
    private iab: InAppBrowser,
    private backgroundMode: BackgroundMode,
    private alertCtrl: AlertController,
    private appAvailability: AppAvailability,
    private platform: Platform,
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

  private checkTwitterAvailability():Promise<any> {
    return new Promise((resolve, reject) => {
      let app:string;
      if (this.platform.is('ios')) {
        app = 'twitter://';
      } else if (this.platform.is('android')) {
        app = 'com.twitter.android';
      }

      this.appAvailability.check(app)
        .then(yes => resolve(), no => reject());
    });
  }

  connectToTwitter() {
    // this.checkTwitterAvailability().then(yes => {
      this.backgroundMode.disable();
      if (!this.connect.twitter) {
        this.twitter.login().then(data => {
          let seq = this.api.post('profiles/connect_social',
          {
            user: {
              token: data.token,
              provider_name: 'twitter',
              secret: data.secret,
              name: data.userName
            }
          }).share();
          seq.map(res => res.json()).subscribe( res => {
            console.log('[Twitter connect] twitter res:', res);
            this.setSocialAuth(data, Social.TWITTER);
          }, err => {
            console.error('[Twitter connect] twitter error:', err);
          });
          console.log('[Twitter connect] res:', data);
          if ((<any>Object).values(data)) {
            this.connect.twitter = true;
          }
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
    // }, no => {
    //   let alert = this.alertCtrl.create({
    //     title: '',
    //     subTitle: 'You might need to install Twitter app to be able to login',
    //     buttons: ['Ok']
    //   });
    //   alert.present();
    // });
  }

  private getAccessToken(res:any) {
    if (res.url.indexOf('access_token') !== -1) {
      let splitUrl = res.url.split('#');
      return splitUrl[splitUrl.length - 1].split('=')[1];
    } else return false;
  }

  connectToInstagram():Promise<any> {
    return new Promise((resolve, reject) => {
      const clientId = '2d3db558942e4eaabfafc953263192a7';
      const clientSecret = 'bcf35f1ba4e94d59ad9f2c6c1322c640';
      const redirectUrl = this.api.hostUrl + '/loader';
      let autorizationLink = `https://api.instagram.com/oauth/authorize/?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=token`;

      let instagramData:any = {
        token: null,
        provider_name: 'instagram',
        client_id: clientId,
        client_secret: clientSecret
      };

      const browser = this.iab.create(autorizationLink, '_blank', {
        clearcache: 'yes'
      });
      browser.on('loadstop').subscribe(res => {
        console.log('instagram auth res:', res);
        if (res.url.indexOf('access_token=') != -1 && !instagramData.token) {
          browser.hide();
          const accessToken = this.getAccessToken(res);
          instagramData.token = accessToken ? accessToken : false;
          console.log('[instagram] instagramData:', instagramData);
          if (instagramData.token) {
            let seq = this.api.post('profiles/connect_social', {
              user: instagramData
            }).share();
            seq.map(res => res.json()).subscribe(res => {
              console.log('[instagram] res:', res);
              if (res.message == 'ok') { browser.close(); resolve(); }
              else browser.show();
            }, err => {
              console.error('[instagram] err:', err);
              browser.show();
              reject();
            });
          } else console.warn('[INSTAGRAM] No access token');
        }
      }, err => { console.log(err); reject(err); });

      browser.on('exit').subscribe(res => {
        console.log('browser close');
        reject();
      }, err => { console.error(err); reject(err); })
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
        reject(err);
      })
    });
  }

  public getSocialPosts(social_names:any) {
    let seq = this.api.post('messages/social_feed', {
      social: social_names
    }).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
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
