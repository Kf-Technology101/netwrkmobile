import { Injectable } from '@angular/core';

import { Api } from './api';
import { Auth } from './auth';

@Injectable()
export class User {

  constructor(
    public api: Api,
    public auth: Auth
  ) {}

  public updateAvatar(id, files: File[], userData) {
    return new Promise((resolve, reject) => {
      let formData: FormData = new FormData(),
      xhr: XMLHttpRequest = new XMLHttpRequest();

      console.log(files);

      // for (let i = 0; i < files.length; i++) {
        // for (let u in userData) {
          // formData.append('user', JSON.stringify(userData));
        // }
      // }

      let fd = this.createFormData(userData);
      fd.append('user[avatar]', files[0], files[0].name);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(xhr.response);
          }
        }
      };

      xhr.upload.onprogress = (event) => {

      };

      xhr.open('PUT', this.api.url + '/registrations/' + id, true);
      xhr.send(fd);
    });
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

  public update(id: number, accountInfo: any, type?: string) {
    let seq = this.api.patch('registrations/' + id, accountInfo).share();
    seq.map(res => res.json()).subscribe(
      res => {
        console.log(res);
        if (type === 'fb') {
          this.auth.fbResponseData = null;
          this.auth.saveAuthData(res, 'facebook');
        }
      }, err => console.error('ERROR', err)
    );

    return seq;
  }

  public getUserData(id: number): any {
    let seq = this.api.get('profiles/' + id).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }
}
