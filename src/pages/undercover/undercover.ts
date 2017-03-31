import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import {
  CameraPreview,
  // PictureOptions,
  CameraPreviewOptions,
  // CameraPreviewDimensions
} from '@ionic-native/camera-preview';

import { CameraPage } from '../camera/camera';

// Providers
import { Tools } from '../../providers/tools';

import { Keyboard } from '@ionic-native/keyboard';

// Animations
import {
  chatAnim,
  toggleInputsFade,
  rotateChatPlus,
  toggleChatOptionsBg,
  scaleMainBtn,
  toggleGallery
} from '../../includes/animations';


@Component({
  selector: 'page-undercover',
  templateUrl: 'undercover.html',
  animations: [
    toggleInputsFade,
    rotateChatPlus,
    toggleChatOptionsBg,
    scaleMainBtn,
    toggleGallery
  ],
  providers: [Keyboard]
})

export class UndercoverPage {
  backbgoundTransparent = true;

  @ViewChild('galleryCont') gCont;

  chatOptions: any = {
    state: 'default'
  };

  bgState: any = {
    state: 'compressed'
  };

  chatBtns: any = {
    state: ['btnHidden', 'btnHidden', 'btnHidden', 'btnHidden']
  };

  mainBtn: any = {
    state: 'normal'
  };

  gallery: any = {
    state: 'off',
    imgHeight: undefined
  };

  imagesSrc = ["", "", ""];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private cameraPreview: CameraPreview,
    public tools: Tools,
    private keyboard: Keyboard
  ) {
    const cameraPreviewOpts: CameraPreviewOptions = {
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height,
      camera: 'rear',
      tapPhoto: false,
      previewDrag: true,
      toBack: true,
      alpha: 1
    }

    this.cameraPreview.startCamera(cameraPreviewOpts).then(res => {
      console.log(res);
      this.cameraPreview.show();
    }, err => {
      console.log(err);
    });

    this.keyboard.onKeyboardShow().subscribe(res => {
      console.log(res);
      this.mainBtn.state = 'minimised';
    }, err => {
      console.log(err);
    });
  }

  openCamera() {
    this.navCtrl.push(CameraPage, null, {
      animate: false,
      animation: 'md-transition',
    });
  }

  goBack() {
    this.navCtrl.pop();
  }

  // debug function for scaling main button
  debugScaleMainBtn() {
    this.mainBtn.state = (this.mainBtn.state == 'minimised') ? 'normal' : 'minimised';
  }

  toggleChatOptions() {
    this.chatOptions.state = (this.chatOptions.state == 'spined') ? 'default' : 'spined';
    this.bgState.state = (this.bgState.state == 'stretched') ? 'compressed' : 'stretched';

    if (this.bgState.state == 'stretched') {
      for(let i = 0; i < this.chatBtns.state.length; i++){
        setTimeout(() => {
          this.chatBtns.state[i] = 'btnShown';
        }, chatAnim/3 + (i*50));
      }
    } else {
      for(let i = 0; i < this.chatBtns.state.length; i++){
        this.chatBtns.state[i] = 'btnHidden';
      }
    }
  }

  toggleImageGallery(visibility){
    if(visibility == 'hide'){
      this.gallery.state = 'off';
    }
    if(!visibility)
    {
      this.gallery.state = (this.gallery.state == 'on') ? 'off' : 'on';
    }
    if(this.gallery.state == 'on'){
      this.mainBtn.state = 'moved-n-scaled';
    }else{
      this.mainBtn.state = 'normal';
    }
  }

  getActiveStyle(){
    // if(this.showStyle) {
    //   return "yellow";
    // } else {
    //   return "";
    // }
  }

  ionViewDidLoad() {
    setTimeout(() => {
      this.gallery.imgHeight = this.gCont.nativeElement.children[0].clientWidth;
    }, 100);
    console.log('ionViewDidLoad UndercoverPage');
  }

}
