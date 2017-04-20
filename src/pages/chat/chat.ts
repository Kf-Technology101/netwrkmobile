import { Component, ViewChild, NgZone } from '@angular/core';
import { NavController, NavParams, Content, Platform } from 'ionic-angular';

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

import * as moment from 'moment';
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

  chatOptions: any = {
    state: 'default'
  };

  bgState: any = {
    state: 'compressed'
  };

  chatBtns: any = {
    state: ['btnHidden', 'btnHidden', 'btnHidden', 'btnHidden']
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

  private postBtnChange: boolean = false;

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
  public showUserSlider: boolean = false;
  private networkParams: any = {};

  // [Date updater]
  // Updates dates in messages every {delay} in ms
  private dateUpdater: any = {
    timer: undefined,                   // variable for setInterval() storage
    delay: <number> 1000*44,            // timer delay, default: 44sec
    enableForceStart: <boolean> false,  // restart current timer by force
    enableLogMessages: <boolean> false, // toggle console messages (toggles only .log)
    mC: this.postMessages,              // array of messages
    logStyle: <any> {                   // custom console color settings
      background: '#222',
      color: '#bada55'
    },
    // {type}-log {message} to console
    logMessage: (message: string, type: string) => {
      switch (type) {
        case 'error':
          console.error('dateUpdater: ' + message);
        break;
        default:
          console.log('%c dateUpdater: ' + message,
          'background: ' + this.dateUpdater.logStyle.background +
          ';color: ' + this.dateUpdater.logStyle.color);
        break;
      }
    },
    // Get time from all visible messages
    getMessagesDate: () => {
      for (let i in this.postMessages) {
        this.postMessages[i].dateStr =
        this.toolsPrvd.getTime(this.postMessages[i].created_at);
      }
    },
    // Start timer
    start: () => {
      if (this.dateUpdater.enableLogMessages) {
        this.dateUpdater.logMessage('Starting timer...');
      }
      if (this.postMessages) {
        if (this.dateUpdater.enableForceStart || !this.dateUpdater.timer) {
          this.dateUpdater.getMessagesDate();
          this.dateUpdater.timer = setInterval(() => {
            this.dateUpdater.getMessagesDate();
          }, this.dateUpdater.delay);
        } else {
          this.dateUpdater.logMessage(
            'Cant\'t start timer. There are already runing one or try to set enableForceStart: true',
            'error');
        }
      } else {
        this.dateUpdater.logMessage(
          'There are no messages to update or timer is already runing',
          'error');
      }
    },
    // Stop timer
    stop: () => {
      if (this.dateUpdater.enableLogMessages) {
        this.dateUpdater.logMessage('Stoping timer...');
      }
      if (this.dateUpdater.timer) {
        clearInterval(this.dateUpdater.timer);
      } else {
        this.dateUpdater.logMessage('There are no timer to stop.', 'error');
      }
    }
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public zone: NgZone,
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
      this.postBtnChange = true;
      if (this.plt.is('ios')) {
        let footerEl = document.getElementsByClassName('chatFooter')['0'];
        let scrollEl = document.getElementsByClassName('scroll-content')['0'];
        scrollEl.style.bottom = res.keyboardHeight + 'px';
        footerEl.style.bottom = res.keyboardHeight + 'px';
      }
      setTimeout(() => {
        this.chatPrvd.mainBtn.state = 'minimised';
        if (!this.chatPrvd.appendContainer.hidden) {
          this.chatPrvd.mainBtn.state = 'above_append';
        }
      }, chatAnim/2 + 1);
    }, err => {
      console.log(err);
    });

    this.keyboard.onKeyboardHide().subscribe(res => {
      console.log(res);
      this.postBtnChange = false;
      if (this.plt.is('ios')) {
        let footerEl = document.getElementsByClassName('chatFooter')['0'];
        let scrollEl = document.getElementsByClassName('scroll-content')['0'];
        footerEl.style.bottom = '0';
        scrollEl.style.bottom = '0';
      }
      setTimeout(() => {
        if (!this.chatPrvd.appendContainer.hidden) {
          this.chatPrvd.mainBtn.state = 'above_append';
        }
        if (this.chatPrvd.appendContainer.hidden) {
          this.chatPrvd.mainBtn.state = 'normal';
        }
      }, chatAnim/2 + 1);

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
    this.showUsers();

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
      this.chatPrvd.mainBtn.state = 'minimisedForCamera';
      setTimeout(() => {
        this.chatPrvd.mainBtn.hidden = true;
        this.toolsPrvd.pushPage(CameraPage);
      }, chatAnim/2);
    }, animSpeed.fadeIn/2);
  }

  // debug function for scaling main button
  // debugScaleMainBtn() {
  //   this.chatPrvd.mainBtn.state = (this.chatPrvd.mainBtn.state == 'minimised') ? 'normal' : 'minimised';
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
      this.contentBlock.style.padding = '0 0 200px';
    }
  }

  toggleContainer(container, visibility) {
    if (visibility == 'hide') {
      if (this.chatPrvd.appendContainer.hidden) {
        this.chatPrvd.mainBtn.state = 'normal';
      } else {
        this.chatPrvd.mainBtn.state = 'above_append';
      }
      container.state = 'off';
      this.setContentPadding(false);
      setTimeout(() => {
        container.hidden = true;
      }, chatAnim/2);
    }

    if (!visibility) {
      if (container.hidden) {
        this.chatPrvd.mainBtn.state = 'moved-n-scaled';
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
        if (this.chatPrvd.appendContainer.hidden) {
          this.chatPrvd.mainBtn.state = 'normal';
        } else {
          this.chatPrvd.mainBtn.state = 'above_append';
        }
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
    let message = {
      text: this.txtIn.value,
      images: [],
      created_at: null,
      dateStr: ''
    };
    if (this.cameraPrvd.takenPictures) {
      message.images = this.cameraPrvd.takenPictures;
    }
    if (message.text.trim() != '' || message.images.length > 0) {
      if (this.authPrvd.getAuthData()) {
        let data = {
          text: message.text,
          user_id: this.authPrvd.getAuthData().id,
          images: message.images,
          undercover: this.isUndercover
        }

        this.chatPrvd.sendMessage(data);
          // .subscribe(res => {
          //   console.log(res);
          //   console.log('created_at:', res.created_at);
          // }, err => {
          //   console.log(err);
          //   this.toolsPrvd.showToast(this.sendError);
          // });
      }

      setTimeout(() => {
        if (message.text.trim() != '' || message.images.length > 0) {
          message.created_at = moment();
          message.dateStr = 'a moment ago';
          this.txtIn.value = '';
          this.chatPrvd.mainBtn.state = 'normal';
          this.postMessages.push(message);
          this.postBtnChange = false;
        }
      }, 100);

      this.chatPrvd.appendContainer.state = 'off';
      setTimeout(() => {
        this.chatPrvd.appendContainer.hidden = true;
      }, chatAnim/2);

      this.content.scrollTo(0, this.content.getContentDimensions().scrollHeight, 100);
      this.cameraPrvd.takenPictures = [];
    }
  }

  calculateInputChar(inputEl) {
    if (inputEl.value.trim().length > 0) {
      this.postBtnChange = true;
    } else {
      this.postBtnChange = false;
    }
  }

  getCaretPos(oField) {
    if (oField.selectionStart || oField.selectionStart == '0') {
      this.caretPos = oField.selectionStart;
    }
  }

  goToProfile(profileId: number) {
    this.toolsPrvd.pushPage(ProfilePage, { id: profileId });
  }

  mainBtnOnTap() {
    if (!this.isUndercover) {
      this.isUndercover = true;
      setTimeout(() => {
        this.slideAvatarPrvd.sliderInit();
        this.slideAvatarPrvd.setSliderPosition(true);
        this.showUsers();
      }, 100);
    }
  }

  toggleShareSlider(mess){
    this.checkbox[mess] = !this.checkbox[mess];
  }

  changeCallback(positionLeft?: boolean) {
    this.zone.run(() => {
      this.isUndercover = !positionLeft;
      if (positionLeft) this.chatPrvd.setState('netwrk');
      this.showUsers();
    })

    console.log('isUndercover', this.isUndercover);
  }

  removeAppendedImage(index) {
    this.cameraPrvd.takenPictures.splice(index, 1);
    if (this.cameraPrvd.takenPictures.length == 0) {
      this.chatPrvd.mainBtn.state = 'normal';
      this.chatPrvd.appendContainer.state = 'off';
      setTimeout(() => {
        this.chatPrvd.appendContainer.hidden = true;
      }, chatAnim/2);
    }
  }

  private getUsers() {
    this.networkPrvd.getUsers(this.networkParams).subscribe(res => {
      console.log(res);
      this.chatUsers = res;
      this.chatPrvd.setStorageUsers(res);
    }, err => {
      console.log(err);
    });
  }

  private showUsers() {
    setTimeout(() => {
      this.showUserSlider = this.isUndercover;
    }, 1000);
  }

  private showMessages() {
    this.chatPrvd.getMessages(this.isUndercover).subscribe(data => {
      console.log(data);
      this.postMessages = this.chatPrvd.organizeMessages(data);
      console.log(this.chatPrvd.users);
    }, err => {
      console.log(err);
    })
  }

  ionViewDidEnter() {
    this.mainInput.state = 'fadeIn';
    this.mainInput.hidden = false;
    this.chatPrvd.mainBtn.state = 'normal';
    this.chatPrvd.mainBtn.hidden = false;

    this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
    if (this.isUndercover) {
      this.slideAvatarPrvd.sliderInit();
      this.showUsers();
    }
    this.contentBlock = document.getElementsByClassName('scroll-content')['0'];
    this.setContentPadding(false);
    this.content.scrollTo(0, this.content.getContentDimensions().scrollHeight, 100);


    this.chatPrvd.updateAppendContainer();
    // if (this.cameraPrvd.takenPictures) {
    //   this.postMessage();
    // }
    this.dateUpdater.enableForceStart = true;
    this.dateUpdater.enableLogMessages = true;
    this.dateUpdater.start();
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
    this.showMessages();

    // this.postMessages = this.networkPrvd.getMessages();
  }

  ionViewWillLeave() {
    console.log('[UNDERCOVER.ts] viewWillLeave');
    this.dateUpdater.stop();
    // this.slideAvatar.stopSliderEvents();
  }
}
