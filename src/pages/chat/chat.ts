import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';

import {
  CameraPreview,
  CameraPreviewOptions
} from '@ionic-native/camera-preview';

import { ImagePicker } from '@ionic-native/image-picker';

import { CameraPage } from '../camera/camera';

// Providers
import { Tools } from '../../providers/tools';
import { Undercover } from '../../providers/undercover';
import { SlideAvatar } from '../../providers/slide-avatar';
import { Share } from '../../providers/share';
import { User } from '../../providers/user';
import { Camera } from '../../providers/camera';

import { ProfilePage } from '../profile/profile';

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
  templateUrl: 'chat.html',
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

export class ChatPage {
  @ViewChild('galleryCont') gCont;
  @ViewChild('emojiCont') emCont;
  @ViewChild('shareCont') shCont;
  @ViewChild('textInput') txtIn;
  @ViewChild('slidingItems') toggler;
  @ViewChild('slfb') checkFb;
  @ViewChild('sltw') checkTw;
  @ViewChild('slln') checkIn;
  @ViewChild('chatContainer') chatCont;
  @ViewChild(Content) content: Content;

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
    state: 'normal',
    hidden: false
  };

  galleryContainer: any = {
    state: 'off',
    hidden: true,
    imgHeight: undefined
  };

  emojiContainer: any = {
    state: 'off',
    hidden: true
  };

  shareContainer: any = {
    state: 'off',
    hidden: true
  };

  toggContainers: any = [
    this.galleryContainer,
    this.emojiContainer,
    this.shareContainer
  ];

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

  postMessages: any = [];

  contentBlock: any = undefined;

  public user: any;

  public checkbox: any = {
    facebook: false,
    twitter: true,
    linkedin: false
  };

  public sendError: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private cameraPreview: CameraPreview,
    public tools: Tools,
    private keyboard: Keyboard,
    private imagePicker: ImagePicker,
    public undercoverPrvd: Undercover,
    public slideAvatar: SlideAvatar,
    public share: Share,
    public userProvider: User,
    public camera: Camera
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

      this.emojiContainer.state = 'off';
      setTimeout(() => {
        this.emojiContainer.hidden = true;
      }, chatAnim/2);
    }, err => {
      console.log(err);
    });

    this.keyboard.onKeyboardHide().subscribe(res => {

    }, err => {
      console.log(err);
    });

    this.user = this.undercoverPrvd.getPerson();
    if (!this.user) {
      this.user = {
        name: '',
        imageUrl: '',
      }
    }

    // for (let i = 0; i < 10; i++)
    //   this.postMessages.push("Message #" + i);

    this.sendError = 'Error sending message';
  }

  dragContent = true;

  generateEmoticons() {
    for (let i = 0; i < this.emoticX.length; i++) {
      for (let j = 0; j < this.emoticY.length; j++) {
        this.emojis.push('0x' + this.emoticY[j].concat(this.emoticX[i]));
      }
    }
  }

  openCamera() {
    this.mainInput.state = 'fadeOutfast';
    setTimeout(() => {
      this.mainInput.hidden = true;
      this.mainBtn.state = 'minimisedForCamera';
      setTimeout(() => {
        this.mainBtn.hidden = true;
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
      for (let i = 0; i < this.chatBtns.state.length; i++) {
        setTimeout(() => {
          this.chatBtns.state[i] = 'btnShown';
        }, chatAnim/3 + (i*50));
      }
    } else {
      for (let i = 0; i < this.chatBtns.state.length; i++) {
        this.chatBtns.state[i] = 'btnHidden';
      }
    }
  }

  setContentPadding(status){
    if (status) {
      this.contentBlock.style.padding = '0 0 ' + window.screen.height/2 + 'px';
    } else {
      this.contentBlock.style.padding = '0 0 180px';
    }
  }

  toggleContainer(container, visibility) {
    if (visibility == 'hide') {
      this.mainBtn.state = 'normal';
      container.state = 'off';
      this.setContentPadding(false);
      setTimeout(() => {
        container.hidden = true;
      }, chatAnim/2);
    }

    if (!visibility) {
      if (container.hidden) {
        this.mainBtn.state = 'moved-n-scaled';
        container.hidden = false;
        container.state = 'on';
        this.setContentPadding(true);
        for (let i = 0; i < this.toggContainers.length; i++) {
          if (!this.toggContainers[i].hidden &&
            container != this.toggContainers[i]){
              this.toggContainers[i].state = 'off';
            setTimeout(() => {
              this.toggContainers[i].hidden = true;
            }, chatAnim/2);
          }
        }
      } else {
        this.setContentPadding(false);
        this.mainBtn.state = 'normal'
        container.state = 'off';
        setTimeout(() => {
          container.hidden = true;
        }, chatAnim/2);
      }
    }
  }

  insertEmoji(emoji) {
    console.log(this.txtIn);
    // this.txtIn.nativeElement.focus();
    // let emojiDecoded = String.fromCodePoint(emoji);
    // let inputVal = this.txtIn.nativeElement.value;
    // inputVal = inputVal.split('');
    // this.getCaretPos(this.txtIn.nativeElement);
    // inputVal.splice(this.caretPos, 0, emojiDecoded);
    // this.txtIn.nativeElement.value = inputVal.join('');
    // this.txtIn.nativeElement.selectionStart = this.caretPos + emojiDecoded.length;
    // this.txtIn.nativeElement.selectionEnd = this.caretPos + emojiDecoded.length;
  }

  convertEmoji(unicode) {
    return String.fromCodePoint(unicode);
  }

  postMessage() {
    // ""
    console.log(this.txtIn);
    let message = {
      text: this.txtIn.value,
      image: ''
    };
    if (this.camera.takenImage) {
      message.image = this.camera.takenImage;
      this.camera.takenImage = null;
    }
    if (message.text.trim() != '' || message.image) {
      if (this.userProvider.getAuthData()) {
        let data = {
          text: message.text,
          user_id: this.userProvider.getAuthData().id,
          image: message.image
        }

        this.undercoverPrvd.sendMessage(data)
          .map(res => res.json())
          .subscribe(res => {
            console.log(res);
          }, err => {
            console.log(err);
            this.tools.showToast(this.sendError);
          });
      }
      let self = this;
      if (!message.image) {
        setTimeout(() => { this.postMessages.push(message); self.txtIn.setFocus(); }, 100);

        this.txtIn.value = '';
      }
      this.content.scrollTo(0, this.content.getContentDimensions().scrollHeight, 100);
    }
  }

  getCaretPos(oField) {
    if (oField.selectionStart || oField.selectionStart == '0') {
      this.caretPos = oField.selectionStart;
    }
  }

  goToProfile(ev) {
    console.log(">>> [GO] Profile Page");
    setTimeout(() => {
      this.tools.pushPage(ProfilePage);
    }, 100);
  }

  toggleShareSlider(mess){
    this.checkbox[mess] = !this.checkbox[mess];
  }

  changeCallback(positionLeft?: boolean) {
    if (positionLeft) {
      this.tools.showToast('Test...');
    }
  }

  ionViewDidEnter() {
    this.mainInput.state = 'fadeIn';
    this.mainInput.hidden = false;
    this.mainBtn.state = 'normal';
    this.mainBtn.hidden = false;

    this.slideAvatar.changeCallback = this.changeCallback.bind(this);
    this.slideAvatar.sliderInit();
    this.contentBlock = document.getElementsByClassName("scroll-content")['0'];
    this.setContentPadding(false);
    this.content.scrollTo(0, this.content.getContentDimensions().scrollHeight, 100);

    if (this.camera.takenImage) {
      this.postMessage();
    }
  }

  ionViewDidLoad() {
    console.log('[UNDERCOVER.ts] viewDidLoad');
    // this.slideAvatar.startSliderEvents();
    this.generateEmoticons();

    if (this.imgesSrc.length > 0) {
      setTimeout(() => {
        this.galleryContainer.imgHeight = this.gCont.nativeElement.children[0].clientWidth;
      }, 100);
    }
  }

  ionViewWillLeave() {
    console.log('[UNDERCOVER.ts] viewWillLeave');
    // this.slideAvatar.stopSliderEvents();
  }
}