import { Injectable } from '@angular/core';
import { ModalController } from 'ionic-angular';

// Providers
import { LocalStorage } from './local-storage';
import { Api } from './api';

// Modals
import { BlacklistModal } from '../modals/blacklist/blacklist';
import { ArealistModal } from '../modals/arealist/arealist';


@Injectable()
export class Settings {
    public ucCameraState: string;
    public isNewlineScope=false;

    constructor(
    private storage: LocalStorage,
    private modalCtrl: ModalController,
    private api: Api
  ) {

    }


  public toggleCameraOnUC():void {
    if (this.storage.get('enable_uc_camera') !== null) {
      let camOpt:boolean = this.storage.get('enable_uc_camera');
      this.storage.set('enable_uc_camera', !camOpt);
    } else {
      this.storage.set('enable_uc_camera', true);
    }
    this.ucCameraState = this.getUCCameraState();
  }

  public getUCCameraState():string {
    let camState:any = this.storage.get('enable_uc_camera');
    if (camState !== null) return camState ? 'On' : 'Off';
    else return 'Off';
  }

  public showBlacklist():void {
    let blacklistModal = this.modalCtrl.create(BlacklistModal);
    blacklistModal.present();
  }

  public showArealist():void {
    let arealistModal = this.modalCtrl.create(ArealistModal);
    arealistModal.present();
  }

  public sendDeactivationRequest():any {

    let seq = this.api.delete('profiles').share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }
}
