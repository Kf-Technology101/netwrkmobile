import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import {
  CameraPreview,
  CameraPreviewOptions
} from '@ionic-native/camera-preview';

import { ImagePicker } from '@ionic-native/image-picker';

import { CameraPage } from '../camera/camera';

// Providers
import { Tools } from '../../providers/tools';

import { Keyboard } from '@ionic-native/keyboard';

// Animations
import {
  animSpeed,
  chatAnim,
  toggleInputsFade,
  rotateChatPlus,
  toggleChatOptionsBg,
  scaleMainBtn,
  toggleGallery,
  toggleFade
} from '../../includes/animations';

@Component({
  selector: 'page-undercover',
  templateUrl: 'undercover.html',
  animations: [
    toggleInputsFade,
    rotateChatPlus,
    toggleChatOptionsBg,
    scaleMainBtn,
    toggleGallery,
    toggleFade
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

  @ViewChild('slidingItems') toggler;

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

  emoticX = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C'];
  emoticY = ['1F60', '1F61', '1F62', '1F63', '1F64'];

  emojis = [];

  mainInput: any = {
    state: 'fadeIn',
    hidden: false
  };

  txtFocus: boolean = false;

  caretPos: number = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private cameraPreview: CameraPreview,
    public tools: Tools,
    private keyboard: Keyboard,
    private imagePicker: ImagePicker
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

    // this.keyboard.onKeyboardShow().subscribe(res => {
    //   console.log(res);
    //   this.mainBtn.state = 'minimised';
    //
    //   this.emojiContainer.state = 'off';
    //   setTimeout(() => {
    //     this.emojiContainer.stateBool = false;
    //   }, chatAnim/2);
    // }, err => {
    //   console.log(err);
    // });

    // this.keyboard.onKeyboardHide().subscribe(res => {
    //
    // }, err => {
    //   console.log(err);
    // });
  }

  dragContent = true;

  generateEmoticons(){
    for(let i = 0; i < this.emoticX.length; i++){
      for(let j = 0; j < this.emoticY.length; j++){
        this.emojis.push('0x' + this.emoticY[j] + this.emoticX[i]);
      }
    }
  }

  openCamera() {
    this.mainInput.state = 'fadeOutfast';
    setTimeout(() => {
      this.mainInput.hidden = true;
      this.mainBtn.state = 'minimisedForCamera';
      setTimeout(() => {
        this.navCtrl.push(CameraPage, null, {
          animate: false,
          animation: 'md-transition',
        });
        this.tools.pushPage(CameraPage);
      }, chatAnim/2);
    }, animSpeed.fadeIn/2);
  }

  goBack() {
    this.tools.popPage();
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

  insertEmoji(emoji){
    this.txtIn.nativeElement.focus();
    let emojiDecoded = String.fromCodePoint(emoji);
    let inputVal = this.txtIn.nativeElement.value;
    inputVal = inputVal.split('');
    this.getCaretPos(this.txtIn.nativeElement);
    inputVal.splice(this.caretPos, 0, emojiDecoded);
    this.txtIn.nativeElement.value = inputVal.join('');
    this.txtIn.nativeElement.selectionStart = this.caretPos + emojiDecoded.length;
    this.txtIn.nativeElement.selectionEnd = this.caretPos + emojiDecoded.length;
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

  onDrag(ev, element){
    let percent = element.getSlidingPercent();
    // console.log(ev);
    // console.log(percent);
    if (percent < -1){
      this.dragContent = false;
      setTimeout(() => {
        this.dragContent = true;
      }, 100);
    }
  }

  goToProfile(ev){
    console.log("going to profile page");
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
