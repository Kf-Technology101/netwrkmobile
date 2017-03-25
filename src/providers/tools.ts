import { Injectable } from '@angular/core';
import { Http, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';

import {
  Events,
  ToastController,
  LoadingController
} from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

import { ContactsProvider } from './contacts';
import { Api } from './api';
import { User } from './user';

@Injectable()
export class Tools {
  private toast: any;
  private loader: any;

  constructor(
    public http: Http,
    public events: Events,
    public contactsPrvd: ContactsProvider,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public api: Api,
    public user: User,
    private geolocation: Geolocation
  ) {}

  getMyZipCode() {
    return new Promise((resolve, reject) => {
      this.geolocation.getCurrentPosition().then((resp) => {
        let url = 'http://maps.googleapis.com/maps/api/geocode/json';
        let seq = this.getAddressDetail(url, {
          latlng: resp.coords.latitude + ',' + resp.coords.longitude,
          sensor: true,
        }).share();
        seq.map(res => res.json()).subscribe(
          res => {
            let zipCode: string = this.parseGoogleAddress(res.results);
            resolve(zipCode);
          },
          err => reject(err)
        );
      }).catch((error) => {
        reject(error);
      });
    });
  }

  getAddressDetail(url: string, params?: any, options?: RequestOptions) {
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

  parseGoogleAddress(data: any): string {
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

  doBackButton(page: string, callback: any) {
    this.events.unsubscribe('backButton:clicked');
    this.events.subscribe('backButton:clicked', () => {
      callback(page);
    });
  }

  getLoginPage(HomePage, SignUpContactListPage) {
    return new Promise((resolve, reject) => {
      let userData = this.user.getAuthData();
      userData.invitation_sent ? resolve(HomePage) : resolve(SignUpContactListPage);
    });
  }

  showToast(message: string, duration: number = 3000, position: string = 'top') {
    this.toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });
    this.toast.present();
  }

  showLoader() {
    this.loader = this.loadingCtrl.create({
      content: "Please wait..."
    });

    this.loader.present();
  }

  hideLoader() {
    this.loader.dismiss();
  }

}
