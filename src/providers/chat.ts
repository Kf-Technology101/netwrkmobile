import { Injectable, ViewChild } from '@angular/core';

import { Platform, ModalController } from 'ionic-angular';

import { LocalStorage } from './local-storage';
import { Gps } from './gps';
import { Api } from './api';
import { Tools } from './tools';
import { Auth } from './auth';

import * as moment from 'moment';
import { Toggleable } from '../includes/toggleable';
import { MainButton } from '../includes/mainButton';

// Pages
import { NetworkNoPage } from '../pages/network-no/network-no';
import { NetworkPage } from '../pages/network/network';

// Gallery
import { ImagePicker } from 'ionic-native';
import { Camera } from '../providers/camera';
import { NetworkProvider } from '../providers/network';
import { chatAnim } from '../includes/animations';
// File transfer
import { File } from '@ionic-native/file';
import {
  Transfer,
  FileUploadOptions,
  TransferObject
} from '@ionic-native/transfer';

// sockets
import { Ng2Cable, Broadcaster } from 'ng2-cable/js/index';

// Custom libs
import { MessageDateTimer } from '../includes/messagedatetimer';

@Injectable()
export class Chat {
  public users: any = {};
  private message: any = null;

  public postMessages: any = [];

  public appendContainer = new Toggleable('off', true);
  public mainBtn = new Toggleable('normal', false);
  public postBtn = new Toggleable(false);
  public bgState = new Toggleable('compressed');
  public plusBtn = new Toggleable('default');
  public chatBtns = new Toggleable(['btnHidden', 'btnHidden', 'btnHidden', 'btnHidden']);

  public messageDateTimer: any = new MessageDateTimer();

  private pickerOptions = {
    maximumImagesCount: 3 - this.cameraPrvd.takenPictures.length
  }
  public hostUrl: string;

  private sounds:any = {
    message: new Audio('assets/sound/message.mp3')
  }

  public isMainBtnDisabled: boolean;

  public imagesToLoad:any;
  public loadedImages:any;
  public scrollTimer:any = {
    timeout: null,
    interval: null
  };
  public user:any;

  public isMessagesVisible: boolean = false;
  public networkAvailable:boolean = false;

  constructor(
    public localStorage: LocalStorage,
    public api: Api,
    public gps: Gps,
    public tools: Tools,
    private file: File,
    private transfer: Transfer,
    public cameraPrvd: Camera,
    public plt: Platform,
    public authPrvd: Auth,
    public modalCtrl: ModalController,
    private networkPrvd: NetworkProvider,
    public ng2cable: Ng2Cable,
    public broadcaster: Broadcaster
  ) {
    // console.log('Hello Chat Provider');
    this.hostUrl = this.api.hostUrl;
    this.user = this.authPrvd.getAuthData();
  }

  public checkSocialData(socialName:string):boolean {
    let socialData = this.localStorage.get('social_auth_data');
    return socialData[socialName] ? true : false;
  }

  public detectNetwork():any {
    return new Promise((resolve, reject) => {
      this.gps.getMyZipCode().then(zipRes => {
        this.gps.getNetwrk(zipRes.zip_code).subscribe(res => {
          console.log('(detectNetwork) res:', res);
          resolve(res);
        }, err => {
          console.error(err);
          reject(err);
        });
      }, err => {
        console.error(err);
      });
    });
  }

  public updateAvatarUrl(event: any) {
    event.target.src = 'assets/icon/netwrk-chat.svg';
  }

  public playSound() {
    this.sounds.message.play();
  }

  public blockPost(messageID:number) {
    let mess = this.api.get('messages/block', {
      message_id: messageID
    }).share();
    let messMap = mess.map(res => res.json());
    return messMap;
  }

  public setState(state: string) {
    this.localStorage.set('chat_state', state);
  }

  public getState(): string {
    let state = this.localStorage.get('chat_state');
    let result = state ? state : 'area';
    return result;
  }

  public setZipCode(zipCode: number) {
    let zip = this.chatZipCode();
    if (zip == 0) this.localStorage.set('chat_zip_code', zipCode);
  }

  public chatZipCode(): any {
    let chatZipCode = this.localStorage.get('chat_zip_code');
    let result = chatZipCode ? chatZipCode : 0;
    return result;
  }

  public deleteMessages() {
    // let params = { network_id: this.networkPrvd.getNetworkId() };
    let mess = this.api.post('messages/delete', {
      lat: this.gps.coords.lat,
      lng: this.gps.coords.lng,
      post_code: this.chatZipCode()
    }).share();
    let messMap = mess.map(res => res.json());
    return messMap;
  }

  public sendFeedbackData(link: string, data: any) {
    let feed = this.api.post(link, data).share();
    let feedMap = feed.map(res => res.json());
    return feedMap;
  }

  public closeSockets() {
    try {
      this.ng2cable.unsubscribe();
    } catch (err) {
      console.error(err);
    }
  }

  public socketsInit() {
    console.info('socketsInit()');
    let channel = 'ChatChannel';
    let zipCode = this.localStorage.get('chat_zip_code');
    console.log('[chat constructor] storage zip:', this.localStorage.get('chat_zip_code'));
    let lobby = 'messages' + zipCode + 'chat';

    console.log('ng2cable link:', this.hostUrl + '/cable');
    if (this.ng2cable.subscription) {
      this.ng2cable.unsubscribe();
    }

    this.ng2cable.subscribe(this.hostUrl + '/cable', {
      channel: <string> channel,
      post_code: <number> zipCode
    });

    console.log('broadcaster:', this.broadcaster);
    this.broadcaster['_eventBus'].observers = [];
    this.broadcaster.on<any>(channel).subscribe(
      data => {
        console.log('[SOCKET] Message received:', data);
        let insideUndercover = this.gps
        .calculateDistance({
          lat: <number> parseFloat(data.message.lat),
          lng: <number> parseFloat(data.message.lng)
        });
        if (this.getState() == 'undercover') {
          if (data.message.undercover && insideUndercover) {
            this.postMessages.push(data.message);
            if (data.message.user_id != this.user.id)
              this.playSound();
            this.messageDateTimer.start(this.postMessages);
          }
        } else if (this.getState() != 'undercover' && !data.message.undercover) {
          console.log('[area message] data:', data.message);
          this.postMessages.unshift(data.message);
          if (data.message.user_id != this.user.id)
            this.playSound();
          this.messageDateTimer.start(this.postMessages);
        }
    }, err => {
      console.error('[SOCKET] Message error:', err);
    });

    this.broadcaster.on<any>(lobby).subscribe(
      data => {
        console.log('[SOCKET] lobby:', data);
      }, err => {
        console.error('[SOCKET] lobby error:', err);
      }
    );
  }

  public sendMessage(data: any): any {
    return new Promise((resolve, reject) => {
      let params = {
        message: data,
        post_code: this.localStorage.get('chat_zip_code')
      };
      params.message.network_id = this.getNetwork() ? this.getNetwork().id : null;
      params.message.lat = this.gps.coords.lat;
      params.message.lng = this.gps.coords.lng;

      console.info('[sendMessage] params:', params);

      if (data.images && data.images.length > 0) {
        this.tools.showLoader();
        this.sendMessageWithImage(params, data.images).then(res => {
          console.log('[sendMessageWithImage] res:', res);
          this.tools.hideLoader();
          resolve(res);
        }).catch(err => {
          // console.log(err);
          reject(err);
        });
      } else {
        // console.log('params', params);
        this.sendMessageWithoutImage(params).subscribe(res => {
          // console.log('[SEND MESSAGE] res:', res);
          resolve(res);
        }, err => {
          // console.log(err);
          reject(err);
        });
      }

    })
  }

  public lockMessage(lock) {
    let seq = this.api.post('messages/lock', lock).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  public unlockPost(data) {
    let seq = this.api.post('messages/unlock', {
      id: data.id,
      password: data.password
    }).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  public getMessages(
    undercover: boolean,
    messagesArray?: Array<any>,
    params?: any,
    doRefresh?: any
  ) {
    // console.log('===================================');
    // console.log('[getMessages] arguments:', arguments);
    let offset: number = messagesArray && messagesArray.length
      ? messagesArray.length : 0;

    let data: any = {
      post_code: this.localStorage.get('chat_zip_code'),
      undercover: undercover ? undercover : false,
      lat: this.gps.coords.lat,
      lng: this.gps.coords.lng,
      offset: offset,
      limit: 20
    };

    let messagesIds = [];
    for (let i in messagesArray) {
      messagesIds.push(messagesArray[i].id);
    }

    // console.log('[getMessages] data:', data);
    // console.log('[getMessages] messagesIds:', messagesIds);

    // console.log('messagesIds:', messagesIds);
    if (data.undercover && !doRefresh) {
      data.offset = 0;
      data.limit = offset == 0 ? 20 : offset;
      data.current_ids = messagesIds;
    }

    if (params) Object.assign(data, params);

    // console.log('[getMessages] params:', params);
    // console.log('[getMessages] data (if undecover & can\'t refresh):', data);

    let seq = this.api.get('messages', data).share();
    let seqMap = seq.map(res => res.json());

    // console.log('===================================');

    return seqMap;
  }

  public getMessagesByUserId(params: any) {
    let data: any = {
      network_id: this.networkPrvd.getNetworkId(),
      lat: this.gps.coords.lat,
      lng: this.gps.coords.lng,
      limit: 20
    };

    if (params) Object.assign(data, params);

    let seq = this.api.get('messages/profile_messages', data).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  public saveNetwork(network: any) {
    this.localStorage.set('current_network', network);
  }

  public setStorageUsers(users: Array<any>) {
    let stUsers: any = {};
    if (users.length) for (let i in users) stUsers[users[i].id] = users[i];
    this.localStorage.set('chat_count_users', stUsers.length);
    this.users = stUsers;
  }

  public organizeMessages(data: any, fn?: any): any {
    let messages: Array<any> = [];
    for (let i in data) {
      data[i].date = moment(data[i].created_at).fromNow();
      messages.push(data[i]);
    }
    return messages;
  }

  public getNetwork(): any {
    return this.localStorage.get('current_network');
  }

  public getLegendaryHistory(netId:number) {
    // console.log('[getLegendaryHistory] netId:', netId);
    let legendaryList = this.api.get('messages/legendary_list', { network_id: netId }).share();
    let legendaryMap = legendaryList.map(res => res.json());
    return legendaryMap;
  }

  public removeNetwork() {
    this.localStorage.rm('current_network');
  }

  public getCountUser(): number {
    return this.localStorage.get('chat_count_users');
  }

  private sendMessageWithImage(params: any, dataImages: any): any {
    return new Promise((resolve, reject) => {
      let files = [];
      let images: Array<string> = [];
      for (let i of dataImages) {
        images.push(i);
      }

      // console.log(images);

      var getFileBlob = function (url, cb) {
        // console.log(url, cb);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.addEventListener('load', function() {
          cb(xhr.response);
        });
        xhr.send();
      };

      var blobToFile = function (blob, name) {
        // console.log(blob, name);
        blob.lastModifiedDate = new Date();
        blob.name = name;
        return blob;
      };

      var getFileObject = function(filePathOrUrl, cb) {
        // console.log(filePathOrUrl, cb);
         getFileBlob(filePathOrUrl, function (blob) {
            cb(blobToFile(blob, filePathOrUrl.split('/').pop()));
         });
      };

      let i = 0;
      let self = this;
      let r = (i) => {
        getFileObject(images[i], function (fileObject) {
          files.push(fileObject);
            // console.log(fileObject);
            i++;
            if (i == images.length) {
              // console.log('end', files);
              let xhr: XMLHttpRequest = new XMLHttpRequest();

              console.info('[getFileObject] params:', params.undercover + '');

              let formData: FormData = self.api.createFormData(params);
              for (let i in files)
                formData.append('images[]', files[i], files[i].name);

              xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                  if (xhr.status === 200) {
                    // console.log(JSON.parse(xhr.response));
                    resolve(JSON.parse(xhr.response));
                  } else {
                    // console.log(xhr.response);
                    reject(xhr.response);
                  }
                }
              };

              xhr.open('POST', self.api.url + '/messages', true);
              xhr.setRequestHeader(
                'Authorization', self.localStorage.get('auth_data').auth_token);
              xhr.send(formData);

            } else {
              r(i);
            }
        });
      }
      r(i);
    })
  }

  private sendMessageWithoutImage(data: any) {
    data.message.images = [];
    // console.log('data', data);
    let seq = this.api.post('messages', data).share();
    let seqMap = seq.map(res => res.json());

    return seqMap;
  }

  public updateAppendContainer() {
    // console.log('[chatPrvd] updateAppendContainer()...');
    let pictures = this.cameraPrvd.takenPictures;
    if (pictures && pictures.length > 0) {
      this.plusBtn.setState('default');
      this.bgState.setState('compressed');
      for (let i = 0; i < this.chatBtns.state.length; i++) {
        this.chatBtns.state[i] = 'btnHidden';
      }
      this.postBtn.setState(true);
      this.appendContainer.show();
      this.appendContainer.setState('on_append');
      if (this.mainBtn.getState() != 'moved-n-scaled')
        this.mainBtn.setState('above_append');
    }
  }

  public openGallery(): void {
    let pickerOptions = {
      maximumImagesCount: 3 - this.cameraPrvd.takenPictures.length
    }
    if (pickerOptions.maximumImagesCount <= 0) {
      this.tools.showToast('You can\'t append more pictures');
    } else {
      ImagePicker.getPictures(pickerOptions).then(file_uris => {
        for (let fileUrl of file_uris) {
          if (this.cameraPrvd.takenPictures.length < 3) {
            if (this.plt.is('android')) {
              if (fileUrl.indexOf('file:///') !== -1)
                this.cameraPrvd.takenPictures.push(fileUrl);
            } else {
              this.cameraPrvd.takenPictures.push(fileUrl);
            }
          }
        }
        this.updateAppendContainer();
      }, err => {
      //console.log('[imagePicker] err:', err);
      });
    }
  }

  public sendFeedback(messageData: any, mIndex: number) {
    return new Promise(res => {
      let feedbackData = {
        message_index: mIndex,
        message_id: messageData.id,
        user: this.authPrvd.getAuthData(),
        message_coords: {
          lat: messageData.lat,
          lng: messageData.lng
        }
      };
      // console.log('message data:', messageData);
      // console.log('feedback data:', feedbackData);
      this.mainBtn.setState('minimised');
      // console.log('messageData.image_urls', messageData.image_urls);
      let image = messageData.image_urls.length > 0 ? messageData.image_urls[0] : null;
      // console.log('image', image);
      let params = {
        data: feedbackData,
        messageText: messageData.text,
        messageImage: image,
        totalLikes: messageData.likes_count,
        likedByUser: messageData.like_by_user,
        totalLegendary: messageData.legendary_count,
        legendaryByUser: messageData.legendary_by_user,
        showLegendary: true
      };
      res(params);
    });
  }

  public goToProfile(profileId?: number, profileTypePublic?: boolean): Promise<any> {
    return new Promise(res => {
      // console.log('[ChatProvider][goToProfile]', profileTypePublic);
      if (!profileId) profileId = this.authPrvd.getAuthData().id;
      let params = {
        id: profileId,
        public: profileTypePublic,
        currentUser: this.authPrvd.getAuthData(),
      };
      res(params);
    });
  }

  public calcLoadedImages() {
    this.loadedImages++;
  }

  public calcTotalImages(messages:any) {
    this.loadedImages = 0;
    this.imagesToLoad = 0;
    for (let i in messages) {
      if (messages[i].image_urls && messages[i].image_urls.length > 0) {
        this.imagesToLoad += messages[i].image_urls.length;
      }
    }
  }

  public scrollToBottom(content:any){
    if (this.scrollTimer.interval) {
      clearInterval(this.scrollTimer.interval);
    }
    if (this.scrollTimer.timeout) {
      clearTimeout(this.scrollTimer.timeout);
    }
    this.scrollTimer.interval = setInterval(() => {
      // console.log('[scrollToBottom] loaded:', this.loadedImages + '/' + this.imagesToLoad);
      if (this.imagesToLoad == this.loadedImages) {
        content.scrollTo(0, content.getContentDimensions().scrollHeight, 100);
        clearInterval(this.scrollTimer.interval);
        setTimeout(() => {
          this.isMessagesVisible = true;
          this.tools.hideLoader();
        }, 150);
      }
    }, 300);
    this.scrollTimer.timeout = setTimeout(() => {
      clearInterval(this.scrollTimer.interval);
    }, 3000);
  }

  public showMessages(messages:any, location: any, isUndercover?: boolean): Promise<any> {
    let loadMessages:any;
    let arg:any;
    switch (location) {
      case 'chat':
        loadMessages = this.getMessages.bind(this);
        arg = isUndercover ? isUndercover : false;
      break;
      case 'legendary':
        loadMessages = this.getLegendaryHistory.bind(this);
        arg = this.getNetwork().id
      break;
      default:
        loadMessages = this.getMessages.bind(this);
        arg = isUndercover ? isUndercover : false;
      break;
    }
    // console.log('[ChatPage][showMessages] isUndercover:', isUndercover);
    return new Promise(res => {
      loadMessages(arg).subscribe(data => {
        let receivedMessages:any;
        if (location == 'chat') {
          receivedMessages = data.messages;
        } else {
          receivedMessages = data.messages.reverse();
        }
        // console.log('[ChatPage][showMessages] data:', data);
        // console.log('[ChatPage][showMessages] postMessages:', this.postMessages);
        if (!data) {
          // console.warn('[showMessages] NO DATA');
          this.tools.hideLoader();
          this.isMainBtnDisabled = false;
          return;
        }
        if (messages.length > 0 && data.messages.length > 0) {
          res({
            messages: this.organizeMessages(receivedMessages),
            callback: (mess) => {
              // console.log('[showMessages] messages:', mess);
              this.calcTotalImages(mess);
              this.messageDateTimer.start(mess);
              setTimeout(() => {
                this.isMainBtnDisabled = false;
              }, 1);
            }
          });
        } else if (data.messages.length > 0) {
          res({
            messages: this.organizeMessages(receivedMessages),
            callback: (mess) => {
              // console.log('[showMessages] messages:', mess);
              this.calcTotalImages(mess);
              this.messageDateTimer.start(mess);
              setTimeout(() => {
                this.isMainBtnDisabled = false;
              }, 1);
            }
          });
        }
      }, err => {
        this.tools.hideLoader();
        this.isMainBtnDisabled = false;
        // console.log('[getMessage] Err:', err);
      });
    })
  }
}
