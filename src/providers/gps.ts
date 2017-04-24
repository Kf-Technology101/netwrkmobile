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
  public zipCode: string = null;
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
  ) {
    if (this.platform.is('cordova')) {
      this.watchPosition();
    }
  }

  getNetwrk(zipCode: string): any {
    let seq = this.api.get('networks', { post_code: zipCode }).share();
    seq.map(res => res.json()).subscribe(
      res => {
        console.log(res)
      }, err => console.error('ERROR', err)
    );

    return seq;
  }

  getMyZipCode() {
    return new Promise((resolve, reject) => {
      this.geolocation.getCurrentPosition().then(resp => {
        if (resp.coords) {
          let url = 'https://maps.googleapis.com/maps/api/geocode/json';
          let seq = this.getAddressDetail(url, {
            latlng: resp.coords.latitude + ',' + resp.coords.longitude,
            sensor: true,
            key: 'AIzaSyDcv5mevdUEdXU4c4XqmRLS3_QPH2G9CFY',
          }).share();
          this.coords.lat = resp.coords.latitude;
          this.coords.lng = resp.coords.longitude;
          seq.map(res => res.json()).subscribe(
            res => {
              let zipCode: string = this.parseGoogleAddress(res.results);
              resolve({ zip_code: zipCode });
            },
            err => reject(err)
          );
        }
      }).catch(error => {
        reject(error);
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

  private parseGoogleAddress(data: any): string {
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
      if (parseInt(currentZip) != parseInt(this.zipCode)) {
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
                  this.watchPosition();
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
                  this.watchPosition();
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

  private watchPosition() {
    let options: GeolocationOptions = {
      timeout: 60000,
      // enableHighAccuracy: true,
      // maximumAge: 11000,
    }

    // this.watch = this.geolocation.watchPosition(options).subscribe(resp => {
    //   console.log(resp)
    //   if (resp.coords) {
    //     let url = 'https://maps.googleapis.com/maps/api/geocode/json';
    //     let seq = this.getAddressDetail(url, {
    //       latlng: resp.coords.latitude + ',' + resp.coords.longitude,
    //       sensor: true,
    //       key: 'AIzaSyDcv5mevdUEdXU4c4XqmRLS3_QPH2G9CFY',
    //     }).share();
    //     this.coords.lat = resp.coords.latitude;
    //     this.coords.lng = resp.coords.longitude;
    //     seq.map(res => res.json()).subscribe(
    //       res => {
    //         this.parseGoogleAddress(res.results);
    //         this.compareZip();
    //       },
    //       err => console.log(err)
    //     );
    //   }
    // });
  }

}
