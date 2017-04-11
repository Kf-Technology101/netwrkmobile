import { Injectable } from '@angular/core';
import { Http, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';

import { Geolocation } from '@ionic-native/geolocation';

import { Api } from './api';

@Injectable()
export class Gps {
  public coords: any = {
    lat: null,
    lng: null
  }

  constructor(
    private http: Http,
    private geolocation: Geolocation,
    private api: Api
  ) {}

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
      this.geolocation.getCurrentPosition().then((resp) => {
        let url = 'http://maps.googleapis.com/maps/api/geocode/json';
        let seq = this.getAddressDetail(url, {
          latlng: resp.coords.latitude + ',' + resp.coords.longitude,
          sensor: true,
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
      }).catch((error) => {
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
    let zipCode = null;
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].address_components.length; j++) {
        for (let z = 0; z < data[i].address_components[j].types.length; z++) {
          if (data[i].address_components[j].types[z] == 'postal_code') {
            zipCode = data[i].address_components[j].long_name;
            break;
          }
        }
      }
    }

    return zipCode;
  }

}
