import { Injectable } from '@angular/core';

import { Api } from './api';
import { Auth } from './auth';
import { LocalStorage } from './local-storage';

@Injectable()
export class User {

  constructor(
    private api: Api,
	public localStorage: LocalStorage,
    private auth: Auth
  ) {}

  public updateAvatar(id:number, files: File[], userData?: any, fieldName?: string) {
    return new Promise((resolve, reject) => {
      let xhr: XMLHttpRequest = new XMLHttpRequest();

      let formData = this.api.createFormData(userData);
      formData.append(`user[${fieldName}]`, files[0], files[0].name);
      formData.append('type', 'update');

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            let res = JSON.parse(xhr.response);
            this.auth.saveAuthData(res);
            resolve(res);
          } else {
            reject(xhr.response);
          }
        }
      };

      xhr.open('PUT', `${this.api.url}/registrations/${id}`, true);
      xhr.send(formData);
    });
  }
  
  
  public updateProfileNameAvatar(id:any, files: any, data?: any, fieldName?: string) {
    return new Promise((resolve, reject) => {
      let xhr: XMLHttpRequest = new XMLHttpRequest();
      let formData = this.api.createFormData(null);
      formData.append(`user[${fieldName}]`, files[0], files[0].name);
      formData.append(`user[name]`, data.name);
      formData.append('type', 'update');

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            let res = JSON.parse(xhr.response);
            resolve(res);
          } else {
            reject(xhr.response);
          }
        }
      };

      xhr.open('PUT', `${this.api.url}/registrations/${id}`, true);
	  xhr.setRequestHeader('Authorization', this.localStorage.get('auth_data').auth_token);
      xhr.send(formData);
    });
  }
  

  public getFacebookFriendProfile(friendId) {
    let seq = this.api.get(
      'profiles/user_by_provider',
      { provider_id: friendId })
      .share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  public update(id:number, accountInfo:any, type?:string, operationType?:string) {
	  console.log(accountInfo);
    let userOnly = accountInfo.user;
    let seq = this.api.patch(`registrations/${id}`, {
      user: userOnly,
      type: operationType ? operationType : 'login'
    }).share();
    seq.map(res => res.json()).subscribe(
      res => {
          let authType:any = this.auth.getAuthType();
          let authData:any = this.auth.getAuthData();
          if (authType && authData) {
              let authType = type ? type : 'email';
              this.auth.saveAuthData(res, authType);
          }
      }, err => console.error('ERROR', err)
    );
    return seq;
  }

  public getUserData(id: number): any {
    let seq = this.api.get(`profiles/${id}`).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  public getUserId() {
    return this.auth.getAuthData().id;
  }
}
