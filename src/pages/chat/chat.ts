import { Component, ViewChild, NgZone } from '@angular/core';
import { NavController, NavParams, Content, Platform, ModalController } from 'ionic-angular';

import { CameraPreview } from '@ionic-native/camera-preview';

import { CameraPage } from '../camera/camera';
import { NetworkFindPage } from '../network-find/network-find';
import { FeedbackModal } from '../../modals/feedback/feedback';
import { Toggleable } from '../../includes/toggleable';
import { MessageDateTimer } from '../../includes/messagedatetimer';

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
  toggleFade,
  slideToggle
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
    toggleFade,
    slideToggle
  ],
  providers: [
    Keyboard
  ]
})

export class ChatPage {

  public isUndercover: boolean;

  @ViewChild('galleryCont') gCont;
  @ViewChild('textInput') txtIn;
  @ViewChild(Content) content: Content;

  chatOptions = new Toggleable('default');
  bgState = new Toggleable('compressed');
  shareContainer = new Toggleable('off', true);
  emojiContainer = new Toggleable('off', true);
  mainInput = new Toggleable('fadeIn', false);
  postTimer = new Toggleable('slideUp', true);
  chatBtns = new Toggleable(['btnHidden', 'btnHidden', 'btnHidden', 'btnHidden']);

  toggContainers: any = [
    this.emojiContainer,
    this.shareContainer
  ];

  emoticX = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C'];
  emoticY = ['1F60', '1F61', '1F62', '1F63', '1F64'];
  emojis = [];

  caretPos: number = 0;

  public postMessages: any = [];

  contentBlock: any = undefined;

  public chatUsers: any = {};
  public chatFrontUsers: Array<any> = [];

  public user: any;

  public checkbox: any = {
    facebook: false,
    twitter: true,
    linkedin: false
  };

  public sendError: string;
  public showUserSlider: boolean = false;
  private networkParams: any = {};
  private textStrings: any = {};

  private messageDateTimer = new MessageDateTimer(this.postMessages);

  public hostUrl: string;
  public placeholderText: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public zone: NgZone,
    private cameraPreview: CameraPreview,
    private keyboard: Keyboard,
    // public share: Share,
    public undercoverPrvd: UndercoverProvider,
    public slideAvatarPrvd: SlideAvatar,
    public toolsPrvd: Tools,
    public authPrvd: Auth,
    public cameraPrvd: Camera,
    public chatPrvd: Chat,
    public networkPrvd: Network,
    public gpsPrvd: Gps,
    public plt: Platform,
    public modalCtrl: ModalController
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
      this.chatPrvd.postBtn.setState(true);
      if (this.plt.is('ios')) {
        let footerEl = document.getElementsByClassName('chatFooter')['0'];
        let scrollEl = document.getElementsByClassName('scroll-content')['0'];
        scrollEl.style.bottom = res.keyboardHeight + 'px';
        footerEl.style.bottom = res.keyboardHeight + 'px';
      }
      setTimeout(() => {
        this.chatPrvd.mainBtn.setState('minimised');
        if (!this.chatPrvd.appendContainer.hidden) {
          this.chatPrvd.mainBtn.setState('above_append');
        }
      }, chatAnim/2 + 1);
    }, err => {
      console.log(err);
    });

    this.keyboard.onKeyboardHide().subscribe(res => {
      console.log(res);
      this.chatPrvd.postBtn.setState(false);
      if (this.plt.is('ios')) {
        let footerEl = document.getElementsByClassName('chatFooter')['0'];
        let scrollEl = document.getElementsByClassName('scroll-content')['0'];
        footerEl.style.bottom = '0';
        scrollEl.style.bottom = '0';
      }
      setTimeout(() => {
        if (!this.chatPrvd.appendContainer.hidden) {
          this.chatPrvd.mainBtn.setState('above_append');
        }
        if (this.chatPrvd.appendContainer.hidden) {
          this.chatPrvd.mainBtn.setState('normal');
        }
      }, chatAnim/2 + 1);

    }, err => {
      console.log(err);
    });

    this.user = this.authPrvd.getAuthData();
    if (!this.user) this.user = {
      avatar_content_type: null,
      avatar_file_name: null,
      avatar_file_size: null,
      avatar_updated_at: null,
      avatar_url: null,
      created_at: "2017-04-22T14:59:29.921Z",
      date_of_birthday: "2004-01-01",
      email: "olbachinskiy2@gmail.com",
      first_name: 'Oleksandr',
      id: 55,
      invitation_sent: false,
      last_name: 'Bachynskyi',
      phone: "1492873128682",
      provider_id: null,
      provider_name: null,
      role_description: null,
      role_image_url: null,
      role_name: null,
      updated_at: "2017-04-22T14:59:29.921Z",
    }

    if (!this.user.avatar_url) this.user.avatar_url = this.toolsPrvd.defaultAvatar;
    if (!this.user.role_image_url) this.user.role_image_url = this.toolsPrvd.defaultAvatar;
    this.textStrings.sendError = 'Error sending message';
    this.textStrings.noNetwork = 'Netwrk not found';

    let action = this.navParams.get('action');
    if (action) {
      this.chatPrvd.setState(action);
      this.isUndercover = this.undercoverPrvd.setUndercover(action == 'undercover');
    } else {
      this.isUndercover = this.undercoverPrvd.setUndercover(this.chatPrvd.getState() == 'undercover');
    }
    this.changePlaceholderText();
    this.showUsers();

    this.networkParams = { post_code: this.gpsPrvd.zipCode };
    this.hostUrl = this.chatPrvd.hostUrl;

    this.gpsPrvd.changeZipCallback = this.changeZipCallback.bind(this);
  }

  private changePlaceholderText() {
    this.placeholderText = this.isUndercover ? 'On your location...' : 'Share with your area';
  }

  generateEmoticons() {
    for (let i = 0; i < this.emoticX.length; i++) {
      for (let j = 0; j < this.emoticY.length; j++) {
        this.emojis.push('0x' + this.emoticY[j].concat(this.emoticX[i]));
      }
    }
  }

  openCamera() {
    this.mainInput.setState('fadeOutfast');
    setTimeout(() => {
      this.mainInput.hide();
      this.chatPrvd.mainBtn.setState('minimisedForCamera');
      setTimeout(() => {
        this.chatPrvd.mainBtn.hide();
        this.toolsPrvd.pushPage(CameraPage);
      }, chatAnim/2);
    }, animSpeed.fadeIn/2);
  }

  toggleChatOptions() {
    this.chatOptions.setState((this.chatOptions.getState() == 'spined') ? 'default' : 'spined');
    this.bgState.setState((this.bgState.getState() == 'stretched') ? 'compressed' : 'stretched');

    if (this.bgState.getState() == 'stretched') {
      this.chatPrvd.postBtn.setState(false);
      for (let i = 0; i < this.chatBtns.state.length; i++) {
        setTimeout(() => {
          this.chatBtns.state[i] = 'btnShown';
        }, chatAnim/3 + (i*50));
      }
    } else {
      if (this.cameraPrvd.takenPictures.length > 0) {
        this.chatPrvd.postBtn.setState(true);
      }
      for (let i = 0; i < this.chatBtns.state.length; i++) {
        this.chatBtns.state[i] = 'btnHidden';
      }
    }
  }

  setContentPadding(status){
    status
      ? this.contentBlock.style.padding = '0 0 ' + document.documentElement.clientHeight/2 + 'px'
      : this.contentBlock.style.padding = '0 0 200px';
  }

  toggleContainer(container, visibility) {
    if (visibility == 'hide') {
      if (this.chatPrvd.appendContainer.hidden) {
        this.chatPrvd.mainBtn.setState('normal');
      } else {
        this.chatPrvd.mainBtn.setState('above_append');
      }
      container.setState('off');
      this.setContentPadding(false);
      setTimeout(() => {
        container.hide();
      }, chatAnim/2);
    }

    if (!visibility) {
      if (container.hidden) {
        this.chatPrvd.mainBtn.setState('moved-n-scaled');
        container.show();
        container.setState('on');
        this.setContentPadding(true);
        for (let i = 0; i < this.toggContainers.length; i++) {
          if (!this.toggContainers[i].hidden &&
            container != this.toggContainers[i]){
              this.toggContainers[i].setState('off');
            setTimeout(() => {
              this.toggContainers[i].hide();
            }, chatAnim/2);
          }
        }
      } else {
        this.setContentPadding(false);
        if (this.chatPrvd.appendContainer.hidden) {
          this.chatPrvd.mainBtn.setState('normal');
        } else {
          this.chatPrvd.mainBtn.setState('above_append');
        }
        container.setState('off');
        setTimeout(() => {
          container.hide();
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
    let publicUser: boolean;
    if (!this.isUndercover) {
      publicUser = true;
    } else {
      publicUser = this.undercoverPrvd.profileType === 'public' ? true : false;
    };
    let message = {
      text: this.txtIn.value,
      images: [],
      created_at: null,
      dateStr: '',
      image_urls: [],
      public: publicUser,
      avatar_url: this.user.avatar_url,
      role_image_url: this.user.role_image_url,
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
          undercover: this.isUndercover,
          public: message.public,
          avatar_url: this.user.avatar_url,
          role_image_url: this.user.role_image_url,
        }

        console.log(data);

        this.chatPrvd.sendMessage(data);
          // .subscribe(res => {
          //   console.log(res);
          //   console.log('created_at:', res.created_at);
          // }, err => {
          //   console.log(err);
          //   this.toolsPrvd.showToast(this.textStrings.sendError);
          // });
      }

      setTimeout(() => {
        if (message.text.trim() != '' || message.images.length > 0) {
          message.created_at = moment();
          message.dateStr = 'a moment ago';
          message.image_urls = message.images;
          this.txtIn.value = '';
          this.chatPrvd.mainBtn.setState('normal');
          this.chatPrvd.postBtn.setState(false);
          if (this.postTimer.isVisible()) {
            setTimeout(() => {
              this.postTimer.hide();
            }, chatAnim/2);
            this.postTimer.setState('slideUp');
          }
          this.postMessages.push(message);
        }
      }, 100);

      this.chatPrvd.appendContainer.setState('off');
      setTimeout(() => {
        this.chatPrvd.appendContainer.hide();
      }, chatAnim/2);

      this.content.scrollTo(0, this.content.getContentDimensions().scrollHeight, 100);
      this.cameraPrvd.takenPictures = [];
    }
  }

  calculateInputChar(inputEl) {
    this.chatPrvd.postBtn.setState(inputEl.value.trim().length > 0 ? true : false);
  }

  getCaretPos(oField) {
    if (oField.selectionStart || oField.selectionStart == '0')
      this.caretPos = oField.selectionStart;
  }

  goToProfile(profileId?: number) {
    if (!profileId) profileId = this.authPrvd.getAuthData().id;
    this.toolsPrvd.pushPage(ProfilePage, { id: profileId });
  }

  goUndercover() {
    if (this.isUndercover && !this.chatPrvd.getNetwork()) {
      this.toolsPrvd.showToast(this.textStrings.noNetwork);
      return;
    }

    this.isUndercover = this.undercoverPrvd.setUndercover(!this.isUndercover);
    this.changePlaceholderText();
    this.showMessages();
    setTimeout(() => {
      if (this.isUndercover) {
        this.slideAvatarPrvd.sliderInit();
        this.slideAvatarPrvd.setSliderPosition(this.isUndercover);
      }
      this.showUsers();
      this.content.resize();
    }, 100);
  }

  toggleShareSlider(mess){
    this.checkbox[mess] = !this.checkbox[mess];
  }

  changeCallback(positionLeft?: boolean) {
    this.zone.run(() => {
      this.undercoverPrvd.profileType = positionLeft ? 'public' : 'undercover';
    });
  }

  removeAppendedImage(ind) {
    this.cameraPrvd.takenPictures.splice(ind, 1);
    if (this.cameraPrvd.takenPictures.length == 0) {
      this.chatPrvd.mainBtn.setState('normal');
      this.chatPrvd.appendContainer.setState('off');
      if (this.txtIn.value.trim().length == 0)
      this.chatPrvd.postBtn.setState(false);
      setTimeout(() => {
        this.chatPrvd.appendContainer.hide();
      }, chatAnim/2);
    }
  }

  togglePostTimer() {
    if (this.postTimer.isVisible()) {
      setTimeout(() => {
        this.postTimer.hide();
      }, chatAnim/2);
      this.postTimer.setState('slideUp');
    } else {
      this.postTimer.show();
      this.postTimer.setState('slideDown');
    }
  }

  setPostTimer() {
    this.postTimer.setState('slideUp');
    setTimeout(() => {
      this.postTimer.hide();
    }, chatAnim/2);
  }

  private getUsers() {
    this.networkPrvd.getUsers(this.networkParams).subscribe(users => {
      console.log(users);
      if (users) {
        this.chatFrontUsers = users;
        this.chatPrvd.setStorageUsers(users);
        this.chatUsers = this.chatPrvd.users;
        this.showMessages();
      } else {
        this.chatUsers[this.user.id] = this.user;
      }

      console.log(this.chatUsers);
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
      // if () {
      //
      // }
      this.postMessages = this.chatPrvd.organizeMessages(data);
      console.log(this.chatPrvd.users);
      console.log(this.chatUsers);
    }, err => {
      console.log(err);
    })
  }

  private changeZipCallback(params?: any) {
    if (params) {
      this.isUndercover = this.undercoverPrvd.setUndercover(params.undercover);
      if (this.isUndercover) this.goUndercover();
    }
  }

  sendFeedback() {
    let feedData = {
      totalLegendary: 3,
      totalLikes: 45
    };
    this.chatPrvd.mainBtn.setState('minimised');
    let feedbackModal = this.modalCtrl.create(FeedbackModal, { data: feedData });
    setTimeout(() => {
      feedbackModal.present();
    }, chatAnim/2);
  }

  clearMessages() {
    this.postMessages = [];
  }

  ionViewDidEnter() {
    this.mainInput.setState('fadeIn');
    this.mainInput.show();
    this.chatPrvd.mainBtn.setState('normal');
    this.chatPrvd.mainBtn.show();

    this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
    if (this.isUndercover) {
      this.slideAvatarPrvd.sliderInit();
      this.slideAvatarPrvd.setSliderPosition(true);
      this.showUsers();
      this.content.resize();
    }

    this.contentBlock = document.getElementsByClassName('scroll-content')['0'];
    this.setContentPadding(false);
    this.content.scrollTo(0, this.content.getContentDimensions().scrollHeight, 100);

    this.chatPrvd.updateAppendContainer();
    // if (this.cameraPrvd.takenPictures) {
    //   this.postMessage();
    // }

    this.messageDateTimer.enableForceStart = true;
    this.messageDateTimer.enableLogMessages = true;
    this.messageDateTimer.start();
  }

  ionViewDidLoad() {
    console.log('[UNDERCOVER.ts] viewDidLoad');
    this.generateEmoticons();
    this.getUsers();
  }

  ionViewWillLeave() {
    console.log('[UNDERCOVER.ts] viewWillLeave');
    this.messageDateTimer.stop();
  }
}
