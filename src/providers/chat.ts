import { Injectable } from '@angular/core';

import { LocalStorage } from './local-storage';
import { Gps } from './gps';
import { Api } from './api';
import { Tools } from './tools';

import * as moment from 'moment';

// Gallery
import { ImagePicker } from 'ionic-native';
import { Camera } from '../providers/camera';

// File transfer
import { File } from '@ionic-native/file';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';

@Injectable()
export class Chat {
  public users: any = {};
  private message: any = null;

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
  }

  public setState(state: string) {
    this.localStorage.set('chat_state', state);
  }

  public getState(): string {
    let state = this.localStorage.get('chat_state');
    let result = state ? state : 'undercover';
    return result;
  }

  public setZipCode(zipCode: any) {
    this.localStorage.set('chat_zip_code', zipCode);
  }

  public chatZipCode(): number {
    let chatZipCode = this.localStorage.get('chat_zip_code');
    console.log(chatZipCode);
    let result = chatZipCode ? chatZipCode : 0;
    console.log(result);
    return result;
  }

  public sendMessage(data: any): any {
    let params = {
      text: data.text,
      user_id: data.user_id,
      network_id: this.getNetwork() ? this.getNetwork().id : null,
      lat: this.gps.coords.lat,
      lng: this.gps.coords.lng,
      undercover: data.undercover,
      images: data.images,
    };

    if (data.images && data.images.length > 0) {
      this.sendMessageWithImage(params);
    } else {
      this.sendMessageWithoutImage(params);
    }

    return null;
  }

  public getMessages(undercover: boolean) {
    let data = {
      post_code: this.gps.zipCode,
      undercover: undercover,
      lat: this.gps.coords.lat,
      lng: this.gps.coords.lng,
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
    if (users.length)
      for (let i = 0; i < users.length; i++)
        stUsers[users[i].id] = users[i];
    this.users = stUsers;
  }

  public organizeMessages(data: any): any {
    let messages: Array<any> = [];
    for (let i in data) {
      console.log('moment().isValid():', moment(data[i].created_at).isValid());
      data[i].date = moment(data[i].created_at).fromNow();
      messages.push(data[i]);
    }
    return messages;
  }

  private getNetwork(): any {
    return this.localStorage.get('current_network');
  }

  private sendMessageWithImage(data: any) {
    const fileTransfer: TransferObject = this.transfer.create();
    let url = this.api.url + '/messages';
    let options: FileUploadOptions = {};

    let uploadImage = (i?: number) => {
      if (!i) {
        i = 0;
        options = {
          params: data,
          headers: {
            Authorization: this.localStorage.get('auth_data').auth_token
          }
        }
      } else {
        data.id = this.message.id;
        options = {
          params: data,
          headers: {
            Authorization: this.localStorage.get('auth_data').auth_token
          },
          httpMethod: 'PUT'
        }
      }

      let splitImageUrl = data.images[0].split('/');
      let fileName: string = splitImageUrl[splitImageUrl.length - 1];
      splitImageUrl.splice(-1, 1);
      let path = splitImageUrl.join('/');
      console.log(path);

      fileTransfer.upload(data.images[i], url, options).then(res => {
        console.log('res:', res);
        if (i == 0) this.message = res;
        // console.log(i, data.images[i].length)
        if (i == data.images[i].length - 1) {
          console.log(this.message);
        } else {
          i++;
          uploadImage(i);
        }
      }).catch(err => {
        console.log('err:', err);
      });
    }

    uploadImage();

    fileTransfer.abort();
  }

  private sendMessageWithoutImage(data: any) {
    let seq = this.api.post('messages', {
      text: data.text,
      user_id: data.user_id,
      network_id: this.getNetwork() ? this.getNetwork().id : null,
      lat: this.gps.coords.lat,
      lng: this.gps.coords.lng,
      undercover: data.undercover,
    }).share();
    let seqMap = seq.map(res => res.json());

    return seqMap;
  }

  public openGallery(appendedImages): void {
    let options = {
      maximumImagesCount: 3 - appendedImages,
      width: 500,
      height: 500,
      quality: 75
    }

    if (options.maximumImagesCount <= 0) {
      this.tools.showToast('You can\'t append more pictures');
    } else {
      ImagePicker.getPictures(options).then(
        file_uris => {
          for (let i = 0; i < file_uris.length; i++) {
            this.cameraPrvd.takenPictures.push(file_uris[i]);
            console.log('[imagePicker] file_uris:', file_uris[i]);
          }
        },
        err => console.log('[imagePicker] err:', err)
      );
    }
  }

}
