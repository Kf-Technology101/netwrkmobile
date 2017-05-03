import { Injectable } from '@angular/core';

import { Api } from './api';
import { Auth } from './auth';

@Injectable()
export class User {

  constructor(
    private api: Api,
    private auth: Auth
  ) {}

  public updateAvatar(id:number, files: File[], userData: any) {
    return new Promise((resolve, reject) => {
      let xhr: XMLHttpRequest = new XMLHttpRequest();

      let formData = this.api.createFormData(userData);
      formData.append('user[avatar]', files[0], files[0].name);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            let res = JSON.parse(xhr.response);
            this.auth.saveAuthData(res, 'email');
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

  public getFacebookFriendProfile(friendId) {
    let seq = this.api.get(
      'profiles/user_by_provider',
      { provider_id: friendId })
      .share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  public update(id: number, accountInfo: any, type?: string) {
    let seq = this.api.patch(`registrations/${id}`, accountInfo).share();
    seq.map(res => res.json()).subscribe(
      res => {
        console.log(res);
        let authType = type ? type : 'email';
        this.auth.saveAuthData(res, authType);
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

  public errorHandler(error) {
    
  }
}
