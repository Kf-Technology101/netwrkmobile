import { Injectable } from '@angular/core';
import { Http, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';

import { App, AlertController, Platform, Events } from 'ionic-angular';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation';

import { Api } from './api';
import { LocalStorage } from './local-storage';
import { LocationChange } from './locationchange';

import { ChatPage } from '../pages/chat/chat';

@Injectable()
export class Gps {
  public coords: any = {
    lat: <number> null,
    lng: <number> null
  };
  public zipCode: number = null;
  public placeId:string;

  public changeZipCallback: (params?: any) => void;
  private watch: any;
  private maxDistance: number = 50;
  public zipInterval: any;
  public positionTruck: any;
  public map: any;

  constructor(
    public app: App,
    private http: Http,
    private geolocation: Geolocation,
    private api: Api,
    private localStorage: LocalStorage,
    private platform: Platform,
    private alertCtrl: AlertController,
    public events: Events,
    private loc: LocationChange
  ) {
    // console.log('GPS Provider');
  }

  public addUserToNetwork(zipCode: number):any{
    let seq = this.api.post('members', { post_code: zipCode }).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  public getNetwrk(zipCode: number): any {
    let seq = this.api.get('networks', { post_code: zipCode }).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  public createNetwrk(zipCode: number):any {
    let seq = this.api.post('networks', {
      network: {
        post_code: zipCode,
        google_place_id: this.localStorage.get('place_id')
      }
    }).share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  public calculateDistance(firstCoords: any, secondCoords?: any): boolean {
    if (!secondCoords) secondCoords = this.coords;
    // console.log('calculateDistance() firstCoords:', firstCoords);
    // console.log('calculateDistance() secondCoords:', secondCoords);
    let p: number = 0.017453292519943295; // Math.PI / 180
    let cos: any = Math.cos;
    let a = 0.5 - cos((secondCoords.lat - firstCoords.lat) * p) / 2 +
      cos(firstCoords.lat * p) *
      cos(secondCoords.lat * p) *
      (1 - cos((secondCoords.lng - firstCoords.lng) * p)) / 2;
    let sum = 12742 * Math.asin(Math.sqrt(a)); // R * 2; R = 6371 km
    let miles = sum * 0.621371192; // Kilometers to miles
    let yards = miles * 1760; // Miles to yards
    let result: boolean = yards <= this.maxDistance;

    return result;
  }

  public getMyZipCode(): Promise<any> {
    return new Promise((resolve, reject) => {

      let options: GeolocationOptions = {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 3000
      }

      if (this.watch) {
        this.coords.lat = null;
        this.coords.lng = null;
        this.watch.unsubscribe();
      }

      this.watch = this.geolocation.watchPosition(options).subscribe(resp => {
        console.log('[Gps][getMyZipCode]', resp);
        if (resp.coords) {
          if (!this.coords.lat && !this.coords.lng) {
            if (this.loc.isCustomCoordAvaliable()) {
              this.coords = this.loc.getCoordObject();
            } else {
              this.coords.lat = resp.coords.latitude;
              this.coords.lng = resp.coords.longitude;
            }
            this.getZipCode().then(zip => {
              resolve({ zip_code: zip });
            }).catch(err => reject(err));
            this.zipInterval = setInterval(() => {
              this.getZipCode();
            }, 60000);
          } else {
            if (this.loc.isCustomCoordAvaliable()) {
              this.coords = this.loc.getCoordObject();
            } else {
              this.coords.lat = resp.coords.latitude;
              this.coords.lng = resp.coords.longitude;
            }
            this.getZipCode().then(zip => {
                  resolve({ zip_code: zip });
            }).catch(err => reject(err));
          }
        } else reject();
      }, err => {
          this.getZipCode().then(zip => {
              resolve({ zip_code: zip });
          }).catch(err => reject(err));
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
    // let zip: number;
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].address_components.length; j++) {
        for (let z = 0; z < data[i].address_components[j].types.length; z++) {
          if (data[i].address_components[j].types[z] == 'postal_code') {
            this.zipCode = data[i].address_components[j].long_name;
            this.placeId = data[i].place_id;
            this.localStorage.set('place_id', this.placeId);
            break;
          }
        }
      }
    }
    return this.zipCode;
    // return zip;
  }

  public getGoogleAdress(lat?:number, lng?:number) {
    let coords;
    if (lat && lng) {
      coords = lat + ',' + lng;
    } else {
      coords = this.coords.lat + ',' + this.coords.lng;
    }

    if (this.loc.isCustomCoordAvaliable()) {
      coords = this.loc.getCoordString();
    }

    let url = 'https://maps.googleapis.com/maps/api/geocode/json';
    let seq = this.getAddressDetail(url, {
      latlng: coords,
      sensor: true,
      key: 'AIzaSyDEdwj5kpfPdZCAyXe9ydsdG5azFsBCVjw'// 'AIzaSyDcv5mevdUEdXU4c4XqmRLS3_QPH2G9CFY',
    }).share();
    return seq;
  }

  private getZipCode(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.coords.lat && this.coords.lng) {
        console.log('my lat:', this.coords.lat, 'my lng:', this.coords.lng);
        this.getGoogleAdress().map(res => res.json()).subscribe(res => {
          // console.log('[google addres] res:', res);
          // default:
          let zipCode: any = this.parseGoogleAddress(res.results);
          // debug:
          // let zipCode: number = this.localStorage.get('test_zip_code');

          this.loc.saveCurrentLocation({
            name:<string> res.results[0].formatted_address,
            lat:<number> this.coords.lat,
            lng:<number> this.coords.lng,
            zip:<number> zipCode
          });

          // console.log('zipCode:', zipCode);
          if (this.localStorage.get('chat_zip_code') === null) {
            this.localStorage.set('chat_zip_code', zipCode);
          }
          let nav = this.app.getActiveNav();
          if (nav.getActive() && zipCode != this.localStorage.get('chat_zip_code') &&
              this.localStorage.get('chat_zip_code') !== null) {
            // clearInterval(this.zipInterval);
            this.localStorage.rm('current_network');
            this.localStorage.set('chat_zip_code', zipCode);
            if (nav.getActive().name.toLowerCase() == 'chatpage' ||
                nav.getActive().name.toLowerCase() == 'networknopage') {
              this.localStorage.set('areaChange_triggered', true);
              nav.setRoot(ChatPage, {
                action_from_gps: this.localStorage.get('chat_state'),
                zipCode: zipCode
              });
            }
          }
          // console.log('[Gps][getZipCode] zipCode:', zipCode);
          resolve(zipCode);
        },
        err => {
          // console.log('[Gps][getZipCode]', err);
          reject(err);
        });
      }
    });
  }

}
