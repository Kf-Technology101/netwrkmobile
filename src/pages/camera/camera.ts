import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import { CameraPreview } from '@ionic-native/camera-preview';

import { Tools } from '../../providers/tools';
import { Camera } from '../../providers/camera';

// Animations
import {
  animSpeed,
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

  // @ViewChild(Content) content: Content;

  cameraUI: any = {
    tooltip: 'tooltipFadeOut',
    button: 'photoButtonFadeOut'
  };

  takenImage: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private cameraPreview: CameraPreview,
    public cameraPrvd: Camera,
    public tools: Tools
  ) {
    let cameraOptions = this.cameraPrvd.getCameraOpt({ tapPhoto: true });
    this.cameraPreview.startCamera(cameraOptions).then(res => {
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
      quality: 100
    }

    // take a picture
    this.cameraPreview.takePicture(pictureOpts).then(imageData => {
      console.log(imageData);
      // this.cameraPrvd.takenImage = data:image/jpeg;base64,' + imageData[0];
      // this.goBack();
      this.takenImage = 'url(data:image/jpeg;base64,' + imageData[0] + ')';
    }, err => {
      console.log(err);
      // let content = document.getElementsByClassName('photo-preview')['0'];
      // console.log(content);
      // this.goBack();
    });
  }

  switchCamera() {
    this.cameraPreview.switchCamera();
  }

  goBack(params?: any) {
    this.tools.popPage();
  }

  ionViewDidLoad() {
    this.cameraUI.button = 'photoButtonFadeIn';
    setTimeout(() => {
      this.cameraUI.tooltip = 'tooltipFadeIn';
    }, animSpeed.fadeIn/2);
    console.log('ionViewDidLoad CameraPage');
  }

}
