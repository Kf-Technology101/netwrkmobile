import { Injectable } from '@angular/core';
import { AlertController, ToastController } from 'ionic-angular';
import { LocalStorage } from './local-storage';

@Injectable()
export class Settings {
    public ucCameraState: string;

    constructor(
    private storage: LocalStorage,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  public toggleCameraOnUC():void {
    if (this.storage.get('enable_uc_camera') !== null) {
      let camOpt:boolean = this.storage.get('enable_uc_camera');
      this.storage.set('enable_uc_camera', !camOpt);
    } else {
      this.storage.set('enable_uc_camera', false);
    }
    this.ucCameraState = this.getUCCameraState();
  }

  public getUCCameraState():string {
    let camState:any = this.storage.get('enable_uc_camera');
    if (camState !== null) return camState ? 'On' : 'Off';
    else return 'On';
  }
}
