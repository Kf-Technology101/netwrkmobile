import { Injectable } from '@angular/core';
import { Platform, ModalController, Events } from 'ionic-angular';
import { ImagePicker } from 'ionic-native';

import { LocalStorage } from './local-storage';
import { Gps } from './gps';
import { Api } from './api';
import { Tools } from './tools';
import { Auth } from './auth';
import { Social } from './social';

import * as moment from 'moment';

// Gallery
import { Camera } from '../providers/camera';
import { NetworkProvider } from '../providers/networkservice';

// File transfer
import { File } from '@ionic-native/file';
import { Transfer } from '@ionic-native/transfer';

// sockets
import { Ng2Cable, Broadcaster } from 'ng2-cable';

// Custom libs
import { MessageDateTimer } from '../includes/messagedatetimer';
import { Toggleable } from '../includes/toggleable';

@Injectable()
export class Chat {
  public users: any = {};

  public postMessages: any = [];
  public postAreaMessages: any = [];
  public postLineMessages: any = [];

  public oldMessages:any = [];

  public isLandingPage: boolean;
  public areaLobby: boolean = false;
  public areaFilter : boolean=false;
  public holdFilter : boolean=false;

  public appendContainer = new Toggleable('off', true);
  public appendLineContainer = new Toggleable('off', true);
  public mainBtn = new Toggleable('normal', false);
  public mainLineBtn = new Toggleable('normal', false);
  public isLanding = new Toggleable(true);
  public postBtn = new Toggleable(false);
  public bgState = new Toggleable('compressed');
  public plusBtn = new Toggleable('default');
  public chatBtns = new Toggleable(['btnHidden', 'btnHidden', 'btnHidden', 'btnHidden']);
  public lobbyContainer = new Toggleable('hide');

  public messageDateTimer: any = new MessageDateTimer();

  public hostUrl: string;

  public isMainBtnDisabled: boolean;

  public imagesToLoad:any;
  public loadedImages:any;
  public scrollTimer:any = {
    timeout: null,
    interval: null
  };
  public user:any;

  public isMessagesVisible: boolean = false;
  public networkAvailable:boolean = null;

  public alreadyScolledToBottom:boolean = false;

  public isCleared:boolean = false;

  public isLobbyChat:boolean = false;
  public currentLobby:any = {
    id: undefined,
    users: undefined,
    currentUserPresent: false,
    isAddButtonAvailable: true
  };

  public currentLobbyMessage:any;

  public allowUndercoverUpdate:boolean = true;
 
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
    private ng2cable: Ng2Cable,
    private broadcaster: Broadcaster,
    private roomCable: Ng2Cable,
    private roomBroadcaster: Broadcaster,
    public socialPrvd: Social,
    public events: Events
  ) {
    this.hostUrl = this.api.hostUrl;
    this.user = this.authPrvd.getAuthData();
  }

  public deleteMessage(messageId:number):any {
    let mess = this.api.post('messages/delete_for_all', {
      id: messageId
    }).share();
    let messMap = mess.map(res => res.json());
    return messMap;
  }

  public getLocationLobby(messageId:number):any {
    let mess = this.api.get('messages/' + messageId + '/room/messages').share();
    let messMap = mess.map(res => res.json());
    return messMap;
  }

  public getLocationLobbyUsers(messageId:number):any {
    let mess = this.api.get('messages/' + messageId + '/room/users').share();
    let messMap = mess.map(res => res.json());
    return messMap;
  }

  public connectUserToChat(roomId:number):any {
    let mess = this.api.post('rooms/' + roomId + '/users', {}).share();
    let messMap = mess.map(res => res.json());
    return messMap;
  }

  public followUserToLine(messageId:number):any {
	  // this.updateSyncMessage(messageId);
      this.user = this.authPrvd.getAuthData();
    let mess = this.api.post('user_followed', {
        message_id: messageId,
        user_id: this.user.id
    }).share();
    let messMap = mess.map(res => res.json());
	
    return messMap;
  }

  public checkSocialData(socialName:string):boolean {
    // let socialData = this.localStorage.get('social_auth_data');
    return this.socialPrvd.connect[socialName];
    //   return this.socialPrvd.connect[socialName] ? true : false;
    // else
    //   return false;
  }

  public detectNetwork():any {
    return new Promise((resolve, reject) => {
      this.gps.getNetwrk(this.localStorage.get('chat_zip_code')).subscribe(res => {
        console.log('(detectNetwork) res:', res);
        resolve(res);
      }, err => {
        console.error(err);
        reject(err);
      });
    });
  }

  public updateAvatarUrl(event: any):void {
    event.target.src = 'assets/icon/netwrk-chat.svg';
  }

  public blockPost(messageID:number):any {
    let mess = this.api.get('messages/block', {
      message_id: messageID
    }).share();
    let messMap = mess.map(res => res.json());
    return messMap;
  }

  public getParentLobby(message:any):any {
      let mess = this.api.get('rooms/' + message.messageable_id + '/network').share();
      let messMap = mess.map(res => res.json());
      return messMap;
  }

  public setState(state: string):void {
    this.localStorage.set('chat_state', state);
  }

  public getState(): string {
    let state = this.localStorage.get('chat_state');
    let result = state ? state : 'area';
    return result;
  }

  public setZipCode(zipCode: number):void {
    let zip = this.chatZipCode();
    if (zip == 0) this.localStorage.set('chat_zip_code', zipCode);
  }

  public chatZipCode(): any {
    let chatZipCode = this.localStorage.get('chat_zip_code');
    let result = chatZipCode ? chatZipCode : 0;
    return result;
  }

  public deleteMessages(id_list:any):any {
    let mess = this.api.post('messages/delete', {
      lat: this.gps.coords.lat,
      lng: this.gps.coords.lng,
      post_code: this.chatZipCode(),
      ids: id_list
    }).share();
    let messMap = mess.map(res => res.json());
    return messMap;
  }

  public sendFeedbackData(link: string, data: any):any {
    let feed = this.api.post(link, data).share();
    let feedMap = feed.map(res => res.json());
    return feedMap;
  }

  public closeSockets():void {
    try {
      this.broadcaster['_eventBus'].observers = [];
      this.ng2cable.unsubscribe();
    } catch (err) { console.error(err); }
  }

  private syncMessage(message:any):void {
    this.postMessages.forEach((m, index) => {
      console.log('syncing message:', m);
      if (m.timestamp == message.timestamp) {
        this.postMessages.splice(index, 1, message);
        // this.postMessages[index] = JSON.parse(JSON.stringify(message));
        console.log('sync completed successfully. Res:', m);
      } else console.log('skipping...');
    });
  }
  
  private updateSyncMessage(message:any):void {
	this.postMessages.forEach((m, index) => {
	  if (m.id == message) {
        this.postMessages.splice(index, 1, message);
        // this.postMessages[index] = JSON.parse(JSON.stringify(message));
      } else console.log('skipping...');
    });
  }
  

  private appendMessage(data:any, messageContainer:any):void {
    if (data.message.user_id != this.user.id || data.message.social)
      messageContainer.unshift(data.message);
    else if (data.message.user_id == this.user.id)
      this.syncMessage(data.message);
    this.messageDateTimer.start(messageContainer);
  }

  public sortLobbyUsersByHostId(hostId:number):void {
    let hostIndex:number;
    let hostUser:any;
      if(this.currentLobby.users.length){
          this.currentLobby.users.forEach((u, index) => {
              if (u.id == hostId) {
                  hostIndex = index;
                  hostUser = u;
              }
          });
          this.currentLobby.users.splice(hostIndex, 1);
          this.currentLobby.users.unshift(hostUser);
      }
  }

  public isCurrentUserBelongsToChat(users:Array<any>):any {
    let isInside:boolean = false;
        this.user=this.authPrvd.getAuthData();
        for (let i = 0; i < users.length; i++) {
          if (users[i].id == this.user.id) { isInside = true; break; }
        }
    console.log('[isCurrentUserBelongsToChat] res:', isInside);
    return isInside;
  }

  public handleUserChatJoinRequest():void {
    if (this.currentLobby.id) {
      this.connectUserToChat(this.currentLobby.id).subscribe(() => {
      }, err => console.error(err));
    } else console.error('[handleUserChatJoinRequest] Lobby object does not contain {id} property');
  }

  public openLobbyForPinned(message:any):Promise<any> {
    return new Promise ((resolve, reject) => {
		this.gps.coords.lat = parseFloat(message.lat);
		this.gps.coords.lng = parseFloat(message.lng);
		
      if (!this.isLobbyChat) { 
	    this.getLocationLobby(message.id).subscribe(res => {
		  if (res && res.messages && res.room_id) {
			this.postMessages = [];
            this.postLineMessages = [];
            this.postAreaMessages = [];
			
			message.isMain = true;
			if (res.messages && res.messages.length > 0) {
				this.postMessages = this.postMessages.concat(res.messages);
			}

            if(this.areaLobby){
                if(this.postAreaMessages.indexOf(message)==-1){
                    this.postAreaMessages.unshift(message);
                }
            }else if(!this.isLobbyChat){
                this.postMessages.push(message);
                if(this.postLineMessages.indexOf(message)==-1){
                    this.postLineMessages.unshift(message);
                }
            }
			console.log('this.postMessages:::',this.postMessages);
            this.currentLobby.id = res.room_id;
            this.currentLobbyMessage = message;
            this.startLobbySocket(res.room_id);
            this.getLocationLobbyUsers(message.id).subscribe(res => {
              if (res && res.users && res.host_id) {
                this.currentLobby.users = res.users;
                this.currentLobby.hostId = res.host_id;
                this.currentLobby.isAddButtonAvailable = !this.isCurrentUserBelongsToChat(this.currentLobby.users);
                resolve();
              } else {
                reject('[getLocationLobbyUsers] Server returned no users or host_id');
              }
            }, err => {
              console.error(err);
              reject(err); });
          } else {
            reject('[getLocationLobby] no res or res.messages');
          }
        }, err => {
          console.error(err);
          reject(err);
        });
      } else {
        reject('[getLocationLobby] Post is not legendary or you are currently in lobby');
      }
    });
  }

  public toggleLobbyChatMode():void {
    this.isLobbyChat = !this.isLobbyChat;
    if (!this.isLobbyChat) {
      this.currentLobby.id = null;
      this.closeLobbySocket();
      this.socketsInit();
    }
  }

  public closeLobbySocket():void {
    if (this.roomCable.subscription) {
      this.roomCable.unsubscribe();
    }
  }

  public startLobbySocket(roomId:number):void {
    let channel:string = 'RoomChannel';
    console.log('starting lobby socket on', roomId);
    this.closeLobbySocket();

    this.roomCable.subscribe(this.hostUrl + '/cable', channel, {
      room_id: roomId
    });
    console.log('[SOCKET] roomCable object:', this.roomCable);

    this.roomBroadcaster['_eventBus'].observers = [];
    this.roomBroadcaster.on<any>(channel).subscribe(
      data => {
        console.log('[SOCKET] data:', data);
        if (data && data.socket_type) {
          switch(data.socket_type) {
            case 'message':
              this.appendMessage(data, this.postMessages);
            break;
            case 'user_connect':
              console.log('[SOCKET] User joined your chat');
              if (!this.isCurrentUserBelongsToChat(this.currentLobby.users)) {
                this.currentLobby.users.push(this.user);
                this.currentLobby.isAddButtonAvailable = false;
              }
            break;
          }
        }
      }
    )
  }

  public socketsInit():void {
    console.info('socketsInit()');
    let channel = 'ChatChannel';
    let zipCode = this.localStorage.get('chat_zip_code');
    console.log('[chat constructor] storage zip:', this.localStorage.get('chat_zip_code'));

    console.log('ng2cable link:', this.hostUrl + '/cable');
    if (this.ng2cable.subscription) {
      this.ng2cable.unsubscribe();
    }

    this.ng2cable.subscribe(this.hostUrl + '/cable', channel, {
      post_code: <number> zipCode
    });

    console.log('broadcaster:', this.broadcaster);
    this.broadcaster['_eventBus'].observers = [];
    this.broadcaster.on<any>(channel).subscribe(
    data => {
      console.log('[SOCKET] Message received:', data);
      let blacklist = this.localStorage.get('blacklist');
      let postOrNotToPostThatIsTheQuestion:boolean = true;
      if (blacklist && blacklist.length > 0) {
        for (let i = 0; i < blacklist.length; i ++) {
          if (data.message.user_id == blacklist[i].id) {
            console.warn('User', data.message.user.name, 'is blocked! What a looser');
            postOrNotToPostThatIsTheQuestion = false;
            break;
          }
        }
      }

      if (postOrNotToPostThatIsTheQuestion) {
        let insideUndercover = this.gps
        .calculateDistance({
          lat: <number> parseFloat(data.message.lat),
          lng: <number> parseFloat(data.message.lng)
        });
        if (this.getState() == 'undercover') {
          if (data.message.undercover && insideUndercover) {
            setTimeout(() => {
              this.events.publish('message:received', {
                messageReceived: true,
                runVideoService: data.message.video_urls.length > 0
              });
            }, 1);
            this.appendMessage(data, this.postMessages);
          }
        } else if (this.getState() != 'undercover' && !data.message.undercover &&
                   this.user.id != data.message.user_id)
          this.appendMessage(data, this.postMessages);
      }
    }, err => console.error('[SOCKET] Message error:', err));
  }

  public getBlacklist():any {
    let mess = this.api.get('blacklist').share();
    let messMap = mess.map(res => res.json());
    return messMap;
  }

  public sendNotification(data: any):any {
     let seq = this.api.post('messages/send_notifications', data).share();
     let notifyMap = seq.map(res => res.json());

     return notifyMap;
  }

  public sendMessage(data: any):any {
    return new Promise((resolve, reject) => {
		let params:any;
	    if(this.currentLobbyMessage != undefined && this.currentLobbyMessage.messageable_type == 'Room'){
			params = {
				message: data,
				post_code: this.localStorage.get('chat_zip_code'),
				reply_to_message_id: this.currentLobby.id
			};  
		}else{
			params = {
				message: data,
				post_code: this.localStorage.get('chat_zip_code'),
				room_id: this.currentLobby.id
			}; 
		}

	  params.message.network_id = this.getNetwork() ? this.getNetwork().id : null;
      params.message.lat = this.gps.coords.lat;
      params.message.lng = this.gps.coords.lng; 

      if (params.room_id) params.message.network_id = null;

      console.info('[sendMessage] params:', params);

      if (data.images && data.images.length > 0) {
        // this.tools.showLoader();
        this.sendMessageWithImage(params, data.images).then(res => {
          console.log('[sendMessageWithImage] res:', res);
          resolve(res);
        }).catch(err => reject(err));
      } else {
        this.sendMessageWithoutImage(params).subscribe(res => {
          console.log('SEND MESSAGE WITHOUT IMAGE');
          resolve(res);
        }, err => reject(err));
      }
    })
  }

  public lockMessage(lock:any):any {
    let seq = this.api.post('messages/lock', lock).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  
  public unlockRequest(data) {
    console.log('UNLOCK POST data:', data);
    let seq = this.api.post('messages/unlock', {
      id: data.id,
	  message:data.message,
	  status: data.status
    }).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }
  
  public unlockPost(data) {
    console.log('UNLOCK POST data:', data);
    let seq = this.api.post('messages/unlock', {
      id: data.id,
      password: data.password
    }).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  public getMessages(
    undercover: boolean,
    messageArray?: Array<any>,
    params?: any,
    doRefresh?: any
  ):any {

    let offset: number = messageArray && messageArray.length ? messageArray.length : 0;

    let data: any = {
      post_code: this.localStorage.get('chat_zip_code'),
      undercover: undercover ? undercover : false,
      is_distance_check: this.areaFilter,
      lat: this.gps.coords.lat,
      lng: this.gps.coords.lng,
      offset: offset,
      is_landing_page: this.isLandingPage ? this.isLandingPage : false,
      limit: 20
    };

    let messagesIds: Array<any> = [];
    for (let i in messageArray) {
      if (messageArray[i])
        messagesIds.push(messageArray[i].id);
    }

    if (data.undercover && !doRefresh) {
      data.offset = 0;
      //data.limit = offset == 0 ? 20 : offset;
      data.limit = 20;
      data.current_ids = [];
      //data.current_ids = messagesIds;
    }

    if (params) Object.assign(data, params);

    let seq = this.api.get('messages', data).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

    public getNearByMessages(
    messagesNearArray?: Array<any>,
    params?: any,
    doRefresh?: any
  ):any {

    let offset: number = messagesNearArray && messagesNearArray.length ? messagesNearArray.length : 0;

    let data: any = {
      post_code: this.localStorage.get('chat_zip_code'),
      undercover: false,
      is_distance_check: this.holdFilter,
      lat: this.gps.coords.lat,
      lng: this.gps.coords.lng,
      offset: offset,
      limit: 20
    };

    let messagesIds: Array<any> = [];
    for (let i in messagesNearArray) {
      if (messagesNearArray[i])
        messagesIds.push(messagesNearArray[i].id);
    }

    if (!doRefresh) {
      data.offset = 0;
      //data.limit = offset == 0 ? 20 : offset
      data.limit = 20
    }

    if (params) Object.assign(data, params);

    let seq = this.api.get('messages/nearby', data).share(); 
    let seqMap = seq.map(res => res.json());

    // console.log('===================================');

    return seqMap;
  }

  public getMessagesByUserId(params: any):any {
    let data: any = {
      limit: 20,
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

  public organizeMessages(data: any): any {
	let messages: Array<any> = [];
    for (let i in data) {
      data[i].date = moment(data[i].created_at).fromNow();
        if(messages.indexOf(data[i])==-1){
            messages.push(data[i]);
        }
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
              console.log('[getFileObject] params:', params);
              if (params) {
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
              }
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
    let pictures = this.cameraPrvd.takenPictures;
    if (pictures && pictures.length > 0) {
      this.events.publish('image:pushed', {
        picturesLen: pictures.length
      });

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

  public updateAppendLineContainer() {
        let pictures = this.cameraPrvd.takenPictures;
        if (pictures && pictures.length > 0) {
          this.events.publish('image:pushed', {
            picturesLen: pictures.length
          });

          this.plusBtn.setState('default');
          this.bgState.setState('compressed');
          for (let i = 0; i < this.chatBtns.state.length; i++) {
            this.chatBtns.state[i] = 'btnHidden';
          }
          this.postBtn.setState(true);
          this.appendLineContainer.show();
          this.appendLineContainer.setState('on_append');
          if (this.mainLineBtn.getState() != 'moved-n-scaled')
            this.mainLineBtn.setState('above_append');
        }
  }

  public openGallery() {
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
                  this.cameraPrvd.pushPhoto(fileUrl);
                  this.updateAppendContainer();
              } else {
                this.cameraPrvd.pushPhoto(fileUrl);
                this.updateAppendContainer();
              }
            }
          }
        }, err => {
          console.log('[imagePicker]', err);
        });
      }
  }


  public openLineGallery() {
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
                  this.cameraPrvd.pushPhoto(fileUrl);
                  this.updateAppendLineContainer();
              } else {
                this.cameraPrvd.pushPhoto(fileUrl);
                this.updateAppendLineContainer();
              }
            }
          }
        }, err => {
          console.log('[imagePicker]', err);
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

      this.mainBtn.setState('minimised');

      let image = messageData.image_urls.length > 0 ? messageData.image_urls[0] : null;

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

      let currentUser = this.authPrvd.getAuthData();
      if (!profileId) profileId = currentUser.id;
      let params = {
        id: profileId,
        public: profileTypePublic,
        currentUser: currentUser
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

  public scrollToTop():void {
    let scroll = document.querySelector('.scroll-content');
    if (scroll) scroll.scrollTop = 0;
    else console.warn('Unable to scroll to top: no scroll element found');
  }

  public scrollToBottom(content:any, params?:any):void {
    if (this.scrollTimer.interval) clearInterval(this.scrollTimer.interval);
    if (this.scrollTimer.timeout) clearTimeout(this.scrollTimer.timeout);
    this.scrollTimer.interval = setInterval(() => {
      // console.log('[scrollToBottom] loaded:', this.loadedImages + '/' + this.imagesToLoad);
      if (this.imagesToLoad == this.loadedImages || (params && params.forced)) {
        console.log('[SCROLLING TO BOTTOM]');
        content.scrollTo(0, content.getContentDimensions().scrollHeight, 100);
        setTimeout(() => {
          this.isMessagesVisible = true;
          // this.tools.hideLoader();
        }, 150);
        clearInterval(this.scrollTimer.interval);
      }
    }, 300);
    this.scrollTimer.timeout = setTimeout(() => {
      clearInterval(this.scrollTimer.interval);
    }, 10000);
  }

  public showMessages(messages:any, location: any, isUndercover?: boolean):Promise<any> {
	   console.log('[ChatPage][showMessages]');
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
    return new Promise((resolve, reject) => {
      loadMessages(arg).subscribe(data => {
        let receivedMessages:any;
        console.log('[ChatPage][showMessages] data:', data);
        if (!data) {
          this.tools.hideLoader();
          this.isMainBtnDisabled = false;
          reject();
          return;
        } else if (data && data.messages && data.messages.length > 0) {
          if (location == 'chat') receivedMessages = data.messages;
          else receivedMessages = data.messages.reverse();
          if (messages.length > 0) {
            resolve({
              messages: this.organizeMessages(receivedMessages),
              callback: (mess) => {
                this.calcTotalImages(mess);
                this.messageDateTimer.start(mess);
              }
            });
          } else {
            resolve({
              messages: this.organizeMessages(receivedMessages),
              callback: (mess) => {
                this.calcTotalImages(mess);
                this.messageDateTimer.start(mess);
              }
            });
          }
        } else {
          this.tools.hideLoader();
          if (data.messages.length == 0) reject('no messages');
          else reject('something went wrong');
        }
      }, err => {
        this.tools.hideLoader();
        this.isMainBtnDisabled = false;
        reject('something went wrong');
      });
    })
  }
  
  
  /*Fetch all networks nearby latLng with in 100Yards*/
  public getCustomAreaNetworks(params:any = null){	
    let offset = params && params.offset ? params.offset : 0;
    let limit = params && params.limit ? params.limit : 50;
	let data: any = {
      post_code: params.zipCode,
      lat: params.lat,
      lng: params.lng,
	  offset: offset,
	  limit: limit 
    };
	
	let seq = this.api.get('messages/nearby_search', data).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }
  
  /*Fetch single record wth unique message_id */
  public getMessageIDDetails(message_id:any):any {
	  // http://18.188.223.201:3000/api/v1/messages/584
      let mess = this.api.get('messages/' + message_id ).share();
      let messMap = mess.map(res => res.json());
      return messMap;
  }
  
  /*Fetch all replies for particular message*/
  public getAllMessageReplies(messageId:number){	
	//http://18.188.223.201:3000/api/v1/messages/768/reply/messages 
	// let offset : number = params.offset ? params.offset : 0;
	// let data: any = {
		// limit : 15, 
		// offset :  offset
	// }
	let seq = this.api.get('messages/'+messageId+'/reply/messages').share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }
  
}
