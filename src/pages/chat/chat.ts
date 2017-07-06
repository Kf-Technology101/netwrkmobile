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
  ModalController,
  AlertController,
  Config,
  Events
   } from 'ionic-angular';

import { CameraPreview } from '@ionic-native/camera-preview';
// Pages
import { CameraPage } from '../camera/camera';
import { NetworkFindPage } from '../network-find/network-find';
import { ProfilePage } from '../profile/profile';
import { NetworkNoPage } from '../network-no/network-no';

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
import { NetworkProvider } from '../../providers/networkservice';
import { Gps } from '../../providers/gps';
import { Social } from '../../providers/social';

import { Keyboard } from '@ionic-native/keyboard';

import * as moment from 'moment';
// Sockets
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
  slideToggle,
  toggleUcSlider
} from '../../includes/animations';

import { ModalRTLEnterAnimation } from '../../includes/rtl-enter.transition';
import { ModalRTLLeaveAnimation } from '../../includes/rtl-leave.transition';

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
    slideToggle,
    toggleUcSlider
  ]
})

export class ChatPage {
  private componentLoaded:boolean = false;

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
  topSlider = new Toggleable('slideDown', false);
  postUnlock  = new Toggleable('slideUp', true);

  flipHover: boolean;

  toggContainers: any = [
    this.emojiContainer,
    this.shareContainer
  ];
  private messagesInterval:any;

  public isSocialPostsLoaded:boolean = false;

  emoticX = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C'];
  emoticY = ['1F60', '1F61', '1F62', '1F63', '1F64'];
  emojis = [];

  caretPos: number = 0;

  contentBlock: any = undefined;

  public chatUsers: any = [];

  public user: any;

  public shareCheckbox: any = {
    facebook: true,
    twitter: false,
    linkedin: false
  };

  private postLoaded:boolean = false;
  private postLoading:boolean = false;

  public sendError: string;
  private networkParams: any = {};
  private textStrings: any = {};

  public hostUrl: string;
  public placeholderText: string;

  private debug: any = {
    postHangTime: 0,
  };
  private postLockData: any = {
    password: null,
    hint: null,
  };
  private contentPadding: string;
  private contentMargin: string;

  private canRefresh: boolean = true;
  private idList: any = [];
  private messageRefreshInterval: any;
  private socialPosts: Array<any> = [];
  private pageTag: string;

  private authData: any;
  private isFeedbackClickable: boolean = true;

  private postTimerObj:any = {
    expireDate: null,
    time: null
  };

  private socialLoaderHidden:boolean = false;

  private postUnlockData:any = {
    id: null,
    password: null
  }

  private currentHint:any;

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
    private alertCtrl: AlertController,
    private cameraPreview: CameraPreview,
    private keyboard: Keyboard,
    private renderer: Renderer,
    public config: Config,
    public events: Events
  ) {
    console.warn('[CHAT] Constructor');
  }

  private setCustomTransitions() {
    this.config.setTransition('modal-slide-left', ModalRTLEnterAnimation);
    this.config.setTransition('modal-slide-right', ModalRTLLeaveAnimation);
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
    this.placeholderText = this.isUndercover ? 'Add to this location only...' : 'Share with the area...';
  }

  generateEmoticons() {
    for (let i = 0; i < this.emoticX.length; i++) {
      for (let j = 0; j < this.emoticY.length; j++) {
        this.emojis.push('0x' + this.emoticY[j].concat(this.emoticX[i]));
      }
    }
  }

  openCamera() {
    this.toggleContainer(this.emojiContainer, 'hide');
    this.toggleContainer(this.shareContainer, 'hide');
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
        : '180px';
      if (this.chatPrvd.getState() != 'area')
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
    let emojiDecoded = String.fromCodePoint(emoji);
    this.postMessage(emojiDecoded);
  }

  convertEmoji(unicode) {
    return String.fromCodePoint(unicode);
  }

  sendLockInfo (event:any, form: any):void {
    event.stopPropagation();
    event.preventDefault();

    if (form.invalid) {
      this.toolsPrvd.showToast(this.textStrings.require);
    } else {
      this.hideTopSlider('lock');
      this.postLockData = {
        hint: form.value.hint,
        password: form.value.password
      }
      this.postMessage();
    }
  }

  showUnlockPostForm(messageId:any, hint:any) {
    this.postUnlock.hidden = false;
    this.postUnlock.setState('slideDown');
    this.postUnlockData.id = messageId;
    this.currentHint = hint;
  }

  unlockPost(event:any, form: any):void {
    event.stopPropagation();
    event.preventDefault();

    if (form.invalid) {
      this.toolsPrvd.showToast(this.textStrings.require);
    } else {
      this.postUnlockData.password = form.value.password;
      console.log('postUnlockData:', this.postUnlockData);
      this.chatPrvd.unlockPost(this.postUnlockData).subscribe(res => {
        console.log('unlock post:', res);
        for (let m in this.chatPrvd.postMessages) {
          if (this.chatPrvd.postMessages[m].id == this.postUnlockData.id) {
            this.chatPrvd.postMessages[m].locked_by_user = false;
            break;
          }
        }
        this.postUnlockData.id = null;
        this.postUnlockData.password = null;
        this.hideTopSlider('unlock');
      }, err => {
        this.toolsPrvd.showToast('Wrong password');
        console.error(err);
        this.postUnlockData.id = null;
        this.postUnlockData.password = null;
        this.hideTopSlider('unlock');
      });
    }
  }

  postMessageFromSocial(post) {
    let params: any = {
      text: post.text_with_links || '',
      text_with_links: post.text_with_links || '',
      social_urls: post.full_picture ? [post.full_picture] : [],
      social: post.social,
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
    this.canRefresh = true;
    // this.chatPrvd.postMessages.push(data);
    if (this.chatPrvd.getState() != 'area')
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

      if (this.cameraPrvd.takenPictures) {
        images = this.cameraPrvd.takenPictures;
      }

      messageParams = {
        text: emoji ?  emoji : this.txtIn.value,
        text_with_links: emoji ?  emoji : this.txtIn.value,
        user_id: this.authData ? this.authData.id : 0,
        images: emoji ? [] : images,
        undercover: (this.chatPrvd.getState() == 'area') ? false : this.isUndercover,
        public: publicUser,
        is_emoji: emoji ? true : false,
        locked: (this.postLockData.hint && this.postLockData.password)  ? true : false,
        password: this.postLockData.password ? this.postLockData.password : null,
        hint: this.postLockData.hint ? this.postLockData.hint : null,
        expire_date: this.postTimerObj.expireDate ? this.postTimerObj.expireDate : null
      };

      console.info('[postMessage] params:', messageParams);

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
          console.log('[sendMessage] res:', res);
          this.postLockData.hint = null;
          this.postLockData.password = null;
          this.postTimerObj.expireDate = null;
          this.postTimerObj.time = null;
          this.updatePost(res, message, emoji);
        }).catch(err => {
          console.log(err);
          this.updatePost(err, message);
        });
        if (!emoji) {
          this.chatPrvd.appendContainer.setState('off');
          this.chatPrvd.mainBtn.setState('hidden');
          setTimeout(() => {
            this.chatPrvd.appendContainer.hide();
          }, chatAnim/2);
          this.cameraPrvd.takenPictures = [];
        }
      }
    } catch (e) {
      console.error('Error in postMessage:', e);
    }
  }

  calculateInputChar(inputEl) {
    this.chatPrvd.postBtn.setState(inputEl.value.trim().length > 0 ? true : false);
  }

  getCaretPos(oField) {
    if (oField.selectionStart || oField.selectionStart == '0')
      this.caretPos = oField.selectionStart;
  }

  updateMessagesAndScrollDown(scroll?:boolean):void {
    console.log('(updateMessagesAndScrollDown) isUndercover:', this.isUndercover);
    this.chatPrvd.showMessages(this.chatPrvd.postMessages, 'chat', this.isUndercover).then(res => {
      this.chatPrvd.postMessages = res.messages;
      res.callback(this.chatPrvd.postMessages);
      if (scroll) {
        this.chatPrvd.scrollToBottom(this.content);
      }
    });
  }

  openFeedbackModal(messageData: any, mIndex: number) {
    this.toolsPrvd.showLoader();
    console.log('(openFeedbackModal) messageData:', messageData);
    this.chatPrvd.sendFeedback(messageData, mIndex).then(res => {
      console.log('sendFeedback:', res);
      let feedbackModal = this.modalCtrl.create(FeedbackModal, res);
      feedbackModal.onDidDismiss(data => {
        this.setMainBtnStateRelativeToEvents();
        if (data) {
          if (data.like) {
            this.chatPrvd.postMessages[mIndex].likes_count = data.like.total;
            this.chatPrvd.postMessages[mIndex].like_by_user = data.like.isActive;
          }
          if (data.legendary) {
            this.chatPrvd.postMessages[mIndex].legendary_count = data.legendary.total;
            this.chatPrvd.postMessages[mIndex].legendary_by_user = data.legendary.isActive;
          }
          if (data.isBlocked) {
            switch(this.chatPrvd.getState()) {
              case 'undercover':
                this.startMessageUpdateTimer();
                break;
              case 'area':
                this.updateMessagesAndScrollDown(false);
                break;
            }
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
    console.log('this.user:', this.user);
    let legModal = this.modalCtrl.create(LegendaryModal,
    {
      netwrk_id: netwrkId,
      user_id: this.user.id
    }, {
      showBackdrop: false,
      enableBackdropDismiss: false,
      enterAnimation: 'modal-slide-left',
      leaveAnimation: 'modal-slide-right'
    });

    legModal.onDidDismiss(data => {
      if (data && data.joinNetwork) {
        this.joinToNetwork();
      }
    });
    // console.log('goToLegendaryList() -> present()...');
    legModal.present();
  }

  public checkForNetwork():any {
    let network = this.chatPrvd.getNetwork();
    return (this.isUndercover &&
       (network == 'undefined' || network == null ||
       (network && network.users_count < 10)));
  }

  private goArea():void {
    if (this.messagesInterval) clearInterval(this.messagesInterval);
    if (this.messageRefreshInterval) clearTimeout(this.messageRefreshInterval);

    this.postLockData.hint = null;
    this.postLockData.password = null;
    this.postTimerObj.expireDate = null;
    this.postTimerObj.time = null;
    this.slideAvatarPrvd.sliderPosition = 'left';

    this.cameraPrvd.toggleCameraBg({
      isArea: true
    });

    this.hideTopSlider('lock');
    this.hideTopSlider('timer');
    this.hideTopSlider('unlock');

    this.chatPrvd.setState('area');

    this.getUsers();
    this.updateMessagesAndScrollDown(false);
    this.postLoaded = false
  }

  goUndercover(event?:any) {
    if (event) {
      event.stopPropagation();
      if (this.chatPrvd.mainBtn.getState() == 'minimised') {
        this.keyboard.close();
        return;
      } else if (this.chatPrvd.mainBtn.getState() == 'moved-n-scaled'){
        this.toggleContainer(this.emojiContainer, 'hide');
        this.toggleContainer(this.shareContainer, 'hide');
        this.keyboard.close();
        return;
      }
      this.chatPrvd.isMessagesVisible = false;
      this.chatPrvd.postMessages = [];
    }
    // Disable main button on view load
    this.chatPrvd.isMainBtnDisabled = true;

    if (this.checkForNetwork()) {
      // this.toolsPrvd.pushPage(NetworkFindPage);
      this.chatPrvd.detectNetwork().then(res => {
        if (res.message == 'Network not found') {
          this.toolsPrvd.pushPage(NetworkNoPage, {
            action: 'create'
          });
        }
        // Enable main button after view loaded
        this.chatPrvd.isMainBtnDisabled = false;
      });
    } else {
      // this.toolsPrvd.showLoader();
      this.isUndercover = this.undercoverPrvd.setUndercover(!this.isUndercover);
      this.flipInput();
      this.changePlaceholderText();
      this.toolsPrvd.hideLoader();
      this.toolsPrvd.showLoader();
      setTimeout(() => {
        if (this.chatPrvd.getState() == 'area') {
          this.chatPrvd.setState('undercover');
          this.cameraPrvd.toggleCameraBg();
          this.runUndecoverSlider(this.pageTag);
          this.startMessageUpdateTimer();
          this.chatPrvd.scrollToBottom(this.content);
        } else {
          this.goArea();
        }
        this.content.resize();
        // this.startMessageUpdateTimer();
        // this.chatPrvd.scrollToBottom(this.content);
      }, 1);
    }
  }

  toggleShareSlider(social_network){
    this.shareCheckbox[social_network] = !this.shareCheckbox[social_network];
    this.getSocialPosts();
  }

  public getSocialPosts() {
    this.socialPosts = [];
    let socials = [];
    this.socialLoaderHidden = false;
    console.log('this.shareCheckbox:', this.shareCheckbox);
    for (let i in this.shareCheckbox) {
      if (this.shareCheckbox[i]) {
        socials.push(i);
      }
    }
    console.log('socials:', socials);
    if (socials.length > 0) {
      this.socialPrvd.getSocialPosts(socials).subscribe(res => {
        this.socialLoaderHidden = true;
        console.log('[getSocialPosts] res:', res);
        this.socialPosts = res.messages;
      }, err => {
        this.socialLoaderHidden = true;
        console.error('[getSocialPosts] err:', err);
      });
    } else {
      this.socialLoaderHidden = true;
    }
  }

  changeCallback(positionLeft?: boolean) {
    this.zone.run(() => {
      this.undercoverPrvd.profileType = positionLeft ? 'public' : 'undercover';
    });
  }

  removeAppendedImage(ind:number) {
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

  getTopSlider(container:string):any {
    let cont:any;
    switch(container) {
      case 'timer':
        cont = this.postTimer;
      break;
      case 'lock':
        cont = this.postLock;
      break;
      case 'unlock':
        cont = this.postUnlock;
      break;
    }
    return cont;
  }

  hideTopSlider(container:string):void {
    let cont = this.getTopSlider(container);
    if (cont.isVisible()) {
      cont.setState('slideUp');
      setTimeout(() => {
        cont.hide();
      }, chatAnim/2);
      cont.setState('slideUp');
    }
  }

  toggleTopSlider(container:string):void {
    let cont = this.getTopSlider(container);
    this.getTopSlider('timer').hide();
    this.getTopSlider('lock').hide();
    this.getTopSlider('unlock').hide();
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

  setPostTimer(timeId:number) {
    let currentDate = moment(new Date());
    switch (timeId) {
      case 0:
        this.hideTopSlider('timer');
        this.postTimerObj.time = null;
        this.postTimerObj.expireDate = null;
        break;
      case 1:
        // 10 hours
        this.postTimerObj.expireDate = currentDate.add(10, 'hours');
        this.postTimerObj.time = '10h';
        break;
      case 2:
        // 1 day
        this.postTimerObj.expireDate = currentDate.add(24, 'hours');
        this.postTimerObj.time = '1d';
        break;
      case 3:
        // 1 week (168h)
        this.postTimerObj.expireDate = currentDate.add(168, 'hours');
        this.postTimerObj.time = '1w';
        break;
      case 4:
        // 1 month
        this.postTimerObj.expireDate = currentDate.add(1, 'months');
        this.postTimerObj.time = '1m';
        break;
      default:
        this.postTimerObj.time = null;
        return false;
    }
    this.hideTopSlider('timer');
  }

  joinToNetwork() {
    // this.toolsPrvd.showLoader();
    this.networkPrvd.join(this.networkParams).subscribe(res => {
      // console.log(res);

      this.getUsers();
      // if (this.authPrvd.storage.get('area_first_time') === null) {
      //   let subTitle = `We\'re glad you decided to connect to this area! You can now,
      //     once a month, call a post legendary either under cover or on the
      //     area shareboard. This is a big responsibility, legends
      //     eventually become timeless tradition, and tradition shapes
      //     areas over time.` + '<br>' + `Your connected accounts will now
      //     auto-share to the area shareboard, building awareness and
      //     boosting followers for you!
      //     Connected accounts can also be shared manually, click the + and
      //     then (share icon) to share under cover or with your area`;
      //   this.authPrvd.storage.set('area_first_time', false);
      //   let welcomeAlert = this.alertCtrl.create({
      //     title: '',
      //     subTitle: subTitle,
      //     buttons: ['OK']
      //   });
      //   welcomeAlert.present();
      // }
      // this.toolsPrvd.hideLoader();
    }, err => {
      // console.log(err);
      // this.toolsPrvd.hideLoader();
    });
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

  private areaScroll():void {
    // console.log('_[scroll]');
    if (this.chatPrvd.getState() == 'area') {
      if (!this.postLoaded) {
        // console.log('_[scroll] getting scroll dimentions...');
        let dimensions = this.content.getContentDimensions();
        if (!this.postLoading && dimensions.scrollTop < (dimensions.scrollHeight - 80)) {
          this.postLoading = true;
          console.log('_[scroll] refreshing chat...');
          this.refreshChat();
        }
      }
    }
  }

  refreshChat(refresher?:any) {
    console.log('canRefresh?', this.canRefresh);
    if (this.canRefresh) {
      this.postLoading = (this.chatPrvd.getState() == 'area');
      console.log('Begin async operation', refresher);
      this.chatPrvd.getMessages(this.isUndercover, this.chatPrvd.postMessages, null, true)
      .subscribe(res => {
        // console.log('[REFRESHER] postMessages:', this.chatPrvd.postMessages);
        console.log('[REFRESHER] res:', res);
        res = this.chatPrvd.organizeMessages(res.messages);
        if (this.chatPrvd.getState() != 'area') {
          for (let i in res) {
            this.chatPrvd.postMessages.unshift(res[i]);
          }
        } else {
          if (res.length == 0) {
            this.postLoaded = true;
          }
          for (let i in res)
            this.chatPrvd.postMessages.push(res[i]);
          this.postLoading = false;
        }
        this.chatPrvd.messageDateTimer.start(this.chatPrvd.postMessages);
        if (refresher) refresher.complete();
      }, err => {
        if (refresher) refresher.complete();
        // console.error('[getMessages] Err:', err);
      });
    } else {
      if (refresher) refresher.complete();
    }
  }

  sortById(messageA, messageB) {
    return messageA.id - messageB.id;
  }

  private getAndUpdateUndercoverMessages() {
    this.chatPrvd.isMainBtnDisabled = false;
    this.chatPrvd.getMessages(this.isUndercover, this.chatPrvd.postMessages)
    .subscribe(res => {
      if (!res) return;
      // console.log('[sendMessagesIds] res:', res);
      if (res.ids_to_remove && res.ids_to_remove.length > 0) {
        for (let i in this.chatPrvd.postMessages) {
          for (let j in res.ids_to_remove) {
            if (this.chatPrvd.postMessages[i].id == res.ids_to_remove[j]) {
              this.chatPrvd.postMessages.splice(i, 1);
            }
          }
        }
      }

      if (res.messages && res.messages.length > 0) {
        for (let i in this.chatPrvd.postMessages) {
          for (let j in res.messages) {
            if (this.chatPrvd.postMessages[i].id == res.messages[j].id) {
              this.chatPrvd.postMessages.splice(i, 1);
            }
          }
        }
        this.chatPrvd.postMessages = this.chatPrvd.postMessages.concat(res.messages);
        this.chatPrvd.postMessages.sort(this.sortById);
        this.chatPrvd.messageDateTimer.start(this.chatPrvd.postMessages);
        // console.log('messages after sort:', this.chatPrvd.postMessages);
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
      this.chatPrvd.scrollToBottom(this.content);
      this.messagesInterval = setInterval(() => {
        console.warn('[messageTimer] starting interval...');
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
    // this.idList = this.getMessagesIds(this.chatPrvd.postMessages);
    this.chatPrvd.deleteMessages().subscribe( res => {
      // console.log('[sendDeletedMessages] Success:', res);
      // this.chatPrvd.postMessages = res ? res : [];
      this.canRefresh = true;
    }, err => {
      // console.log('[sendDeletedMessages] Error:', err);
      this.canRefresh = true;
    });
  }

  clearMessages() {
    // this.canRefresh = false;
    if (this.messagesInterval) clearInterval(this.messagesInterval);
    if (this.messageRefreshInterval) clearTimeout(this.messageRefreshInterval);
    this.idList = this.getMessagesIds(this.chatPrvd.postMessages);
    this.chatPrvd.postMessages = [];
    this.sendDeletedMessages();
  }

  flipInput() {
    this.flipHover = !this.flipHover;
  }

  runUndecoverSlider(pageTag) {
    console.log('(runUndecoverSlider) arguments:', arguments);
    if (this.chatPrvd.getState() == 'undercover') {
      this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
      // let position = this.slideAvatarPrvd.sliderPosition ? null : true;
      // console.log('[ChatPage][ionViewDidEnter]', position);
      this.slideAvatarPrvd.sliderInit(pageTag);
      this.content.resize();
    }
  }

  private goToProfile(profileId?: number, profileTypePublic?: boolean):void {
    this.chatPrvd.goToProfile(profileId, profileTypePublic).then(res => {
      this.toolsPrvd.pushPage(ProfilePage, res);
    }, err => {
      console.error('goToProfile err:', err);
    });
  }

  private updateIconBgRelativeToCamera():boolean {
    let camOpt = this.chatPrvd.localStorage.get('enable_uc_camera');
    return (camOpt === null || !camOpt);
  }

  private setMainBtnStateRelativeToEvents():void {
    if (this.shareContainer.getState() == 'on' ||
        this.emojiContainer.getState() == 'on') {
      this.chatPrvd.mainBtn.setState('moved-n-scaled');
    } else if (this.chatPrvd.appendContainer.getState() == 'on'){
      this.chatPrvd.mainBtn.setState('above_append');
    } else {
      this.chatPrvd.mainBtn.setState('normal');
    }
  }

  constructorLoad() {
    this.keyboard.disableScroll(true);
    this.authData = this.authPrvd.getAuthData();

    this.setCustomTransitions();

    this.keyboard.onKeyboardShow().subscribe(res => {
      // console.log('[onKeyboardShow]');
      // console.log(res);
      this.topSlider.setState('slideUp');
      this.chatPrvd.postBtn.setState(true);
      if (this.plt.is('ios')) {
        try {
          let footerEl = document.getElementsByClassName('chatFooter')['0'];
          let scrollEl = document.getElementsByClassName('scroll-content')['0'];
          scrollEl.style.bottom = res.keyboardHeight + 'px';
          // scrollEl.style.margin = '0px 0px ' + res.keyboardHeight + 70 + 'px 0px';
          footerEl.style.bottom = res.keyboardHeight + 'px';
          // this.contentMargin = res.keyboardHeight + 70 + 'px';
          this.isFeedbackClickable = false;
        } catch (e) {
          console.log(e);
        }
      }
      this.chatPrvd.mainBtn.setState('minimised');
      if (!this.chatPrvd.appendContainer.hidden) {
        this.chatPrvd.mainBtn.setState('above_append');
      }
      if (this.chatPrvd.getState() != 'area') {
        this.chatPrvd.scrollToBottom(this.content);
      }
      // setTimeout(() => {
      // }, chatAnim / 2 + 1);
    }, err => {
      // console.log(err);
    });

    this.keyboard.onKeyboardHide().subscribe(res => {
      // console.log(res);
      this.topSlider.setState('slideDown');
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

    if (!this.user.role_image_url)
      this.user.role_image_url = this.toolsPrvd.defaultAvatar;

    this.textStrings.sendError = 'Error sending message';
    this.textStrings.noNetwork = 'Netwrk not found';
    this.textStrings.require = 'Please fill all fields';

    let action = this.navParams.get('action');
    console.log('chat action:', action);
    if (action) {
      this.chatPrvd.setState(action);
      this.isUndercover = this.undercoverPrvd
      .setUndercover(action == 'undercover');
    } else {
      this.isUndercover = this.undercoverPrvd
      .setUndercover(this.chatPrvd.getState() == 'undercover');
    }

    this.flipHover = this.isUndercover ? true : false;

    this.changePlaceholderText();

    this.networkParams = {
      post_code: this.chatPrvd.localStorage.get('chat_zip_code')
    };
    this.hostUrl = this.chatPrvd.hostUrl;

    this.gpsPrvd.changeZipCallback = this.changeZipCallback.bind(this);

    this.gpsPrvd.getMyZipCode().then(zipRes => {
      // console.log('[ChatPage][zipRes] - ', zipRes);
    }).catch(err => {
      // console.log('[ChatPage][zipRes] err - ', err);
    })
  }

  ngOnInit() {
    this.constructorLoad();
    this.componentLoaded = true;
  }

  ionViewDidEnter() {
    this.toolsPrvd.showLoader();
    // this.chatPrvd.postMessages = [];
    console.warn('[CHAT] Did enter');
    if (!this.componentLoaded)
      this.constructorLoad();

    this.chatPrvd.detectNetwork().then(res => {
      this.chatPrvd.networkAvailable = res.network ? true : false;
    }, err => {
      console.error(err);
    });

    if (this.chatPrvd.localStorage.get('area_first_time') === null) {
      // this.goUndercover();
      let global = this.renderer.listen('document', 'touchstart', (evt) => {
        console.log('Clicking the document', evt);
        this.chatPrvd.localStorage.set('area_first_time', false);
        global();
      });
    }

    this.pageTag = this.elRef.nativeElement.tagName.toLowerCase();

    let providedStateFromGps = this.navParams.get('action_from_gps');
    if (providedStateFromGps == 'undercover') {
      this.isUndercover = true;
      this.chatPrvd.setState('undercover');
    }
    // init sockets
    this.chatPrvd.socketsInit();
    this.cameraPrvd.toggleCameraBg();

    this.chatPrvd.isMessagesVisible = false;
    this.chatPrvd.loadedImages = 0;
    this.chatPrvd.imagesToLoad = 0;

    this.mainInput.setState('fadeIn');
    this.mainInput.show();

    this.chatPrvd.mainBtn.setState('normal');
    this.chatPrvd.mainBtn.show();

    // this.contentBlock = document.getElementsByClassName('scroll-content')['0'];
    this.setContentPadding(false);

    setTimeout(() => {
      this.chatPrvd.updateAppendContainer();
    }, 1);

    this.user = this.authPrvd.getAuthData();
    this.getUsers();

    this.gpsPrvd.getNetwrk(this.chatPrvd.localStorage.get('chat_zip_code'))
    .subscribe(res => {
      this.chatPrvd.saveNetwork(res.network);
    });

    if (this.chatPrvd.getState() == 'area')
      this.updateMessagesAndScrollDown();
    else if (this.chatPrvd.getState() == 'undercover') {
      this.runUndecoverSlider(this.pageTag);
      this.startMessageUpdateTimer();
    }

    this.zone.run(() => {
      this.undercoverPrvd.profileType = this.undercoverPrvd.profileType;
    });
  }

  ionViewDidLoad() {
    // console.log('[UNDERCOVER.ts] viewDidLoad');
    this.chatPrvd.messageDateTimer.enableLogMessages = true;
    this.generateEmoticons();
  }

  ionViewWillLeave() {
    this.chatPrvd.closeSockets();
    this.toggleContainer(this.emojiContainer, 'hide');
    this.toggleContainer(this.shareContainer, 'hide');
    // console.log('[UNDERCOVER.ts] viewWillLeave');
    this.chatPrvd.messageDateTimer.stop();
    if (this.messagesInterval) clearInterval(this.messagesInterval);
    if (this.messageRefreshInterval) clearTimeout(this.messageRefreshInterval);
    // if (this.idList && this.idList.length > 0) {
    //   this.canRefresh = false;
    //   this.sendDeletedMessages();
    //   // this.startMessageUpdateTimer();
    // }
    this.slideAvatarPrvd.changeCallback = null;
  }
}
