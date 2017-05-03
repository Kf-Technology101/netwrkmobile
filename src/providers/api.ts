import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { LocalStorage } from './local-storage';
import 'rxjs/add/operator/map';

@Injectable()
export class Api {
  private httpProtocol: string = 'http://';
  public siteDomain: string = '34.208.20.67'; //192.168.1.13:3000 //34.208.20.67
  public hostUrl = this.httpProtocol + this.siteDomain;
  public url: string = this.hostUrl + '/api/v1';

  constructor(
    public http: Http,
    public storage: LocalStorage
  ) {}

  createAuthorizationHeader(options: RequestOptions): RequestOptions {
    if (!options) {
      options = new RequestOptions();
    }

    let headers = new Headers();
    if (this.storage.get('auth_data')) {
      headers.append('Authorization', this.storage.get('auth_data').auth_token);
      options.headers = headers;
    }

    return options;
  }

  get(endpoint: string, params?: any, options?: RequestOptions) {
    if (!options) { options = new RequestOptions(); }

    // Support easy query params for GET requests
    if (params) {
      let p = new URLSearchParams();
      for(let k in params) {
        p.set(k, params[k]);
      }
      // Set the search field if we have params and don't already have
      // a search field set in options.
      options.search = !options.search && p || options.search;
    }

    options = this.createAuthorizationHeader(options);

    let res = this.http.get(this.url + '/' + endpoint, options);

    return res;
  }

  post(endpoint: string, body: any, options?: RequestOptions) {
    options = this.createAuthorizationHeader(options);
    return this.http.post(this.url + '/' + endpoint, body, options);
  }

  put(endpoint: string, body: any, options?: RequestOptions) {
    options = this.createAuthorizationHeader(options);
    return this.http.put(this.url + '/' + endpoint, body, options);
  }

  delete(endpoint: string, body: any, options?: RequestOptions) {
    options = this.createAuthorizationHeader(options);
    return this.http.post(this.url + '/' + endpoint, body, options);
  }

  patch(endpoint: string, body: any, options?: RequestOptions) {
    options = this.createAuthorizationHeader(options);
    return this.http.patch(this.url + '/' + endpoint, body, options);
  }

  public createFormData(object: Object, form?: FormData, namespace?: string): FormData {
    const formData = form || new FormData();
    for (let property in object) {
      let value = object[property];
      if (!object.hasOwnProperty(property) || !value) {
        continue;
      }
      const formKey = namespace ? `${namespace}[${property}]` : property;
      if (value instanceof Date) {
        formData.append(formKey, value.toISOString());
      } else if (typeof value === 'object' && !(value instanceof File)) {
        this.createFormData(value, formData, formKey);
      } else {
        formData.append(formKey, value);
      }
    }
    return formData;
  }

}
