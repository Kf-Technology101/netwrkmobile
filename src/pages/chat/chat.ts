import {
  Component,
  ViewChild,
  NgZone,
  HostBinding,
  ElementRef,
  Renderer } from '@angular/core';
import {
  NavController,
  NavParams,
  Content,
  Platform,
  ModalController } from 'ionic-angular';

import { CameraPreview } from '@ionic-native/camera-preview';
// Pages
import { CameraPage } from '../camera/camera';
import { NetworkFindPage } from '../network-find/network-find';
import { ProfilePage } from '../profile/profile';

// Custom libs
import { Toggleable } from '../../includes/toggleable';

// Modals
import { LegendaryModal } from '../../modals/legendaryhistory/legendaryhistory';
import { FeedbackModal } from '../../modals/feedback/feedback';

// Providers
import { Tools } from '../../providers/tools';
import { UndercoverProvider } from '../../providers/undercover';
import { SlideAvatar } from '../../providers/slide-avatar';
// import { Share } from '../../providers/share';
import { Auth } from '../../providers/auth';
import { Camera } from '../../providers/camera';
import { Chat } from '../../providers/chat';
import { NetworkProvider } from '../../providers/network';
import { Gps } from '../../providers/gps';
import { Social } from '../../providers/social';

import { Keyboard } from '@ionic-native/keyboard';

import * as moment from 'moment';
// Sockets
import { Ng2Cable, Broadcaster } from 'ng2-cable/js/index';
import 'rxjs';

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
  selector: 'page-chat',
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
    Ng2Cable,
    Broadcaster
  ]
})

export class ChatPage {
  @HostBinding('class') colorClass = 'transparent-background';

  public isUndercover: boolean;

  @ViewChild('galleryCont') gCont;
  @ViewChild(Content) content: Content;
  @ViewChild('textInput') txtIn;

  shareContainer = new Toggleable('off', true);
  emojiContainer = new Toggleable('off', true);
  mainInput = new Toggleable('fadeIn', false);
  postTimer = new Toggleable('slideUp', true);
  postLock = new Toggleable('slideUp', true);

  flipHover: boolean;

  toggContainers: any = [
    this.emojiContainer,
    this.shareContainer
  ];

  private messagesInterval:any;

  emoticX = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C'];
  emoticY = ['1F60', '1F61', '1F62', '1F63', '1F64'];
  emojis = [];

  caretPos: number = 0;

  public postMessages: any = [];

  contentBlock: any = undefined;

  public chatUsers: any = [];

  public user: any;

  public shareCheckbox: any = {
    facebook: true,
    twitter: false,
    linkedin: false
  };

  public sendError: string;
  private networkParams: any = {};
  private textStrings: any = {};

  public hostUrl: string;
  public placeholderText: string;

  private debug: any = {
    postHangTime: 0,
  };
  private postLockData: any = {
    id: null,
    password: null,
    hint: null,
  };
  private contentPadding: string;
  private contentMargin: string;

  private canRefresh: boolean = false;
  private idList: any = [];
  private messageRefreshInterval: any;
  private socialPosts: Array<any> = [];
  private pageTag: string;

  private authData: any;
  private isFeedbackClickable: boolean = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public zone: NgZone,
    // public share: Share,
    public undercoverPrvd: UndercoverProvider,
    public slideAvatarPrvd: SlideAvatar,
    public toolsPrvd: Tools,
    public authPrvd: Auth,
    public cameraPrvd: Camera,
    public chatPrvd: Chat,
    public networkPrvd: NetworkProvider,
    public gpsPrvd: Gps,
    public plt: Platform,
    public socialPrvd: Social,
    public elRef: ElementRef,
    public modalCtrl: ModalController,
    private cameraPreview: CameraPreview,
    private ng2cable: Ng2Cable,
    private broadcaster: Broadcaster,
    private keyboard: Keyboard,
    private renderer: Renderer
  ) {

    this.pageTag = elRef.nativeElement.tagName.toLowerCase();
    this.keyboard.disableScroll(true);
    this.authData = this.authPrvd.getAuthData();

    let channel = 'ChatChannel';
    let lobby = 'messages' + this.gpsPrvd.zipCode + 'chat';

    // console.log('[SOCKET] lobby:', lobby);

    this.ng2cable.subscribe(this.chatPrvd.hostUrl + '/cable', {
      channel: <string> channel,
      post_code: this.gpsPrvd.zipCode
    });

    this.broadcaster.on<any>(channel).subscribe(
      data => {
        // console.log('[SOCKET] Message received:', data);
        let insideUndercover = this.gpsPrvd
        .calculateDistance({
          lat: <number> parseFloat(data.message.lat),
          lng: <number> parseFloat(data.message.lng)
        });
        if (this.isUndercover) {
          if (data.message.undercover && insideUndercover) {
            this.postMessages.push(data.message);
            // this.chatPrvd.playSound('message');
            this.chatPrvd.messageDateTimer.start(this.postMessages);
            // this.txtIn.value = '';
          }
        } else if (!this.isUndercover && !data.message.undercover) {
          this.postMessages.push(data.message);
          // this.chatPrvd.playSound('message');
          this.chatPrvd.messageDateTimer.start(this.postMessages);
          // this.txtIn.value = '';
        }
    }, err => {
      // console.error('[SOCKET] Message error:', err);
    });

    this.broadcaster.on<any>(lobby).subscribe(
      data => {
        // console.log('[SOCKET] lobby:', data);
      }, err => {
        // console.error('[SOCKET] lobby error:', err);
      }
    );

    this.keyboard.onKeyboardShow().subscribe(res => {
      // console.log('[onKeyboardShow]');
      // console.log(res);
      this.chatPrvd.postBtn.setState(true);
      if (this.plt.is('ios')) {
        try {
          let footerEl = document.getElementsByClassName('chatFooter')['0'];
          let scrollEl = document.getElementsByClassName('scroll-content')['0'];
          scrollEl.style.bottom = res.keyboardHeight + 'px';
          // scrollEl.style.margin = '0px 0px ' + res.keyboardHeight + 70 + 'px 0px';
          footerEl.style.bottom = res.keyboardHeight + 'px';

          this.contentMargin = res.keyboardHeight + 70 + 'px';
          this.isFeedbackClickable = false;
        } catch (e) {
          console.log(e);
        }
      }
      this.chatPrvd.mainBtn.setState('minimised');
      if (!this.chatPrvd.appendContainer.hidden) {
        this.chatPrvd.mainBtn.setState('above_append');
      }
      this.chatPrvd.scrollToBottom(this.content);
      // setTimeout(() => {
      // }, chatAnim / 2 + 1);
    }, err => {
      // console.log(err);
    });

    this.keyboard.onKeyboardHide().subscribe(res => {
      // console.log(res);
      if (this.plt.is('ios')) {
        try {
          let footerEl = document.getElementsByClassName('chatFooter')['0'];
          let scrollEl = document.getElementsByClassName('scroll-content')['0'];
          footerEl.style.bottom = '0';
          // scrollEl.style.margin = '0px 0px 70px 0px';
          scrollEl.style.bottom = '0';

          this.contentMargin = null;
          this.isFeedbackClickable = true;
        } catch (e) {
          console.log('on-keyboard-show error:', e);
        }
      }
      // setTimeout(() => {
      if (!this.chatPrvd.appendContainer.hidden) {
        this.chatPrvd.mainBtn.setState('above_append');
      }
      if (this.chatPrvd.appendContainer.hidden) {
        this.chatPrvd.mainBtn.setState('normal');
      }
      if (this.txtIn.value.trim() == '' &&
          !this.chatPrvd.appendContainer.isVisible()) {
        this.chatPrvd.postBtn.setState(false);
      }
      // }, chatAnim/2 + 1);

    }, err => {
      // console.log(err);
    });

    this.user = this.authPrvd.getAuthData();
    if (!this.user)
      this.user = {
        avatar_content_type: null,
        avatar_file_name: null,
        avatar_file_size: null,
        avatar_updated_at: null,
        avatar_url: null,
        created_at: '2017-04-22T14:59:29.921Z',
        date_of_birthday: '2004-01-01',
        email: 'olbachinskiy2@gmail.com',
        name: 'Oleksandr Bachynskyi',
        id: 55,
        invitation_sent: false,
        phone: '1492873128682',
        provider_id: null,
        provider_name: null,
        role_description: null,
        role_image_url: null,
        role_name: null,
        hero_avatar_url: null,
        updated_at: '2017-04-22T14:59:29.921Z',
      }

    if (!this.user.role_image_url) this.user.role_image_url = this.toolsPrvd.defaultAvatar;
    this.textStrings.sendError = 'Error sending message';
    this.textStrings.noNetwork = 'Netwrk not found';
    this.textStrings.require = 'Please fill all fields';

    let action = this.navParams.get('action');
    if (action) {
      this.chatPrvd.setState(action);
      this.isUndercover = this.undercoverPrvd.setUndercover(action == 'undercover');
    } else {
      this.isUndercover = this.undercoverPrvd.setUndercover(this.chatPrvd.getState() == 'undercover');
    }

    this.flipHover = this.isUndercover ? true : false;

    let cameraOptions = this.cameraPrvd.getCameraOpt({ tapPhoto: false });
    this.cameraPreview.startCamera(cameraOptions).then(res => {
      // console.log(res);
      if (this.isUndercover) {
        this.cameraPreview.show();
      } else {
        this.cameraPreview.hide();
      }
    }, err => {
      // console.log(err);
    });

    this.changePlaceholderText();

    this.networkParams = { post_code: this.gpsPrvd.zipCode };
    this.hostUrl = this.chatPrvd.hostUrl;

    this.gpsPrvd.changeZipCallback = this.changeZipCallback.bind(this);

    this.gpsPrvd.getMyZipCode().then(zipRes => {
      // console.log('[ChatPage][zipRes] - ', zipRes);
    }).catch(err => {
      // console.log('[ChatPage][zipRes] err - ', err);
    })
  }


  public toggleChatOptions() {
    this.chatPrvd.plusBtn.setState((this.chatPrvd.plusBtn.getState() == 'spined') ? 'default' : 'spined');
    this.chatPrvd.bgState.setState((this.chatPrvd.bgState.getState() == 'stretched') ? 'compressed' : 'stretched');

    if (this.chatPrvd.bgState.getState() == 'stretched') {
      this.chatPrvd.postBtn.setState(false);
      for (let i = 0; i < this.chatPrvd.chatBtns.state.length; i++) {
        setTimeout(() => {
          this.chatPrvd.chatBtns.state[i] = 'btnShown';
        }, chatAnim/3 + (i*50));
      }
    } else {
      if (this.txtIn.value.trim() != '' ||
          this.cameraPrvd.takenPictures.length > 0) {
        this.chatPrvd.postBtn.setState(true);
      }
      for (let i = 0; i < this.chatPrvd.chatBtns.state.length; i++) {
        this.chatPrvd.chatBtns.state[i] = 'btnHidden';
      }
    }
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

  setContentPadding(status) {
    // console.log(document.documentElement.clientHeight + '');
    try {
      this.contentPadding = status
        ? document.documentElement.clientHeight / 2 + 76 + 'px'
        : '130px';
      this.chatPrvd.scrollToBottom(this.content);
    } catch (e) {
      console.log(e);
    }
  }

  toggleContainer(container, visibility?: string, name?: string) {
    if (visibility == 'hide') {
      // this.setContentPadding(false);

      if (this.chatPrvd.appendContainer.hidden) {
        this.chatPrvd.mainBtn.setState('normal');
      } else {
        this.chatPrvd.mainBtn.setState('above_append');
      }

      container.setState('off');
      this.setContentPadding(false);
      setTimeout(() => {
        container.hide();
        this.socialPosts = [];
      }, chatAnim / 2);
    }

    if (!visibility) {
      if (container.hidden) {
        // console.log('setContentPadding', true);
        this.chatPrvd.mainBtn.setState('moved-n-scaled');

        container.show();
        container.setState('on');
        this.setContentPadding(true);

        for (let i = 0; i < this.toggContainers.length; i++) {
          if (!this.toggContainers[i].hidden &&
            container != this.toggContainers[i]) {
              this.toggContainers[i].setState('off');
            setTimeout(() => {
              this.toggContainers[i].hide();
            }, chatAnim / 2);
          }
        }

        if (name && name == 'shareContainer') this.getSocialPosts();
      } else {
        // console.log('setContentPadding', false);
        this.setContentPadding(false);

        if (this.chatPrvd.appendContainer.hidden) {
          this.chatPrvd.mainBtn.setState('normal');
        } else {
          this.chatPrvd.mainBtn.setState('above_append');
        }

        container.setState('off');
        setTimeout(() => {
          container.hide();
          this.socialPosts = [];
        }, chatAnim / 2);

      }
    }
  }

  insertEmoji(emoji) {
    // console.log(this.txtIn);
    // this.txtIn.nativeElement.focus();
    let emojiDecoded = String.fromCodePoint(emoji);
    this.postMessage(emojiDecoded);
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

  sendLockInfo (form: any) {
    if (form.invalid) {
      this.toolsPrvd.showToast(this.textStrings.require);
    } else {
      this.hideTopSlider('lock');
      this.postMessage();
    }
  }

  postMessageFromSocial(post) {
    let params: any = {
      text: post.message || '',
      social_urls: post.full_picture ? [post.full_picture] : [],
      social: post.type,
    }

    this.postMessage(null, params);
  }

  updatePost(data: any, message?:any, emoji?:any) {
    // console.log(data);
    if (!emoji) {
      this.txtIn.value = '';
      if (!data.social)
        this.chatPrvd.mainBtn.setState('normal');
      this.chatPrvd.postBtn.setState(false);

      if (this.postTimer.isVisible()) {
        setTimeout(() => {
          this.postTimer.hide();
        }, chatAnim/2);
        this.postTimer.setState('slideUp');
      }
      if (this.debug.postHangTime != 0) {
        this.debug.postHangTime = 0;
      }
    }
    this.canRefresh = false;
    // this.postMessages.push(data);
    this.chatPrvd.scrollToBottom(this.content);
  }

  postMessage(emoji?: string, params?: any) {
    try {
      let publicUser: boolean;
      let images = [];
      let messageParams: any;
      let message: any = {};

      if (!this.isUndercover) {
        publicUser = true;
      } else {
        publicUser = this.slideAvatarPrvd.sliderPosition == 'left' ? true : false;
      }

      if (this.cameraPrvd.takenPictures) images = this.cameraPrvd.takenPictures;

      messageParams = {
        text: emoji ?  emoji : this.txtIn.value,
        user_id: this.authData ? this.authData.id : 0,
        images: emoji ? [] : images,
        undercover: this.isUndercover,
        public: publicUser,
        is_emoji: emoji ? true : false
      };

      if (params) Object.assign(messageParams, params);

      // console.log('[ChatPage][messageParams]', messageParams);

      message = Object.assign(message, messageParams);

      let imageUrls = emoji ? [] : images;

      message.image_urls = messageParams.social_urls
        ? messageParams.social_urls : imageUrls;
      message.isTemporary = false;
      message.temporaryFor = 0;

      if ((message.text && message.text.trim() != '')
        || (message.images && message.images.length > 0)
        || (message.social_urls && message.social_urls.length > 0)) {
        // console.log(messageParams);

        this.chatPrvd.sendMessage(messageParams).then(res => {
          // console.log('[sendMessage] res:', res);

          if (this.postLockData.hint && this.postLockData.password) {
            let lockObj:any = {
              id: res.id,
              hint: this.postLockData.hint,
              password: this.postLockData.password
            }

            this.chatPrvd.lockMessage(lockObj).subscribe(lockRes => {
              // console.log('[lock] res:', lockRes);
              this.updatePost(lockRes, message, emoji);
              this.postLockData = {
                id: null,
                hint: null,
                password: null
              }
            }, lockErr => {
              // console.log('[lock] err:', lockErr);
            });
          } else {
            this.updatePost(res, message, emoji);
          }
        }).catch(err => {
          // console.log(err);
          this.updatePost(err, message);
        });
        if (!emoji) {
          this.chatPrvd.appendContainer.setState('off');
          setTimeout(() => {
            this.chatPrvd.appendContainer.hide();
          }, chatAnim/2);
          this.cameraPrvd.takenPictures = [];
        }
      }
    } catch (e) {
      // console.error('Error in postMessage', e);
    }
  }

  calculateInputChar(inputEl) {
    this.chatPrvd.postBtn.setState(inputEl.value.trim().length > 0 ? true : false);
  }

  getCaretPos(oField) {
    if (oField.selectionStart || oField.selectionStart == '0')
      this.caretPos = oField.selectionStart;
  }

  updateMessagesAndScrollDown(scroll?:string) {
    this.chatPrvd.showMessages(this.postMessages, 'chat', this.isUndercover).then(res => {
      this.postMessages = res.messages;
      res.callback(this.postMessages);
      if (scroll) {
        this.chatPrvd.scrollToBottom(this.content);
      }
    });
  }

  openFeedbackModal(messageData: any, mIndex: number) {
    this.toolsPrvd.showLoader();
    this.chatPrvd.sendFeedback(messageData, mIndex).then(res => {
      let feedbackModal = this.modalCtrl.create(FeedbackModal, res);
      feedbackModal.onDidDismiss(data => {
        if (data) {
          if (data.like) {
            this.postMessages[mIndex].likes_count = data.like.total;
            this.postMessages[mIndex].like_by_user = data.like.isActive;
          }
          if (data.legendary) {
            this.postMessages[mIndex].legendary_count = data.legendary.total;
            this.postMessages[mIndex].legendary_by_user = data.legendary.isActive;
          }
          if (data.isBlocked) {
            this.updateMessagesAndScrollDown();
          }
        } else {
          // console.warn('[likeClose] Error, no data returned');
        }
      });
      setTimeout(() => {
        feedbackModal.present();
      }, chatAnim/2);
    })
  }

  goToLegendaryList() {
    // console.log('goToLegendaryList()');
    let netwrkId = this.networkPrvd.getNetworkId();
    // console.log('netwrkId:', netwrkId);
    let legModal = this.modalCtrl.create(LegendaryModal,
    {
      netwrk_id: netwrkId
    });
    // console.log('goToLegendaryList() -> present()...');
    legModal.present();
  }

  goUndercover(event?:any) {
    if (event) {
      event.stopPropagation();
      this.chatPrvd.isMessagesVisible = false;
      this.postMessages = [];
    }
    // Disable main button on view load
    this.chatPrvd.isMainBtnDisabled = true;

    let network = this.chatPrvd.getNetwork();
    if (this.isUndercover && (!network || network.users_count < 10)) {
      this.toolsPrvd.pushPage(NetworkFindPage);
      // Enable main button after view loaded
      this.chatPrvd.isMainBtnDisabled = false;
      return;
    }

    // this.toolsPrvd.showLoader();
    this.isUndercover = this.undercoverPrvd.setUndercover(!this.isUndercover);
    this.flipInput();
    this.changePlaceholderText();
    this.toolsPrvd.hideLoader();
    this.toolsPrvd.showLoader();
    setTimeout(() => {
      if (this.isUndercover) {
        this.chatPrvd.setState('undercover');
        this.cameraPreview.show();
        this.slideAvatarPrvd.sliderInit(this.pageTag, this.isUndercover);
        this.startMessageUpdateTimer();
      } else {
        this.chatPrvd.setState('area');
        this.cameraPreview.hide();
        this.updateMessagesAndScrollDown('scroll');
      }
      this.content.resize();
      // this.startMessageUpdateTimer();

    }, 1);
  }

  toggleShareSlider(mess){
    this.shareCheckbox[mess] = !this.shareCheckbox[mess];
    this.getSocialPosts();
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

  getTopSlider(container) {
    let cont;
    switch (container) {
      case 'timer':
        cont = this.postTimer;
      break;
      case 'lock':
        cont = this.postLock;
      break;
    }
    return cont;
  }

  hideTopSlider(container) {
    let cont = this.getTopSlider(container);
    if (cont.isVisible()) {
      cont.setState('slideUp');
      setTimeout(() => {
        cont.hide();
      }, chatAnim/2);
      cont.setState('slideUp');
    }
  }

  toggleTopSlider(container) {
    let cont = this.getTopSlider(container);
    if (cont.isVisible()) {
      setTimeout(() => {
        cont.hide();
      }, chatAnim/2);
      cont.setState('slideUp');
    } else {
      cont.show();
      cont.setState('slideDown');
    }
  }

  setPostTimer(total:number, time?:string) {
    if (time) {
      this.debug.postHangTime = total + time;
    } else {
      this.debug.postHangTime = total;
    }
    this.hideTopSlider('timer');
  }

  joinToNetwork() {
    // this.toolsPrvd.showLoader();
    this.networkPrvd.join(this.networkParams).subscribe(res => {
      // console.log(res);
      this.getUsers();
      // this.toolsPrvd.hideLoader();
    }, err => {
      // console.log(err);
      // this.toolsPrvd.hideLoader();
    });
  }

  private getSocialPosts() {
    this.socialPosts = [];
    if (this.shareCheckbox.facebook) {
      this.socialPrvd.getFbUserPosts(this.user.provider_id).then(posts => {
        // console.log('[ChatPage][getSocialPosts]', posts.data);
        for (let post of posts.data) {
          let fbPost = post;
          fbPost.type = 'facebook';
          this.socialPosts.push(fbPost);
        }
      }).catch(err => {
      //console.log(err);
    });
    }
  }

  private getUsers() {
    this.toolsPrvd.showLoader();
    this.networkPrvd.getUsers(this.networkParams).subscribe(users => {
      // console.log(users);
      if (users) {
        this.chatPrvd.setStorageUsers(users);
        this.chatUsers = users;
        // this.startMessageUpdateTimer();
      } else {
        this.chatUsers.push(this.user);
      }


      // console.log(this.chatUsers, this.user, this.chatUsers[this.user.is]);
      this.toolsPrvd.hideLoader();
    }, err => {
      // console.log(err);
      this.toolsPrvd.hideLoader();
    });
  }

  refreshChat(refresher) {
    // console.log('Begin async operation', refresher);
    this.chatPrvd.getMessages(this.isUndercover, this.postMessages, null, true)
    .subscribe(res => {
      // console.log('[REFRESHER] postMessages:', this.postMessages);
      // console.log('[REFRESHER] res:', res);
      res = this.chatPrvd.organizeMessages(res.messages);
      for (let i in res) {
        this.postMessages.unshift(res[i]);
      }
      this.chatPrvd.messageDateTimer.start(this.postMessages);
      refresher.complete();
    }, err => {
      refresher.complete();
      // console.error('[getMessages] Err:', err);
    });
  }

  sortById(messageA, messageB) {
    return messageA.id - messageB.id;
  }

  private getAndUpdateUndercoverMessages() {
    this.chatPrvd.isMainBtnDisabled = false;
    this.chatPrvd.getMessages(this.isUndercover, this.postMessages)
    .subscribe(res => {
      // console.log('[sendMessagesIds] res:', res);
      if (res.ids_to_remove && res.ids_to_remove.length > 0) {
        for (let i in this.postMessages) {
          for (let j in res.ids_to_remove) {
            if (this.postMessages[i].id == res.ids_to_remove[j]) {
              this.postMessages.splice(i, 1);
            }
          }
        }
      }

      if (res.messages && res.messages.length > 0) {
        this.postMessages = this.postMessages.concat(res.messages);
        this.postMessages.sort(this.sortById);
        this.chatPrvd.messageDateTimer.start(this.postMessages);
        // console.log('messages after sort:', this.postMessages);
      }
    }, err => {
      // console.error('[sendMessagesIds] error:', err);
    });
  }

  private startMessageUpdateTimer() {
    if (this.messagesInterval) clearInterval(this.messagesInterval);
    if (this.messageRefreshInterval) clearTimeout(this.messageRefreshInterval);
    if (this.chatPrvd.getState() != 'area') {
      this.getAndUpdateUndercoverMessages();
      this.messagesInterval = setInterval(() => {
        // console.log('[messageTimer] starting interval...');
        // this.updateMessagesAndScrollDown();
        this.getAndUpdateUndercoverMessages();
      }, 10000);
    }
  }

  private changeZipCallback(params?: any) {
    if (params) {
      this.isUndercover = this.undercoverPrvd.setUndercover(params.undercover);
      if (this.isUndercover) this.goUndercover();
    }
  }

  private getMessagesIds(messageArray: any) {
    let idList = [];
    for (let m in messageArray) {
      idList.push(messageArray[m].id);
    }
    return idList;
  }

  private sendDeletedMessages() {
    // this.idList
    this.chatPrvd.deleteMessages().subscribe( res => {
      // console.log('[sendDeletedMessages] Success:', res);
      // this.postMessages = res ? res : [];
    }, err => {
      // console.log('[sendDeletedMessages] Error:', err);
    });
  }

  clearMessages() {
    if (this.messagesInterval) clearInterval(this.messagesInterval);
    if (this.messageRefreshInterval) clearTimeout(this.messageRefreshInterval);
    this.canRefresh = true;
    this.idList = this.getMessagesIds(this.postMessages);
    this.postMessages = [];
    this.messageRefreshInterval = setTimeout(() => {
      this.canRefresh = false;
      this.sendDeletedMessages();
      // this.startMessageUpdateTimer();
    }, 10000);
  }

  flipInput() {
    this.flipHover = !this.flipHover;
  }

  ionViewDidEnter() {
    this.chatPrvd.isMessagesVisible = false;
    this.chatPrvd.loadedImages = 0;
    this.chatPrvd.imagesToLoad = 0;
    this.mainInput.setState('fadeIn');
    this.mainInput.show();
    this.chatPrvd.mainBtn.setState('normal');
    this.chatPrvd.mainBtn.show();

    this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
    if (this.isUndercover) {
      let position = this.slideAvatarPrvd.sliderPosition ? null : true;
      // console.log('[ChatPage][ionViewDidEnter]', position);
      this.slideAvatarPrvd.sliderInit(this.pageTag, position);
      this.content.resize();
    }

    // this.contentBlock = document.getElementsByClassName('scroll-content')['0'];
    this.setContentPadding(false);

    this.toggleContainer(this.emojiContainer, 'hide');
    this.toggleContainer(this.shareContainer, 'hide');
    this.chatPrvd.updateAppendContainer();

    this.user = this.authPrvd.getAuthData();

    this.gpsPrvd.getNetwrk(this.gpsPrvd.zipCode).subscribe(res => {
      this.chatPrvd.saveNetwork(res.network);
    });

    // if (this.chatPrvd.getState() == 'area')
    //   this.updateMessagesAndScrollDown();
    // else
    if (this.chatPrvd.getState() == 'undercover')
      this.startMessageUpdateTimer();

    this.zone.run(() => {
      this.undercoverPrvd.profileType = this.undercoverPrvd.profileType;
    });
  }

  goToProfile(profileId?: number, profileTypePublic?: boolean) {
    this.chatPrvd.goToProfile(profileId, profileTypePublic).then(res => {
      this.toolsPrvd.pushPage(ProfilePage, res);
    });
  }

  ionViewDidLoad() {
    // console.log('[UNDERCOVER.ts] viewDidLoad');
    this.chatPrvd.messageDateTimer.enableLogMessages = true;
    this.generateEmoticons();
    this.getUsers();
  }

  ionViewWillLeave() {
    // console.log('[UNDERCOVER.ts] viewWillLeave');
    this.chatPrvd.messageDateTimer.stop();
    if (this.messagesInterval) clearInterval(this.messagesInterval);
    if (this.messageRefreshInterval) clearTimeout(this.messageRefreshInterval);
    if (this.idList && this.idList.length > 0) {
      this.canRefresh = false;
      this.sendDeletedMessages();
      // this.startMessageUpdateTimer();
    }
    this.slideAvatarPrvd.changeCallback = null;
  }
}
