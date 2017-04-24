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
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';

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
        profile_type: data.profile_type
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
                } else {
                  console.log(xhr.response);
                }
              }
            };

            xhr.open('POST', self.api.url + '/messages', true);
            xhr.setRequestHeader('Authorization', self.localStorage.get('auth_data').auth_token);
            xhr.send(formData);

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
      for (let u in data[i].image_urls) {
        data[i].image_urls[u] += this.api.hostUrl;
      }
      data[i].date = moment(data[i].created_at).fromNow();
      console.log(data);
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
      ImagePicker.getPictures(pickerOptions).then(
        file_uris => {
          // console.log('[imagePicker] file_uris:', file_uris);
          for (let i = 0; i < file_uris.length; i++) {
            this.cameraPrvd.takenPictures.push(file_uris[i]);
            // console.log('[imagePicker] file_uris:', file_uris[i]);
          }
          this.updateAppendContainer();
        },
        err => console.log('[imagePicker] err:', err)
      );
    }
  }

}
