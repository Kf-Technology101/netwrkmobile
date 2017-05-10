import { Injectable } from '@angular/core';
import { Http, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';

import { App, AlertController, Platform } from 'ionic-angular';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation';

import { Api } from './api';
import { LocalStorage } from './local-storage';

import { NetworkFindPage } from '../pages/network-find/network-find';

@Injectable()
export class Gps {
  public coords: any = {
    lat: <number> null,
    lng: <number> null
  };
  public zipCode: number = null;
  private watch: any;
  public changeZipCallback: (params?: any) => void;

  constructor(
    public app: App,
    private http: Http,
    private geolocation: Geolocation,
    private api: Api,
    private localStorage: LocalStorage,
    private platform: Platform,
    private alertCtrl: AlertController
  ) {}

  getNetwrk(zipCode: number): any {
    let seq = this.api.get('networks', { post_code: zipCode }).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  public getMyZipCode(): Promise<any> {
    return new Promise((resolve, reject) => {

      let options: GeolocationOptions = {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 3000,
      }

      if (this.watch) {
        this.coords.lat = null;
        this.coords.lng = null;
        this.watch.unsubscribe();
      }

      this.watch = this.geolocation.watchPosition(options).subscribe(resp => {
        // console.log('[Gps][getMyZipCode]', resp);
        if (resp.coords) {
          if (!this.coords.lat && !this.coords.lng) {
            this.coords.lat = resp.coords.latitude;
            this.coords.lng = resp.coords.longitude;
            this.getZipCode().then(zip => {
              resolve({ zip_code: zip });
            }).catch(err => reject(err));
            let zipInterval = setInterval(() => {
              this.getZipCode();
            }, 60000);
          } else {
            this.coords.lat = resp.coords.latitude;
            this.coords.lng = resp.coords.longitude;
          }
        }
      }, err => {
        console.log('[Gps][getMyZipCode]', err);
        reject(err);
      });
    });
  }

  private getAddressDetail(url: string, params?: any, options?: RequestOptions) {
    if (!options) { options = new RequestOptions(); }

    if (params) {
      let p = new URLSearchParams();
      for(let k in params) {
        p.set(k, params[k]);
      }
      options.search = !options.search && p || options.search;
    }

    return this.http.get(url, options);
  }

  private parseGoogleAddress(data: any): number {
    for (let i = 0; i < data.length; i++)
      for (let j = 0; j < data[i].address_components.length; j++)
        for (let z = 0; z < data[i].address_components[j].types.length; z++)
          if (data[i].address_components[j].types[z] == 'postal_code') {
            this.zipCode = data[i].address_components[j].long_name;
            break;
          }

    return this.zipCode;
  }

  private compareZip() {
    let nav = this.app.getActiveNav();
    let activeNav = nav.getActive();
    if (nav && activeNav && activeNav.name == 'ChatPage' && !activeNav.instance.isUndercover) {
      let network = this.localStorage.get('current_network');
      let currentZip = network ? network.post_code : 0;
      if (currentZip != this.zipCode) {
        this.localStorage.rm('current_network');
        let alert = this.alertCtrl.create({
          title: 'Warning',
          message: 'You left the Netwrk area, please join to other netwrk or go to Undercover',
          buttons: [
            {
              text: 'Go Undercover',
              handler: () => {
                let alertDismiss = alert.dismiss();
                alertDismiss.then(() => {
                  if (this.changeZipCallback) this.changeZipCallback({
                    undercover: true
                  });
                });
                return false;
              }
            },
            {
              text: 'Join',
              handler: () => {
                let alertDismiss = alert.dismiss();
                alertDismiss.then(() => {
                  nav.push(NetworkFindPage, null, { animate: false })
                });
                return false;
              }
            }
          ]
        });

        alert.present();
        this.watch.unsubscribe();
      }
    }
  }

  private getZipCode(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.coords.lat && this.coords.lng) {
        let url = 'https://maps.googleapis.com/maps/api/geocode/json';
        let seq = this.getAddressDetail(url, {
          latlng: this.coords.lat + ',' + this.coords.lng,
          sensor: true,
          key: 'AIzaSyDEdwj5kpfPdZCAyXe9ydsdG5azFsBCVjw'// 'AIzaSyDcv5mevdUEdXU4c4XqmRLS3_QPH2G9CFY',
        }).share();
        seq.map(res => res.json()).subscribe(res => {
          let zipCode: number = this.parseGoogleAddress(res.results);
          console.log('[Gps][getZipCode]', this.zipCode);
          resolve(zipCode);
        },
        err => {
          console.log('[Gps][getZipCode]', err);
          reject(err);
        });
      }
    });
  }

}
