import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { LocalStorage } from './local-storage';
import 'rxjs/add/operator/map';

@Injectable()
export class Api {
  public httpProtocol: string = 'https://';
  private apiV: string = '/api/v1';
  // Local
 /*  public domain: any = {
   local: '192.168.0.77:3000', // default :3000
   remote: '192.168.0.77:3000' // 'netwrk.com'
  };  */
  
  // Production
  /* public domain: any = {
    local: '18.188.223.201:3000', // default :3000
    remote: '18.188.223.201:3000' // 'netwrk.com'
  }; */  
   
  public domain: any = {
    local: 'api.somvo.app', // default :3000
    remote: 'api.somvo.app' // 'netwrk.com'
  };   
  
  public siteDomain: string = this.domain.local;
  public hostUrl = this.httpProtocol + this.siteDomain;
  public url: string = this.hostUrl + this.apiV;

  // Network connect/disconnect
  private disconnectSubscription:any;
  private connectSubscription:any;

  constructor(
    public http: Http,
    public storage: LocalStorage
  ) {}

  public checkAuthStatus():any {
    let mess = this.get('sessions/check').share();
    let messMap = mess.map(res => res.json());
    return messMap;
  }

  public unsubscribeConnect():void {
    if (this.connectSubscription) {
      this.connectSubscription.unsubscribe();
    }
  }

  public unsubscribeDisconnect():void {
    if (this.disconnectSubscription) {
      this.disconnectSubscription.unsubscribe();
    }
  }

  public changeApiUrl(url: string) {
    this.siteDomain = url == this.domain.remote
      ? this.domain.local
      : this.domain.remote;
    this.hostUrl = this.httpProtocol + this.siteDomain;
    this.url = this.hostUrl + this.apiV;
  }

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
  
  postInstagram(endpoint: string, body: any, options?: RequestOptions) {
    options = [];
    return this.http.post(endpoint, body, options);
  }
  
  put(endpoint: string, body: any, options?: RequestOptions) {
    options = this.createAuthorizationHeader(options);
    return this.http.put(this.url + '/' + endpoint, body, options);
  }

  delete(endpoint: string, options?: RequestOptions) {
    options = this.createAuthorizationHeader(options);
    if (options)
      return this.http.delete(this.url + '/' + endpoint, options);
    else
      return this.http.delete(this.url + '/' + endpoint);
  }

  patch(endpoint: string, body: any, options?: RequestOptions) {
    options = this.createAuthorizationHeader(options);
    return this.http.patch(this.url + '/' + endpoint, body, options);
  }

  public createFormData(object: Object, form?: FormData, namespace?: string): FormData {
    const formData = form || new FormData();
    for (let property in object) {
      let value = object[property];
      if (!object.hasOwnProperty(property) || value === null || value === undefined) {
        // console.warn('object.' + property + ':', value);
        continue;
      }
      const formKey = namespace ? `${namespace}[${property}]` : property;
      // console.log('[createFormData] formKey:', formKey, ' value:', value);
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
