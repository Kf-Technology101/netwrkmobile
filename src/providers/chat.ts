import { Injectable } from '@angular/core';

import { LocalStorage } from './local-storage';
import { Gps } from './gps';
import { Api } from './api';
import { Tools } from './tools';

import * as moment from 'moment';
import { Toggleable } from '../includes/toggleable';
import { MainButton } from '../includes/mainButton';

// Gallery
import { ImagePicker } from 'ionic-native';
import { Camera } from '../providers/camera';

// File transfer
import { File } from '@ionic-native/file';
import {
  Transfer,
  FileUploadOptions,
  TransferObject } from '@ionic-native/transfer';

@Injectable()
export class Chat {
  public users: any = {};
  private message: any = null;

  public appendContainer= new Toggleable('off', true);
  public mainBtn = new Toggleable('normal', false);
  public postBtn = new Toggleable(false);

  private pickerOptions = {
    maximumImagesCount: 3 - this.cameraPrvd.takenPictures.length
  }
  public hostUrl: string;

  private sounds:any = {
    message: new Audio('assets/sound/message.mp3')
  }

  constructor(
    public localStorage: LocalStorage,
    public api: Api,
    public gps: Gps,
    public tools: Tools,
    private file: File,
    private transfer: Transfer,
    public cameraPrvd: Camera
  ) {
    console.log('Hello Chat Provider');
    this.hostUrl = this.api.hostUrl;
  }

  public playSound(audioName) {
    if (this.sounds[audioName]) {
      this.sounds[audioName].play();
    } else {
      console.error('Error playing sound. audioName:', audioName);
    }
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
    this.localStorage.set('chat_zip_code', zipCode);
  }

  public chatZipCode(): number {
    let chatZipCode = this.localStorage.get('chat_zip_code');
    let result = chatZipCode ? chatZipCode : 0;
    return result;
  }

  public deleteMessages(idList) {
    let mess = this.api.post('messages/delete', { ids: idList }).share();
    let messMap = mess.map(res => res.json());
    return messMap;
  }

  public sendFeedbackData(link: string, data: any) {
    let feed = this.api.post(link, data).share();
    let feedMap = feed.map(res => res.json());
    return feedMap;
  }

  public sendMessage(data: any): any {
    return new Promise((resolve, reject) => {
      let params = { message: data };
      params.message.network_id = this.getNetwork() ? this.getNetwork().id : null;
      params.message.lat = this.gps.coords.lat;
      params.message.lng = this.gps.coords.lng;

      if (data.images && data.images.length > 0) {
        this.sendMessageWithImage(params, data.images).then(res => {
          console.log(res);
          resolve(res);
        }).catch(err => {
          console.log(err);
          reject(err);
        });
      } else {
        console.log('params', params);
        this.sendMessageWithoutImage(params).subscribe(res => {
          console.log(res);
          resolve(res);
        }, err => {
          console.log(err);
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

  public getMessages(undercover: boolean, messagesArray?: Array<any>) {
    let offset: number;
    if (messagesArray && messagesArray.length > 20) {
      offset = messagesArray.length + 1;
    } else {
      offset = 0;
    } 
    let data = {
      post_code: this.gps.zipCode,
      undercover: undercover,
      lat: this.gps.coords.lat,
      lng: this.gps.coords.lng,
      // offset: offset,
      limit: messagesArray.length + 20,
    };
    let seq = this.api.get('messages', data).share();
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
      for (let u in data[i].image_urls) {
        data[i].image_urls[u] = this.api.hostUrl + data[i].image_urls[u];
      }
      data[i].date = moment(data[i].created_at).fromNow();
      messages.push(data[i]);
    }
    return messages;
  }

  public getNetwork(): any {
    return this.localStorage.get('current_network');
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

      console.log(images);

      var getFileBlob = function (url, cb) {
        console.log(url, cb);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.addEventListener('load', function() {
          cb(xhr.response);
        });
        xhr.send();
      };

      var blobToFile = function (blob, name) {
        console.log(blob, name);
        blob.lastModifiedDate = new Date();
        blob.name = name;
        return blob;
      };

      var getFileObject = function(filePathOrUrl, cb) {
        console.log(filePathOrUrl, cb);
         getFileBlob(filePathOrUrl, function (blob) {
            cb(blobToFile(blob, filePathOrUrl.split('/').pop()));
         });
      };

      let i = 0;
      let self = this;
      let r = (i) => {
        getFileObject(images[i], function (fileObject) {
          files.push(fileObject);
            console.log(fileObject);
            i++;
            if (i == images.length) {
              console.log('end', files);
              let xhr: XMLHttpRequest = new XMLHttpRequest();

              let formData: FormData = self.api.createFormData(params);
              for (let i in files)
                formData.append('images[]', files[i], files[i].name);

              xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                  if (xhr.status === 200) {
                    console.log(JSON.parse(xhr.response));
                    resolve(JSON.parse(xhr.response));
                  } else {
                    console.log(xhr.response);
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
    console.log('data', data);
    let seq = this.api.post('messages', data).share();
    let seqMap = seq.map(res => res.json());

    return seqMap;
  }

  public updateAppendContainer(): void {
    console.log("[chatPrvd] updateAppendContainer()...");
    let pictures = this.cameraPrvd.takenPictures;
    if (pictures && pictures.length > 0) {
      this.appendContainer.show();
      this.appendContainer.setState('on_append');
      if (this.mainBtn.state != "moved-n-scaled")
        this.mainBtn.setState('above_append');
    }
  }

  public openGallery(): void {
    let pickerOptions = {
      maximumImagesCount: 3 - this.cameraPrvd.takenPictures.length
    }
    if (pickerOptions.maximumImagesCount <= 0) {
      // this.tools.showToast('You can\'t append more pictures');
    } else {
      ImagePicker.getPictures(pickerOptions).then(file_uris => {
        for (let fileUrl of file_uris) {
          if (fileUrl.indexOf('file:///') !== -1)
            this.cameraPrvd.takenPictures.push(fileUrl);
        }
        this.updateAppendContainer();
      }, err => console.log('[imagePicker] err:', err));
    }
  }

}
