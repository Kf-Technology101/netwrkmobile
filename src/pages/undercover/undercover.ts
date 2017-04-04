import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import {
  CameraPreview,
  // PictureOptions,
  CameraPreviewOptions,
  // CameraPreviewDimensions
} from '@ionic-native/camera-preview';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { ImagePicker } from '@ionic-native/image-picker';

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
  providers: [
    Keyboard,
    ImagePicker
  ]
})

export class UndercoverPage {
  backbgoundTransparent = true;

  @ViewChild('galleryCont') gCont;
  @ViewChild('emojiCont') emCont;

  @ViewChild('textInput') txtIn;

  public myMessageString: string = '';

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

  galleryContainer: any = {
    state: 'off',
    stateBool: false,
    imgHeight: undefined
  };

  emojiContainer: any = {
    state: 'off',
    stateBool: false
  };

  hidePlaceholder = false;

  imgesSrc = [];

  emoticY = ['1F60', '1F61', '1F62', '1F63', '1F64'];
  emoticX = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C'];

  emojis = [];

  caretPos: number = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private cameraPreview: CameraPreview,
    public tools: Tools,
    private keyboard: Keyboard,
    private imagePicker: ImagePicker,
    private camera: Camera
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

    this.myMessageString = "Hello, :smile: friend :smile_cat:";

    this.cameraPreview.startCamera(cameraPreviewOpts).then(res => {
      console.log(res);
      this.cameraPreview.show();
    }, err => {
      console.log(err);
    });

    this.keyboard.onKeyboardShow().subscribe(res => {
      console.log(res);
      this.mainBtn.state = 'minimised';

      this.emojiContainer.state = 'off';
      setTimeout(() => {
        this.emojiContainer.stateBool = false;
      }, chatAnim/2);
    }, err => {
      console.log(err);
    });

    // this.keyboard.onKeyboardHide().subscribe(res => {
    //
    // }, err => {
    //   console.log(err);
    // });
  }

  generateEmoticons(){
    for(let i = 0; i < this.emoticX.length; i++){
      for(let j = 0; j < this.emoticY.length; j++){
        this.emojis.push('0x' + this.emoticY[j] + this.emoticX[i]);
      }
    }
    console.log(this.emojis);
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

  toggleContainer(container, visibility) {
    console.log(container);
    if (visibility == 'hide') {
      container.state = 'off';
      setTimeout(() => {
        container.stateBool = false;
      }, chatAnim/2);
    }
    if (!visibility) {
      container.state = (container.state == 'on') ? 'off' : 'on';
      if (container.state) {
        container.stateBool = true;
      } else {
        setTimeout(() => {
          container.stateBool = false;
        }, chatAnim/2);
      }
    }

    if(container.state == 'on') {
      this.mainBtn.state = 'moved-n-scaled';
    } else {
      this.mainBtn.state = 'normal';
    }
  }

  debugIconTest(emoji){
    let inputVal = this.txtIn.nativeElement.value;
    inputVal = inputVal.split('');
    inputVal.splice(this.caretPos, 0, String.fromCodePoint(emoji));
    this.txtIn.nativeElement.value = inputVal.join('');

    // this.txtIn.selectionStart++;
    // this.getCaretPos(this.txtIn);
  }

  convertEmoji(unicode){
    return String.fromCodePoint(unicode);
  }

  sendMessage(){
    console.log(this.txtIn);
  }

  getCaretPos(oField){
    if (oField.selectionStart || oField.selectionStart == '0') {
      this.caretPos = oField.selectionStart;
    }
  }

  ionViewDidLoad() {
    this.generateEmoticons();
    if(this.imgesSrc.length > 0){
      setTimeout(() => {
        this.galleryContainer.imgHeight = this.gCont.nativeElement.children[0].clientWidth;
      }, 100);
    }
    console.log('ionViewDidLoad UndercoverPage');
  }

}
