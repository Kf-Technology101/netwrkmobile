import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { LocalStorage } from './local-storage';
import { Network } from '@ionic-native/network';
import 'rxjs/add/operator/map';

@Injectable()
export class Api {
  public httpProtocol: string = 'http://';
  private apiV: string = '/api/v1';
  public domain: any = {
    local: '192.168.1.13:2998', // default :3000
    remote: '34.208.20.67' /*'netwrk.com'*/
  };
  public siteDomain: string = this.domain.local;
  public hostUrl = this.httpProtocol + this.siteDomain;
  public url: string = this.hostUrl + this.apiV;

  // Network connect/disconnect
  private disconnectSubscription:any;
  private connectSubscription:any;

  constructor(
    public http: Http,
    public storage: LocalStorage,
    private network: Network
  ) {}

  public watchForConnect():void {
    // this.unsubscribeConnect();
    this.connectSubscription = this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      setTimeout(() => {
        if (this.network.type === 'wifi') {
          console.log('we got a wifi connection, woohoo!');
        }
      }, 3000);
    }, err => {
      console.error('connect subscribe err:', err);
    });
  }

  public watchForDisconnect():void {
    // this.unsubscribeDisconnect();
    this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      console.log('network was disconnected :-(');
    }, err => {
      console.error('disconnect subscribe err:', err);
    });
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
      if (!object.hasOwnProperty(property) || value === null || value === undefined) {
        console.warn('object.' + property + ':', value);
        continue;
      }
      const formKey = namespace ? `${namespace}[${property}]` : property;
      console.log('[createFormData] formKey:', formKey, ' value:', value);
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
