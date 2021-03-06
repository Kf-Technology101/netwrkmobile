import { Injectable } from '@angular/core';

import { CameraPreviewOptions, CameraPreview } from '@ionic-native/camera-preview';
import { LocalStorage } from './local-storage';

@Injectable()
export class Camera {
  public takenPictures: Array<string> = [];
  private cameraPreviewOpts: CameraPreviewOptions;

  constructor(
    public storage: LocalStorage,
    public cameraPreview: CameraPreview
  ) {
    console.log('Hello Camera Provider');

    this.cameraPreviewOpts = {
      x: 0,
      y: 0,
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      camera: 'rear',
      tapPhoto: false,
      previewDrag: true,
      toBack: true,
      alpha: 1
    }
  }

  public getCameraOpt(options?: any): CameraPreviewOptions {
    for (let o in options) this.cameraPreviewOpts[o] = options[o];
    return this.cameraPreviewOpts;
  }

  public toggleCameraBg(params?:any):void {
    let cOpt:any = this.storage.get('enable_uc_camera');
    if ((params && params.isCamera && !params.isArea) || cOpt == true) {
      try {
        this.cameraPreview.show();
      } catch (err) {
        console.error(err);
      }
    } else if ((params && params.isArea) || cOpt == false || cOpt === null) {
      try {
        this.cameraPreview.hide();
      } catch (err) {
        console.error(err);
      }
    }
  }
}
