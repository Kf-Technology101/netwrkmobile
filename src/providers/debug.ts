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
      subTitle: 'Choose location',
      inputs: [
        {
          type: 'radio',
          label: '325 Elm St, Elk Creek, CA 95939',
          value: '39.605070,-122.538187',
          checked: true
        },
        {
          type: 'radio',
          label: '3722 Landa, Ln Houston, TX 77023',
          value: '29.704706,-95.316038'
        },
        {
          type: 'radio',
          label: '799 3rd Ave S, Minneapolis, MN 55402',
          value: '44.974593,-93.268610'
        },
        {
          type: 'radio',
          label: '400 E M.L.K. Jr Blvd, Charlotte, NC 28202',
          value: '35.221287,-80.843427'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Set custom',
          handler: () => {
            this.showManualLocationAlert();
          }
        },
        {
          text: 'Confirm',
          handler: data => {
            this.setCustomLocation(data);
          }
        }
      ]
    });
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
        lat: parseFloat(coords.split(',')[0]),
        lng: parseFloat(coords.split(',')[1])
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
      return this.getCoordObject().lat + ',' + this.getCoordObject().lng;
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
