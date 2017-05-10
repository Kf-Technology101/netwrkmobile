import { Component, HostBinding } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { CameraPreview } from '@ionic-native/camera-preview';

import { Tools } from '../../providers/tools';
import { Camera } from '../../providers/camera';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery';

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
  ],
  providers: [
    Base64ToGallery
  ]
})

export class CameraPage {
  @HostBinding('class') colorClass = 'transparent-background';

  cameraUI: any = {
    tooltip: 'tooltipFadeOut',
    button: 'photoButtonFadeOut'
  };

  imgBg: string;
  imgUrl: string;

  mainBtn = {
    state: 'minimisedForCamera',
    hidden: false
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private cameraPreview: CameraPreview,
    public cameraPrvd: Camera,
    public tools: Tools,
    private base64ToGallery: Base64ToGallery
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
      // this.cameraPrvd.takenPictures = data:image/jpeg;base64,' + imageData[0];
      this.mainBtn.state =  'normal';
      this.imgBg = `url(data:image/jpeg;base64,${imageData[0]})`;
      // this.imgUrl = 'data:image/jpeg;base64,' + imageData[0];

      this.base64ToGallery.base64ToGallery(imageData[0], { prefix: 'netwrk_' }).then(
        res => {
          console.log('Saved image to gallery ', res);
          this.imgUrl = res;
        },
        err => console.log('Error saving image to gallery ', err)
      );

      // this.goBack();
    }, err => {
      console.log(err);
      this.mainBtn.state =  'normal';
      this.imgBg = 'url(http://www.designboom.com/wp-content/uploads/2016/07/patricia-piccinini-graham-transport-accident-commission-designboom-01.jpg)';
      this.imgUrl = 'http://www.designboom.com/wp-content/uploads/2016/07/patricia-piccinini-graham-transport-accident-commission-designboom-01.jpg';
      // this.goBack();
    });
  }

  switchCamera() {
    this.cameraPreview.switchCamera();
  }

  goBack(params?: any) {
    this.tools.popPage();
  }

  saveImage() {
    // console.log("Saving image:", this.imgUrl);
    if (this.cameraPrvd.takenPictures.length < 3) {
      this.cameraPrvd.takenPictures.push(this.imgUrl);
      this.goBack();
    } else {
      this.tools.showToast('You can\'t append more pictures');
    }
  }

  cancelSave() {
    this.imgBg = undefined;
  }

  ionViewDidEnter() {
    this.cameraPreview.show();
    this.cameraUI.button = 'photoButtonFadeIn';
    setTimeout(() => {
      this.cameraUI.tooltip = 'tooltipFadeIn';
    }, animSpeed.fadeIn/2);
    console.log('ionViewDidLoad CameraPage');
  }

}
