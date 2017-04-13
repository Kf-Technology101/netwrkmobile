import { Injectable } from '@angular/core';

import { CameraPreviewOptions } from '@ionic-native/camera-preview';

@Injectable()
export class Camera {
  public takenPictures = [];
  private cameraPreviewOpts: CameraPreviewOptions;

  constructor() {
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

  public getCameraOpt(options: any): CameraPreviewOptions {
    for (let o in options) this.cameraPreviewOpts[o] = options[o];
    return this.cameraPreviewOpts;
  }

}
