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
  public appendContainer: any = {
    state: 'off',
    hidden: true
  }
  public mainBtn: any = {
    state: 'normal',
    hidden: false
  }
  private pickerOptions = {
    maximumImagesCount: 3 - this.cameraPrvd.takenPictures.length
  }
  public hostUrl: string;

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
      message: {
        text: data.text,
        user_id: data.user_id,
        network_id: this.getNetwork() ? this.getNetwork().id : null,
        lat: this.gps.coords.lat,
        lng: this.gps.coords.lng,
        undercover: data.undercover,
        // images: data.images,
      }
    };

    let files = [];
    let images: Array<string> = [];
    for (let i of data.images) {
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
    let api = this.api;
    let formD = this;
    let r = (i) => {
      getFileObject(images[i], function (fileObject) {
        files.push(fileObject);
           console.log(fileObject);
           i++;
           if (i == images.length) {
             console.log('end', files);

             let formData: FormData = new FormData(),
             xhr: XMLHttpRequest = new XMLHttpRequest();

             console.log(files);

             // for (let i = 0; i < files.length; i++) {
               // for (let u in userData) {
                 // formData.append('user', JSON.stringify(userData));
               // }
             // }

             let fd = formD.createFormData(params);
            for (let i in files) {
              fd.append('images[]', files[i], files[i].name);
            }

            console.log(fd)


             xhr.onreadystatechange = () => {
               if (xhr.readyState === 4) {
                 if (xhr.status === 200) {
                   console.log(JSON.parse(xhr.response));
                 } else {
                   console.log(xhr.response);
                 }
               }
             };

             xhr.upload.onprogress = (event) => {

             };

             xhr.open('POST', api.url + '/messages', true);
             xhr.setRequestHeader('Authorization', formD.localStorage.get('auth_data').auth_token);
             xhr.send(fd);

           } else {
             r(i);
           }
      });
    }
    r(i);

    // if (data.images && data.images.length > 0) {
    //   this.sendMessageWithImage(params);
    // } else {
    //   this.sendMessageWithoutImage(params);
    // }

    return null;
  }

  private createFormData(object: Object, form?: FormData, namespace?: string): FormData {
    const formData = form || new FormData();
    for (let property in object) {
      if (!object.hasOwnProperty(property) || !object[property]) {
        continue;
      }
      const formKey = namespace ? `${namespace}[${property}]` : property;
      if (object[property] instanceof Date) {
        formData.append(formKey, object[property].toISOString());
      } else if (typeof object[property] === 'object' && !(object[property] instanceof File)) {
        this.createFormData(object[property], formData, formKey);
      } else {
        formData.append(formKey, object[property]);
      }
    }
    return formData;
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

    let uploadImage = (i: number) => {
      console.log(i);
      if (i == 0) {
        options = {
          fileKey: 'image',
          params: {
            message: data
          },
          headers: {
            Authorization: this.localStorage.get('auth_data').auth_token
          },
          httpMethod: 'POST'
        }
      } else {
        options = {
          fileKey: 'image',
          params: {
            id: this.message.id,
          },
          headers: {
            Authorization: this.localStorage.get('auth_data').auth_token
          },
          httpMethod: 'PUT'
        }
      }

      console.log(i, options);

      fileTransfer.upload(data.images[i], url, options).then(res => {
        console.log('res:', res);
        if (i == 0) this.message = res;
        // console.log(i, data.images[i].length)
        if (i == data.images[i].length - 1) {
          console.log(this.message);
          fileTransfer.abort();
        } else {
          i++;
          uploadImage(i);
        }
      }).catch(err => {
        console.log('err:', err);
      });
    }

    console.log('uploadImage');
    uploadImage(0);
    console.log('uploadImage');
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

  public updateAppendContainer(): void {
    console.log("[chatPrvd] updateAppendContainer()...");
    if (this.cameraPrvd.takenPictures && this.cameraPrvd.takenPictures.length > 0) {
      this.appendContainer.hidden = false;
      this.appendContainer.state = 'on_append';
      this.mainBtn.state = 'above_append';
    }
  }

  public openGallery(): void {
    let pickerOptions = {
      maximumImagesCount: 3 - this.cameraPrvd.takenPictures.length
    }
    if (pickerOptions.maximumImagesCount <= 0) {
      // this.tools.showToast('You can\'t append more pictures');
    } else {
      console.log('[imagePicker] takenPictures:', this.cameraPrvd.takenPictures);
      console.log('[imagePicker] pickerOptions:', pickerOptions);
      ImagePicker.getPictures(pickerOptions).then(
        file_uris => {
          console.log('[imagePicker] file_uris:', file_uris);
          for (let i = 0; i < file_uris.length; i++) {
            this.cameraPrvd.takenPictures.push(file_uris[i]);
            console.log('[imagePicker] file_uris:', file_uris[i]);
          }
          this.updateAppendContainer();
        },
        err => console.log('[imagePicker] err:', err)
      );
    }
  }

}
