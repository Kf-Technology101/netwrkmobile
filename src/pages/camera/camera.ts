import { Component, HostBinding } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { CameraPreview } from '@ionic-native/camera-preview';

import { Tools } from '../../providers/tools';
import { Camera } from '../../providers/camera';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery';
import { LocalStorage } from '../../providers/local-storage';
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
    tooltip: 'tooltipFadeIn',
    button:  {
      state: 'photoButtonFadeIn',
      hidden: false
    }
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
    private base64ToGallery: Base64ToGallery,
    private storage: LocalStorage
  ) {}

  takePhoto() {
    this.tools.showLoader();
    // picture options
    const pictureOpts = {
      width: 1280,
      height: 1280,
      quality: 95
    }

    // take a picture
    this.cameraUI.button.hidden = true;
    this.cameraPreview.takePicture(pictureOpts).then(imageData => {
      console.log(imageData);
      // this.cameraPrvd.takenPictures = data:image/jpeg;base64,' + imageData[0];
      this.cameraUI.button.state = 'photoButtonFadeOut';
      this.cameraUI.tooltip = 'tooltipFadeOut';
      if (this.storage.get('first_time_camera') === null) {
        this.storage.set('first_time_camera', true);
      }
      setTimeout(() => {
        this.mainBtn.state = 'normal';
      }, animSpeed.fadeIn/2);
      this.imgBg = `url(data:image/jpeg;base64,${imageData[0]})`;
      // this.imgUrl = 'data:image/jpeg;base64,' + imageData[0];

      this.base64ToGallery.base64ToGallery(imageData[0], { prefix: 'netwrk_' }).then(
        res => {
          this.tools.hideLoader();
          console.log('Saved image to gallery ', res);
          this.imgUrl = res;
        },
        err => {
          this.tools.hideLoader();
          console.log('Error saving image to gallery ', err);
        }
      );

      // this.goBack();
    }, err => {
      console.log(err);
      this.mainBtn.state = 'normal';
      // this.goBack();
    });
  }

  switchCamera() {
    this.cameraPreview.switchCamera().then(()=>{})
    .catch(err => {
      console.warn('switch camera error:', err);
    });
  }

  goBack() {
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
    this.cameraUI.button.hidden = false;
    this.cameraUI.button.state = 'photoButtonFadeIn';
  }

  ionViewDidEnter() {
    this.cameraPrvd.toggleCameraBg({
      isCamera: true
    });

    setTimeout(() => {
      this.cameraUI.tooltip = 'tooltipFadeIn';
    }, animSpeed.fadeIn/2);
    console.log('ionViewDidLoad CameraPage');
  }
}
