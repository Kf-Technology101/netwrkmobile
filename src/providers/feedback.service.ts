import { Http, Headers, RequestOptions } from '@angular/http';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Facebook } from '@ionic-native/facebook';
import { Injectable } from '@angular/core';
import { Tools } from './tools';
import { Chat } from './chat';
import { Api } from './api';

@Injectable()
export class FeedbackService {
  constructor(
    private chatService: Chat,
    private toolsService: Tools,
    public sharing: SocialSharing,
    private facebook: Facebook,
    private api: Api
  ) {}

  public toggleLikes(message_id:number, user_id:number, event?:any):void {
    let el;
    if (event) {
      el = event.target;
      if (el.classList.contains('active')) el.classList.remove('active');
      else el.classList.add('active');
    }
    this.chatService.sendFeedbackData('user_likes', {
      user_id: user_id,
      message_id: message_id
    }).subscribe(res => {
      this.toolsService.sendPointData({
        points: el ? (el.classList.contains('active') ? 5 : -5) : null,
        user_id: user_id
      }).subscribe(res => {
        console.log('[FeedbackService] sendPointData res:', res);
      }, err => console.error('[FeedbackService] sendPointData err:', err));
      console.log('[FeedbackService] toggleLikes res:', res);
    }, err => {
      console.error('[FeedbackService] toggleLikes err:', err);
    });
  }

  public autoPostToFacebook(shareParams:any):Promise<any> {
    return new Promise((success, reject) => {
      this.facebook.api('/me/feed?message=autopost', ['publish_actions']).then(res => {
        console.log('fb api res:', res);
        this.facebook.getAccessToken().then(token => {
          console.log(token);
          let headers = new Headers();
          let options = new RequestOptions();
          headers.append('Authorization', 'OAuth ' + token);
          options.headers = headers;
          this.api.http.post('https://graph.facebook.com/v2.9/me/feed', {
            'message': shareParams.message,
            'link': shareParams.url,
            'access_token': token
          }, options).subscribe(succ => {
            console.log('fb POST success:', succ);
            success(res);
          }, err => {
            console.error(err);
            reject();
          });
        }, err => {
          console.error(err);
          reject();
        });
      }, err => {
        console.error(err);
        reject();
      });
    });
  }

  public initNativeShare(message:any):void {
    console.log('[initNativeShare] message:', arguments);
    let subject = message.text_with_links ? message.text_with_links : '';
    let file = message.image_urls.length > 1 ? message.image_urls[0] : null;
    this.sharing.share(message.text_with_links, 'Netwrk', file, 'https://netwrkapp.com').then(res => {

    }, err => console.error(err));
  }

}
