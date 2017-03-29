import { Component, HostBinding } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import {
  CameraPreview,
  // PictureOptions,
  CameraPreviewOptions,
  CameraPreviewDimensions
} from '@ionic-native/camera-preview';

// Animations
import { animSpeed } from '../../includes/animations';
import { toggleInputsFade } from '../../includes/animations';

@Component({
  selector: 'page-undercover',
  templateUrl: 'undercover.html',
  animations: [
    toggleInputsFade
  ]
})
export class UndercoverPage {
  // @HostBinding('class.fixed');
  backbgoundTransparent = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private cameraPreview: CameraPreview
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
      console.log(err)
    });
  }

  chatOptions: any = {
    visible: false,
    state: 'hidden'
  }

  showChatOptions(){
    this.chatOptions.visible = true;
    this.chatOptions.state = 'shown';
  }

  hideChatOptions(){
    this.chatOptions.state = 'hidden';
    setTimeout(() => {
      this.chatOptions.visible = false;
    }, animSpeed.fadeOut);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UndercoverPage');
  }

}
