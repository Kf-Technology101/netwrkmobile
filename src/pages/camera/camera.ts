import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {
  CameraPreview,
  // PictureOptions,
  CameraPreviewOptions,
  // CameraPreviewDimensions
} from '@ionic-native/camera-preview';

import { UndercoverPage } from '../undercover/undercover';

// Animations
import {
  animSpeed,
  chatAnim,
  toggleInputsFade,
  rotateChatPlus,
  toggleChatOptionsBg,
  scaleMainBtn,
  toggleGallery,
  toggleFade,
  cameraUIanimation
} from '../../includes/animations';

@Component({
  selector: 'page-camera',
  templateUrl: 'camera.html',
  animations: [
    toggleInputsFade,
    rotateChatPlus,
    toggleChatOptionsBg,
    scaleMainBtn,
    toggleGallery,
    toggleFade,
    cameraUIanimation
  ]
})

export class CameraPage {

  cameraUI: any = {
    tooltip: 'tooltipFadeOut',
    button: 'photoButtonFadeOut'
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private cameraPreview: CameraPreview,
  ) {
    const cameraPreviewOpts: CameraPreviewOptions = {
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height,
      camera: 'rear',
      tapPhoto: true,
      previewDrag: true,
      toBack: true,
      alpha: 1
    };

    this.cameraPreview.startCamera(cameraPreviewOpts).then(res => {
      console.log(res);
      this.cameraPreview.show();
    }, err => {
      console.log(err);
    });
  }

  takePhoto() {
    // picture options
    const pictureOpts = {
      width: 1280,
      height: 1280,
      quality: 85
    }

    // take a picture
    this.cameraPreview.takePicture(pictureOpts).then((imageData) => {
      console.log(imageData);
      this.goBack({
        image: imageData[0],
      });
    }, (err) => {
      console.log(err);
    });
  }

  switchCamera() {
    this.cameraPreview.switchCamera();
  }

  goBack(params?: any) {
    this.navCtrl.push(UndercoverPage, params, {
      animate: false,
      animation: 'md-transition',
    });
  }

  ionViewDidLoad() {
    this.cameraUI.button = 'photoButtonFadeIn';
    setTimeout(() => {
      this.cameraUI.tooltip = 'tooltipFadeIn';
    }, animSpeed.fadeIn/2);
    console.log('ionViewDidLoad CameraPage');
  }

}
