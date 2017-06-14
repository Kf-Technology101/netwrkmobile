import { Injectable } from '@angular/core';
import { AlertController, ToastController } from 'ionic-angular';
import { LocalStorage } from './local-storage';

@Injectable()
export class Debug {
    public coords:any = {
      lat: null,
      lng: null
    }

    constructor(
    private storage: LocalStorage,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  public showLocationSelect():void {
    let locationSelectAlert = this.alertCtrl.create({
      subTitle: 'Location history',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Enter custom data',
          handler: () => {
            this.showManualLocationAlert();
          }
        },
        {
          text: 'Submit',
          handler: data => {
            this.setCustomLocation(data);
          }
        }
      ]
    });

    let history = this.storage.get('location_history');
    if (history) {
      for (let i = 0; i < history.length; i++) {
        let coords:string = history[i].lat + ', ' + history[i].lng;
        locationSelectAlert.addInput(
          {
            type: 'radio',
            label: history[i].name,
            value: coords,
            checked: coords == this.getCoordString()
          }
        );
      }
    }

    locationSelectAlert.present();
  }

  public showManualLocationAlert():void {
    let customCoordsAlert = this.alertCtrl.create({
      subTitle: 'Input coordinates',
      inputs: [
        {
          type: 'number',
          placeholder: 'lat',
          name: 'lat'
        },
        {
          type: 'number',
          placeholder: 'lng',
          name: 'lng'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: data => {
            this.setCustomLocation(data);
          }
        }
      ]
    });
    customCoordsAlert.present();
  }

  private showToast(message:string, duration?:number) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: duration ? duration : 3000,
      position: 'top',
    });
    toast.present();
  }

  private parseCoordinates(coords:any):any {
    if (typeof coords === 'object') {
      return {
        lat: parseFloat(coords.lat),
        lng: parseFloat(coords.lng)
      }
    } else if (typeof coords === 'string') {
      return {
        lat: parseFloat(coords.split(', ')[0]),
        lng: parseFloat(coords.split(', ')[1])
      }
    }
  }

  public disableCustomLocation():void {
    if (this.isCustomCoordAvaliable()) {
      this.storage.rm('custom_coordinates');
      this.showToast('Current location successfully set');
    }
  }

  public isCustomCoordAvaliable():boolean {
    return this.storage.get('custom_coordinates') === null ? false : true;
  }

  public getCoordObject():any {
    if (this.isCustomCoordAvaliable())
      return this.storage.get('custom_coordinates');
  }

  public getCoordString():string {
    if (this.isCustomCoordAvaliable())
      return this.getCoordObject().lat + ', ' + this.getCoordObject().lng;
  }

  public saveCurrentLocation(newLocation:any):void {
    let locations:any = [];
    if (this.storage.get('location_history') !== null) {
      locations = this.storage.get('location_history');
      for (let i = 0; i < locations.length; i++) {
        if (newLocation.zip == locations[i].zip) {
          break;
        } else if (i == locations.length - 1) {
          if (locations.length == 5)
            locations.shift();
          locations.push(newLocation);
        }
      }
    } else {
      locations.push(newLocation);
    }
    this.storage.set('location_history', locations);
  }

  private setCustomLocation(data):void {
    if (data) {
      if (typeof data === 'object') {
        if (data.lat && data.lng) {
          this.coords = this.parseCoordinates(data);
        } else {
          this.showToast('All fields are required');
        }
      } else if (typeof data === 'string') {
        this.coords = this.parseCoordinates(data);
      }
      try {
        this.storage.set('custom_coordinates', this.coords);
        this.showToast('Custom location successfully set');
      } catch (err) {
        console.error(err);
      }
    }
    console.log('Coord parse result:', this.coords);
  }
}
