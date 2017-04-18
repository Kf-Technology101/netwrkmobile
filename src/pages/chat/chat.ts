import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content, Slides, Platform } from 'ionic-angular';

import { CameraPreview } from '@ionic-native/camera-preview';

// import { ImagePicker } from '@ionic-native/image-picker';

import { CameraPage } from '../camera/camera';

// Providers
import { Tools } from '../../providers/tools';
import { UndercoverProvider } from '../../providers/undercover';
import { SlideAvatar } from '../../providers/slide-avatar';
// import { Share } from '../../providers/share';
import { Auth } from '../../providers/auth';
import { Camera } from '../../providers/camera';
import { Chat } from '../../providers/chat';
import { Network } from '../../providers/network';
import { Gps } from '../../providers/gps';

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
    // ImagePicker
  ]
})

export class ChatPage {

  public isUndercover: boolean = true;

  @ViewChild('galleryCont') gCont;
  // @ViewChild('emojiCont') emCont;
  // @ViewChild('shareCont') shCont;
  @ViewChild('textInput') txtIn;
  // @ViewChild('slidingItems') toggler;
  // @ViewChild('slfb') checkFb;
  // @ViewChild('sltw') checkTw;
  // @ViewChild('slln') checkIn;
  // @ViewChild('chatContainer') chatCont;
  @ViewChild(Content) content: Content;
  @ViewChild('fbSlider') userSlider: Slides;

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

  appendContainer: any = {
    state: 'off',
    hidden: true
  }

  // hidePlaceholder = false;

  imgesSrc = [];

  emoticX = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C'];
  emoticY = ['1F60', '1F61', '1F62', '1F63', '1F64'];

  emojis = [];

  mainInput: any = {
    state: 'fadeIn',
    hidden: false
  };

  // txtFocus: boolean = false;

  caretPos: number = 0;

  public postMessages: any = [];

  contentBlock: any = undefined;

  public chatUsers: string[] = [];

  public user: any;

  public checkbox: any = {
    facebook: false,
    twitter: true,
    linkedin: false
  };

  public sendError: string;
  private networkParams: any = {};

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private cameraPreview: CameraPreview,
    private keyboard: Keyboard,
    // private imagePicker: ImagePicker,
    // public share: Share,
    public undercoverPrvd: UndercoverProvider,
    public slideAvatarPrvd: SlideAvatar,
    public toolsPrvd: Tools,
    public authPrvd: Auth,
    public cameraPrvd: Camera,
    public chatPrvd: Chat,
    public networkPrvd: Network,
    public gpsPrvd: Gps,
    public plt: Platform
  ) {

    this.keyboard.disableScroll(true);

    let cameraOptions = this.cameraPrvd.getCameraOpt({ tapPhoto: false });
    this.cameraPreview.startCamera(cameraOptions).then(res => {
      console.log(res);
      this.cameraPreview.show();
    }, err => {
      console.log(err);
    });

    this.keyboard.onKeyboardShow().subscribe(res => {
      console.log(res);
      if (this.plt.is('ios')) {
        let footerEl = document.getElementsByClassName('chatFooter')['0'];
        let scrollEl = document.getElementsByClassName('scroll-content')['0'];
        scrollEl.style.bottom = res.keyboardHeight + 'px';
        footerEl.style.bottom = res.keyboardHeight + 'px';
      }
      setTimeout(() => {
        this.mainBtn.state = 'minimised';
        if (!this.appendContainer.hidden) {
          this.mainBtn.state = 'above_append';
        }
      }, 50);
    }, err => {
      console.log(err);
    });

    this.keyboard.onKeyboardHide().subscribe(res => {
      console.log(res);
      if (this.plt.is('ios')) {
        let footerEl = document.getElementsByClassName('chatFooter')['0'];
        let scrollEl = document.getElementsByClassName('scroll-content')['0'];
        footerEl.style.bottom = '0';
        scrollEl.style.bottom = '0';
      }
      // setTimeout(() => {
        if (!this.appendContainer.hidden) {
          this.mainBtn.state = 'above_append';
        }
        if (this.appendContainer.hidden) {
          this.mainBtn.state = 'normal';
        }
      // }, chatAnim/2);

    }, err => {
      console.log(err);
    });

    this.user = this.undercoverPrvd.getPerson();
    if (!this.user) this.user = {
      name: '',
      imageUrl: '',
    }

    this.sendError = 'Error sending message';

    // setTimeout(() => {
    //   for (var i = 0; i < 6; i++) {
    //     this.chatUsers.push(i.toString());
    //   }
    // }, 100);

    let action = this.navParams.get('action');
    if (action) {
      this.chatPrvd.setState(action);
      this.isUndercover = action && action == 'undercover' ? true : false;
    } else {
      this.isUndercover = this.chatPrvd.getState() == 'undercover' ? true : false;
    }

    this.networkParams = { post_code: this.gpsPrvd.zipCode };
  }

  // dragContent = true;

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
        this.toolsPrvd.pushPage(CameraPage);
      }, chatAnim/2);
    }, animSpeed.fadeIn/2);
  }

  // debug function for scaling main button
  // debugScaleMainBtn() {
  //   this.mainBtn.state = (this.mainBtn.state == 'minimised') ? 'normal' : 'minimised';
  // }

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
      this.contentBlock.style.padding = '0 0 ' + document.documentElement.clientHeight/2 + 'px';
    } else {
      this.contentBlock.style.padding = '0 0 180px';
    }
  }

  toggleContainer(container, visibility) {
    if (visibility == 'hide') {
      if (this.appendContainer.hidden) {
        this.mainBtn.state = 'normal';
      }
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

    let currentDate = new Date();
    console.log(this.txtIn);

    let message = {
      text: this.txtIn.value,
      images: [],
      date: null
    };
    if (this.cameraPrvd.takenPictures) {
      message.images = this.cameraPrvd.takenPictures;
    }
    if (message.text.trim() != '' || message.images.length > 0) {
      if (this.authPrvd.getAuthData()) {
        let data = {
          text: message.text,
          user_id: this.authPrvd.getAuthData().id,
          image: message.images,
          undercover: this.isUndercover
        }

        this.chatPrvd.sendMessage(data)
          .subscribe(res => {
            console.log(res);
            console.log('created_at:', res.created_at);
          }, err => {
            console.log(err);
            this.toolsPrvd.showToast(this.sendError);
          });
      }
      setTimeout(() => {
        if (message.text.trim() != '') {
          this.postMessages.push(message);
          this.txtIn.value = '';
        }
      }, 100);
      this.mainBtn.state = 'minimised';
      this.appendContainer.state = 'off';
      setTimeout(() => {
        this.appendContainer.hidden = true;
      }, chatAnim/2);

      // let date1 = new Date();
      // let date2 = new Date();
      // let timeDiff = Math.abs(date2.getTime() - date1.getTime());
      // let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

      let fullTime = new Date().toTimeString().split(' ')[0];
      message.date = fullTime.substring(0, fullTime.length - 3);
      this.content.scrollTo(0, this.content.getContentDimensions().scrollHeight, 100);
      this.cameraPrvd.takenPictures = [];
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
      this.toolsPrvd.pushPage(ProfilePage);
    }, 100);
  }

  mainBtnOnTap() {
    if (!this.isUndercover) {
      this.isUndercover = true;
      setTimeout(() => {
        this.slideAvatarPrvd.sliderInit();
      }, 100);
    } else {

    }
  }

  toggleShareSlider(mess){
    this.checkbox[mess] = !this.checkbox[mess];
  }

  changeCallback(positionLeft?: boolean) {
    this.isUndercover = !positionLeft;
    if (positionLeft) {
      this.chatPrvd.setState('netwrk');
    }
    console.log("isUndercover", this.isUndercover);
  }

  removeAppendedImage(index) {
    this.cameraPrvd.takenPictures.splice(index, 1);
    if (this.cameraPrvd.takenPictures.length == 0) {
      this.mainBtn.state = 'normal';
      this.appendContainer.state = 'off';
      setTimeout(() => {
        this.appendContainer.hidden = true;
      }, chatAnim/2);
    }
  }

  private getUsers() {
    this.networkPrvd.getUsers(this.networkParams).subscribe(res => {
      console.log(res);
      this.chatUsers = res;
    }, err => {
      console.log(err);
    });
  }

  ionViewDidEnter() {
    this.mainInput.state = 'fadeIn';
    this.mainInput.hidden = false;
    this.mainBtn.state = 'normal';
    this.mainBtn.hidden = false;

    this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
    if (this.isUndercover) {
      this.slideAvatarPrvd.sliderInit();
    }
    this.contentBlock = document.getElementsByClassName("scroll-content")['0'];
    this.setContentPadding(false);
    this.content.scrollTo(0, this.content.getContentDimensions().scrollHeight, 100);


    if (this.cameraPrvd.takenPictures && this.cameraPrvd.takenPictures.length > 0) {
      this.appendContainer.hidden = false;
      this.appendContainer.state = 'on_append';
      this.mainBtn.state = 'above_append';
    }
    // if (this.cameraPrvd.takenPictures) {
    //   this.postMessage();
    // }
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

    this.getUsers();
    // this.postMessages = this.networkPrvd.getMessages();
    this.networkPrvd.getMessages().subscribe(data => {
      console.log(data);
    }, err => {
      console.log(err);
    })
  }

  ionViewWillLeave() {
    console.log('[UNDERCOVER.ts] viewWillLeave');
    // this.slideAvatar.stopSliderEvents();
  }
}
