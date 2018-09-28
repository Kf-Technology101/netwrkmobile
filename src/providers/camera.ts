import { Injectable } from '@angular/core';

import { CameraPreviewOptions, CameraPreview } from '@ionic-native/camera-preview';
import { LocalStorage } from './local-storage';

@Injectable()
export class Camera {
  public takenPictures: Array<string> = [];
  public cameraPreviewOpts: CameraPreviewOptions = {
    x: 0,
    y: 0,
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    camera: 'rear',
    tapPhoto: false,
    previewDrag: true,
    toBack: true,
    alpha: 1
  };

  constructor(
    public storage: LocalStorage,
    public cameraPreview: CameraPreview
  ) {
    this.cameraPreviewOpts.width = document.documentElement.clientWidth;
    this.cameraPreviewOpts.height = document.documentElement.clientHeight;
  }

  public getCameraOpt(options?: any): CameraPreviewOptions {
    for (let o in options) this.cameraPreviewOpts[o] = options[o];
    return this.cameraPreviewOpts;
  }

  private toggleCameraInstance(state:string):Promise<any> {
    return new Promise((succ, rej) => {
      if (state === 'show') {
        try {
          this.cameraPreview.startCamera(this.cameraPreviewOpts).then(res => succ(res)).catch(err => rej(err));
        } catch (error) {
          console.error('camera start catch err:', error);
          rej(error);
        }
      } else {
        try {
          this.cameraPreview.stopCamera()
          .then(res => succ(res)).catch(err => rej(err));
        } catch (error) {
          console.error('camera stop catch err:', error);
          rej(error);
        }
      }
    });
  }

  public pushPhoto(value:any) {
    this.takenPictures.push(value);
  }

  public toggleCameraBg(params?:any):void {
    let cOpt:any = this.storage.get('enable_uc_camera');
    if (params.isCamera || cOpt == true) {
      try {
        this.toggleCameraInstance('show').then(res => {
          this.cameraPreview.show();
        }, err => { console.error('camera show err:', err); });
      } catch (err) { console.error('CameraPreview show() catch err:', err); }
    } else if (cOpt == false || cOpt === null) {
      try {
        this.toggleCameraInstance('hide').then(res => {
          this.cameraPreview.hide();
        }, err => {console.error('hide camera err:', err)});
      } catch (err) { console.error('CameraPreview hide() catch err:', err); }
    }
  }
}
