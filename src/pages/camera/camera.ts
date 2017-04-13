import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
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

  cameraUI: any = {
    tooltip: 'tooltipFadeOut',
    button: 'photoButtonFadeOut'
  };

  takenImage: string;
  savedImage: string;

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
      this.takenImage = 'url(data:image/jpeg;base64,' + imageData[0] + ')';
      this.savedImage = 'data:image/jpeg;base64,' + imageData[0];
      // this.goBack();
    }, err => {
      console.log(err);
      // this.takenImage = 'url(https://backlab.files.wordpress.com/2015/04/windows_98_logo.png)';
      // this.savedImage = 'https://backlab.files.wordpress.com/2015/04/windows_98_logo.png';
      // this.goBack();
    });
  }

  switchCamera() {
    this.cameraPreview.switchCamera();
  }

  goBack(params?: any) {
    this.tools.popPage();
  }

  saveImage(){
    console.log("Saving image:", this.savedImage);
    this.cameraPrvd.takenImage.push(this.savedImage);
  }

  ionViewDidLoad() {
    this.cameraUI.button = 'photoButtonFadeIn';
    setTimeout(() => {
      this.cameraUI.tooltip = 'tooltipFadeIn';
    }, animSpeed.fadeIn/2);
    console.log('ionViewDidLoad CameraPage');
  }

}
