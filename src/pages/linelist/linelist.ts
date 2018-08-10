import {
    Component,
    NgZone,
    ViewChild,
    HostBinding,
    ElementRef,
    Renderer
} from '@angular/core';
import {
    ViewController,
    NavController,
    NavParams,
    Platform,
    Content,
    ModalController,
    AlertController,
    Config,
    Events,
    App
} from 'ionic-angular';

import { Api } from '../../providers/api';


// Custom libs

import { GoogleMapsService } from 'google-maps-angular2';
import { Toggleable } from '../../includes/toggleable';
import { CameraPreview } from '@ionic-native/camera-preview';
import { Keyboard } from '@ionic-native/keyboard';
import { SocialSharing } from '@ionic-native/social-sharing';
//Modals
import { LegendaryModal } from '../../modals/legendaryhistory/legendaryhistory';
import { FeedbackModal } from '../../modals/feedback/feedback';
import { MapsModal } from '../../modals/maps/maps';

//Pages
import { CameraPage } from '../../pages/camera/camera';
import { NetworkFindPage } from '../../pages/network-find/network-find';
import { NetworkNoPage } from '../../pages/network-no/network-no';
import { NetworkPage } from '../../pages/network/network';
import { ChatPage } from '../../pages/chat/chat';
import { ProfilePage } from '../../pages/profile/profile';
import { LogInPage } from '../../pages/log-in/log-in';
import { NetworkContactListPage } from '../../pages/network-contact-list/network-contact-list';
import { UndercoverCharacterPage } from '../../pages/undercover-character/undercover-character';

// Providers
import { Tools } from '../../providers/tools';
import { UndercoverProvider } from '../../providers/undercover';
import { SlideAvatar } from '../../providers/slide-avatar';
import { Auth } from '../../providers/auth';
import { Camera } from '../../providers/camera';
import { Chat } from '../../providers/chat';
import { NetworkProvider } from '../../providers/networkservice';
import { Social } from '../../providers/social';
import { Places } from '../../providers/places';
import { Gps } from '../../providers/gps';
import { Settings } from '../../providers/settings';


import { VideoService } from '../../providers/videoservice';
import { FeedbackService } from '../../providers/feedback.service';

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
        toggleUcSlider,
        lobbyAnimation
} from '../../includes/animations';
import { ModalRTLEnterAnimation } from '../../includes/rtl-enter.transition';
import { ModalRTLLeaveAnimation } from '../../includes/rtl-leave.transition';

@Component({
    selector: 'page-linelist',
    templateUrl: 'linelist.html',
    animations: [
        toggleInputsFade,
        rotateChatPlus,
        toggleChatOptionsBg,
        scaleMainBtn,
        toggleGallery,
        toggleFade,
        slideToggle,
        toggleUcSlider,
        lobbyAnimation
    ]
})
export class LinePage {

    public netwrkLineList: any = [];

    private componentLoaded:boolean = false;

  @HostBinding('class') colorClass = 'transparent-background';

    public isUndercover: boolean;
    public map: any;

  @ViewChild(Content) content: Content;
  @ViewChild('galleryCont') gCont;
  @ViewChild('textInput') txtIn;
  @ViewChild('directions') directionCont;
  @ViewChild('mapElement') mapElement: ElementRef;

    shareContainer = new Toggleable('off', true);
    emojiContainer = new Toggleable('off', true);
    mainInput = new Toggleable('fadeIn', false);
    postTimer = new Toggleable('slideUp', true);
    postLock = new Toggleable('slideUp', true);
    topSlider = new Toggleable('slideDown', false);
    postUnlock  = new Toggleable('slideUp', true);

    public action:any;

    flipHover: boolean;

    toggContainers: any = [
        this.emojiContainer,
        this.shareContainer
    ];
    private messagesInterval:boolean;
    private messIntObject:any;

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
        twitter: true,
        linkedin: true,
        instagram: true
    };

    private postLoaded:boolean = false;
    private postLoading:boolean = false;

    public sendError: string;
    private networkParams: any = {};
    private textStrings: any = {};

    public hostUrl: string;
    public placeholderText: string;

    private debug: any = {
        postHangTime: 0
    };
    private postLockData: any = {
        password: null,
        hint: null
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

    private activeTopForm:any;

    private global:any = null;

    private nearestPlace:any = null;

    private dirVisible:boolean = true;

    public network:any = {};

    public uniqueUsers:number = 0;


    constructor(
        private viewCtrl: ViewController,
        private api: Api,
        private chatPrvd: Chat,
        public plt: Platform,
        public navCtrl: NavController,
        public navParams: NavParams,
        public toolsPrvd: Tools,
        public cameraPrvd: Camera,
        public zone: NgZone,
        public gpsPrvd: Gps,
        public setting: Settings,
        public sharing: SocialSharing,
        public slideAvatarPrvd: SlideAvatar,
        public authPrvd: Auth,
        public elRef: ElementRef,
        public undercoverPrvd: UndercoverProvider,
        public gapi: GoogleMapsService,
        public networkPrvd: NetworkProvider,
        public socialPrvd: Social,
        public modalCtrl: ModalController,
        private alertCtrl: AlertController,
        private cameraPreview: CameraPreview,
        private keyboard: Keyboard,
        private renderer: Renderer,
        public config: Config,
        public events: Events,
        public places: Places,
        public app: App,
        public videoservice: VideoService,
        public feedbackService: FeedbackService
        ) {

        this.chatPrvd.isLandingPage = false;
        this.user = this.authPrvd.getAuthData();
    }


    public closeModal():void {
        this.viewCtrl.dismiss();
    }

    private setCustomTransitions():void {
        this.config.setTransition('modal-slide-left', ModalRTLEnterAnimation);
        this.config.setTransition('modal-slide-right', ModalRTLLeaveAnimation);
    }

    private setDefaultTimer(forced?:boolean):void {
        if (this.chatPrvd.getState() == 'undercover' &&
            !this.postTimerObj.time) {
            this.setPostTimer(1);
        }
    }

    private toggleChatOptions():void {

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

    private changePlaceholderText():void {
        this.placeholderText = 'Describe your Network';
    }

    private generateEmoticons():void {
        for (let i = 0; i < this.emoticX.length; i++) {
            for (let j = 0; j < this.emoticY.length; j++) {
                this.emojis.push('0x' + this.emoticY[j].concat(this.emoticX[i]));
            }
        }
    }

    private openCamera():void {
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

    private setContentPadding(status):void {
        try {
            this.contentPadding = status
                ? document.documentElement.clientHeight / 2 + 76 + 'px'
                : '180px';
            // if (this.chatPrvd.getState() == 'undercover')
            //   this.chatPrvd.scrollToBottom(this.content);
        } catch (e) {
            console.log(e);
        }
    }

    private updateContainer(container:any) {
        if (this.chatPrvd.appendContainer.hidden)
            this.chatPrvd.mainBtn.setState('normal');
        else this.chatPrvd.mainBtn.setState('above_append');

        container.setState('off');
        this.setContentPadding(false);
        setTimeout(() => {
            container.hide();
            this.socialPosts = [];
        }, chatAnim / 2);
    }

    private toggleContainer(container, visibility?: string, name?: string):void {
        if (visibility && visibility == 'hide') {
            this.updateContainer(container);
            if(this.chatPrvd.plusBtn.getState() == 'spined'){
                this.chatPrvd.mainBtn.setState('back-to-hold');
            }
        }

        if (!visibility) {
            if (container.hidden) {
                this.chatPrvd.mainBtn.setState('moved-n-scaled');

                container.show();
                container.setState('on');
                this.setContentPadding(true);

                if (container == this.emojiContainer) {
                    this.setDefaultTimer();
                }

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
                this.updateContainer(container);
            }
        }

    }

    private insertEmoji(emoji):void {
        let emojiDecoded = String.fromCodePoint(emoji);
        this.postMessage(emojiDecoded);
    }

    private convertEmoji(unicode):any {
        return String.fromCodePoint(unicode);
    }

    private sendLockInfo(event:any, form: any):void {
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
        }
    }

    private showUnlockPostForm(messageId:any, hint:any):void {
        this.postUnlockData.id = messageId;
        this.currentHint = hint;
        this.toggleTopSlider('unlock');
    }

    private unlockPost(event:any, form: any):void {
        event.stopPropagation();
        event.preventDefault();
        this.toolsPrvd.showLoader();
        if (form.invalid) {
            this.toolsPrvd.hideLoader();
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
                this.toolsPrvd.hideLoader();
                this.hideTopSlider('unlock');
            }, err => {
                this.toolsPrvd.hideLoader();
                this.toolsPrvd.showToast('Wrong password');
                console.error(err);
                this.postUnlockData.id = null;
                this.postUnlockData.password = null;
                this.hideTopSlider('unlock');
                this.setMainBtnStateRelativeToEvents();
            });
        }
    }

    private postMessageFromSocial(post:any):void {
        console.log('post:', post);
        let params: any = {
            text: post.text_with_links || '',
            text_with_links: post.text_with_links || '',
            social_urls: post.image_urls ? post.image_urls : [],
            social: post.social,
            post_url: post.post_url,
            video_urls: post.video_urls ? post.video_urls : [],
            social_post: true
        }

        this.postMessage(null, params);
    }

    private updatePost(data: any, message?:any, emoji?:any):void {
        // this.toolsPrvd.hideLoader();
        if (!emoji) {
            this.txtIn.value = '';
            this.setMainBtnStateRelativeToEvents();
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
    }

    public inputOnFocus():void {
        if (!this.chatPrvd.isLobbyChat) this.setDefaultTimer();
    }

    private postMessage(emoji?: string, params?: any):void {
        try {
            let publicUser: boolean;
            let images = [];
            let messageParams: any = {};
            let message: any = {};

            if (!this.isUndercover) {
                publicUser = true;
            } else {
                publicUser = this.slideAvatarPrvd.sliderPosition == 'left' ? true : false;
            }

            if (this.cameraPrvd.takenPictures) images = this.cameraPrvd.takenPictures;

            if (params && params.social && !this.chatPrvd.isLobbyChat)
                this.setDefaultTimer();

            messageParams = {
                text: emoji ?  emoji : this.txtIn.value,
                text_with_links: emoji ?  emoji : this.txtIn.value,
                user_id: this.user ? this.user.id : 0,
                images: emoji ? [] : images,
                video_urls: params && params.video_urls ? params.video_urls : [],
                undercover: (this.chatPrvd.getState() == 'area') ? false : this.isUndercover,
                public: publicUser,
                is_emoji: emoji ? true : false,
                locked: (this.postLockData.hint && this.postLockData.password) ? true : false,
                password: this.postLockData.password ? this.postLockData.password : null,
                hint: this.postLockData.hint ? this.postLockData.hint : null,
                expire_date: this.postTimerObj.expireDate ? this.postTimerObj.expireDate : null,
                timestamp: Math.floor(new Date().getTime()/1000)
            };

            console.log('messageParams:', messageParams);
            console.log('params:', params);


            if (params) Object.assign(messageParams, params);

            message = Object.assign(message, messageParams);

            let imageUrls = emoji ? [] : images;

            message.image_urls = messageParams.social_urls
                ? messageParams.social_urls : imageUrls;
            message.isTemporary = false;
            message.temporaryFor = 0;

            console.log('[POST MESSAGE] messageParams:', messageParams);
            if ((message.text && message.text.trim() != '') || (message.images && message.images.length > 0) || (message.social_urls && message.social_urls.length > 0)) {

                let alert = this.alertCtrl.create({
                    subTitle: 'Are you sure you want to share line with friend?',
                    buttons: [{
                        text: 'Cancel',
                        role: 'cancel'
                    }, {
                        cssClass: 'active',
                        text: 'Share',
                        handler: () => {
                            alert.dismiss();
                            let subject = message.text_with_links ? message.text_with_links : '';
                            let file = message.image_urls.length > 1 ? message.image_urls[0] : null;
                            if (this.plt.is('ios')){
                                this.sharing.share(subject, 'Netwrk', file, 'netwrkapp://landing').then(res => {
                                        this.toolsPrvd.showToast('Message successfully shared');
                                        if (!message.social) {
                                            console.log('this user:', this.user);
                                            message.user_id = this.user.id;
                                            message.user = this.user;
                                            message.image_urls = message.images;
                                            message.is_synced = false;
                                            if (this.chatPrvd.isLobbyChat) message.expire_date = null;

                                            console.log('message before unshift:', message);

                                            this.chatPrvd.postMessages.unshift(message);

                                            this.hideTopSlider(this.activeTopForm);
                                            this.txtIn.value = '';
                                            this.setMainBtnStateRelativeToEvents();
                                        } else this.toolsPrvd.showLoader();

                                        this.chatPrvd.sendMessage(messageParams).then(res => {
                                            this.hideTopSlider(this.activeTopForm);
                                            this.toolsPrvd.hideLoader();
                                            console.log('[sendMessage] res:', res);
                                            this.postLockData.hint = null;
                                            this.postLockData.password = null;
                                            this.postTimerObj.expireDate = null;
                                            this.postTimerObj.label = null;
                                            this.updatePost(res, message, emoji);
                                            this.postTimerObj.time = null;
                                            this.chatPrvd.scrollToTop();
                                        }).catch(err => {
                                            this.toolsPrvd.hideLoader();
                                            console.error('sendMessage:', err);
                                            this.updatePost(err, message);
                                        });
                                    }, err =>{
                                        this.toolsPrvd.showToast('Unable to share message');
                                    }
                                );
                            }else{
                                this.sharing.share(subject, 'Netwrk', file, 'https://netwrkapp.com/landing').then(res => {
                                        this.toolsPrvd.showToast('Message successfully shared');
                                        if (!message.social) {
                                            console.log('this user:', this.user);
                                            message.user_id = this.user.id;
                                            message.user = this.user;
                                            message.image_urls = message.images;
                                            message.is_synced = false;
                                            if (this.chatPrvd.isLobbyChat) message.expire_date = null;

                                            console.log('message before unshift:', message);

                                            this.chatPrvd.postMessages.unshift(message);

                                            this.hideTopSlider(this.activeTopForm);
                                            this.txtIn.value = '';
                                            this.setMainBtnStateRelativeToEvents();
                                        } else this.toolsPrvd.showLoader();

                                        this.chatPrvd.sendMessage(messageParams).then(res => {
                                            this.hideTopSlider(this.activeTopForm);
                                            this.toolsPrvd.hideLoader();
                                            console.log('[sendMessage] res:', res);
                                            this.postLockData.hint = null;
                                            this.postLockData.password = null;
                                            this.postTimerObj.expireDate = null;
                                            this.postTimerObj.label = null;
                                            this.updatePost(res, message, emoji);
                                            this.postTimerObj.time = null;
                                            this.chatPrvd.scrollToTop();
                                        }).catch(err => {
                                            this.toolsPrvd.hideLoader();
                                            console.error('sendMessage:', err);
                                            this.updatePost(err, message);

                                        });
                                    }, err =>{
                                        this.toolsPrvd.showToast('Unable to share message');
                                    }
                                );
                            }

                            return false;
                        }
                    }]
                });

                alert.present();
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

    private calculateInputChar(inputEl:any):void {
        let btnState:boolean = (inputEl.value.trim().length > 0 ||
        this.cameraPrvd.takenPictures.length > 0);
        this.chatPrvd.postBtn.setState(btnState);
        if (!this.chatPrvd.postBtn.getState()) {
            this.hideTopSlider(this.activeTopForm);
        }
    }

    private getCaretPos(oField):void {
        if (oField.selectionStart || oField.selectionStart == '0')
            this.caretPos = oField.selectionStart;
    }

    private updateMessages(scroll?:boolean):Promise<any> {
        return new Promise((resolve, reject) => {
            console.log('(updateMessages) isUndercover:', this.isUndercover);
            this.chatPrvd.showMessages(this.chatPrvd.postMessages, 'chat', this.isUndercover).then(res => {
                console.log('[SHOW MESSAGES] res:', res);
                this.chatPrvd.postMessages = this.chatPrvd.organizeMessages(res.messages);
                res.callback(this.chatPrvd.postMessages);
                this.toolsPrvd.hideLoader();
                resolve();
            }, err => {
                console.error('SHOW MESSAGES ERROR:', err);
                this.toolsPrvd.hideLoader();
                reject();
            });
        })
    }

    private openFeedbackModal(messageData: any, mIndex: number):void {
        this.toolsPrvd.showLoader();
        console.log('(openFeedbackModal) messageData:', messageData);
        this.chatPrvd.sendFeedback(messageData, mIndex).then(res => {
            console.log('sendFeedback:', res);
            res['isUndercover'] = this.isUndercover;
            let feedbackModal = this.modalCtrl.create(FeedbackModal, res);
            setTimeout(() => {
                feedbackModal.present();
            }, chatAnim/2);
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
                        for (let i = 0; i < this.chatPrvd.postMessages.length; i++) {
                            if (this.chatPrvd.postMessages[i].id == messageData.id) {
                                this.chatPrvd.postMessages = this.chatPrvd.postMessages.splice(i, 1);
                                break;
                            }
                        }
                        switch(this.chatPrvd.getState()) {
                            case 'undercover':
                                this.messagesInterval = true;
                                clearTimeout(this.messIntObject);
                                this.startMessageUpdateTimer();
                                break;
                            case 'area':
                                this.updateMessages(false);
                                break;
                        }
                    }
                } else console.warn('[likeClose] Error, no data returned');
            });
        })
    }


    private toggleShareSlider(social_network):void {
        this.shareCheckbox[social_network] = !this.shareCheckbox[social_network];
        this.getSocialPosts();
    }

    private getSocialPosts():void {
        this.socialPosts = [];
        let socials = [];
        this.socialLoaderHidden = false;
        console.log('this.shareCheckbox:', this.shareCheckbox);
        for (let i in this.shareCheckbox) if (this.shareCheckbox[i]) socials.push(i);
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

    private changeCallback(positionLeft?: boolean):void {
        this.zone.run(() => {
            this.undercoverPrvd.profileType = positionLeft ? 'public' : 'undercover';
        });
    }

    private removeAppendedImage(ind:number):void {
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

    private getTopSlider(container:string):any {
        const a = {
            timer: this.postTimer,
            lock: this.postLock,
            unlock: this.postUnlock
        }
        return a[container];
    }

    private hideTopSlider(container:string):void {
        let cont = this.getTopSlider(container);
        if (cont && cont.isVisible()) {
            cont.setState('slideUp');
            this.activeTopForm = null;
            setTimeout(() => {
                cont.hide();
            }, chatAnim/2);
        } else {
            console.warn('[hideTopSlider] container is not valid');
        }
    }

    public validateLockSpaces(event, type:string):any {
        this.postLockData[type] = event.target.value.trim();
    }

    private toggleTopSlider(container:string):void {
        if (this.plt.is('ios'))
            this.keyboard.show();
        // if ((container == 'lock' || container == 'timer')
        //     && this.txtIn.value.trim() == '') {
        //   this.toolsPrvd.showToast('What do you want to hang?');
        //   return;
        // }
        console.log('ACTIVE TOP SLIDER:', this.activeTopForm);
        let cont = this.getTopSlider(container);
        if (this.activeTopForm)
            this.hideTopSlider(this.activeTopForm);
        if (cont.isVisible()) {
            cont.setState('slideUp');
            this.activeTopForm = null;
            setTimeout(() => {
                cont.hide();
            }, chatAnim/2);
        } else {
            this.activeTopForm = container;
            cont.show();
            cont.setState('slideDown');
            // if (container == 'lock' || container == 'timer') {
            setTimeout(() => {
                this.setMainBtnStateRelativeToEvents();
            }, 400);
            // }
        }
    }

    private setPostTimer(timeId:number):any {
        let currentDate = moment(new Date());
        switch (timeId) {
            case 0:
                this.hideTopSlider('timer');
                this.postTimerObj.time = null;
                this.postTimerObj.expireDate = null;
                break;
            case 1:
                // 1 hour
                this.postTimerObj.expireDate = currentDate.add(1, 'hours');
                this.postTimerObj.time = '1h';
                this.postTimerObj.label = 'hours';
                break;
            case 2:
                // 1 day
                this.postTimerObj.expireDate = currentDate.add(24, 'hours');
                this.postTimerObj.time = '1d';
                this.postTimerObj.label = 'days';
                break;
            case 3:
                // 1 week (168h)
                this.postTimerObj.expireDate = currentDate.add(168, 'hours');
                this.postTimerObj.time = '1w';
                this.postTimerObj.label = 'weeks';
                break;
            case 4:
                // 1 month
                this.postTimerObj.expireDate = currentDate.add(1, 'months');
                this.postTimerObj.time = '1m';
                this.postTimerObj.label = 'months';
                break;
            case 5:
                // 1 year
                this.postTimerObj.expireDate = currentDate.add(1, 'years');
                this.postTimerObj.time = '1y';
                this.postTimerObj.label = 'years';
                break;
            default:
                this.postTimerObj.time = null;
                return;
        }
        this.hideTopSlider('timer');
    }

    private getUsers():Promise<any> {
        return new Promise((resolve, reject) => {
            this.toolsPrvd.showLoader();
            this.networkPrvd.getUsers(this.networkParams).subscribe(res => {
                console.log('res:', res);
                if (res) {
                    this.chatPrvd.setStorageUsers(res.users);
                    this.chatUsers = res.users;
                    this.uniqueUsers = res.unique_users;
                } else {
                    this.chatUsers.push(this.user);
                }
                resolve();
            }, err => {
                console.error('[GET USERS]', err);
                if (err.status == 401) {
                    this.authPrvd.logout().then(res => {
                        console.log('logout res:', res);
                        this.app.getRootNav().setRoot(LogInPage);
                        reject(err);
                    }).catch(err => {
                        console.error('logout error: ', err);
                        reject(err);
                    });
                } else {
                    reject(err);
                }
            });
        });
    }

    private doInfinite(ev):void {
        if (!this.chatPrvd.isLobbyChat) {
            setTimeout(() => {
                this.refreshChat().then(succ => ev.complete(), err => ev.complete());
            }, 500);
        }
    }

    private refreshChat(refresher?:any, forced?:boolean):Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.chatPrvd.isLobbyChat || forced) {
                this.chatPrvd.getMessages(this.isUndercover, this.chatPrvd.postMessages, null, true)
                    .subscribe(res => {
                        res = this.chatPrvd.organizeMessages(res.messages);
                        for (let i in res) this.chatPrvd.postMessages.push(res[i]);
                        this.chatPrvd.messageDateTimer.start(this.chatPrvd.postMessages);
                        this.chatPrvd.isCleared = false;
                        if (refresher) refresher.complete();
                        resolve();
                    }, err => {
                        console.error(err);
                        if (refresher) refresher.complete();
                        reject();
                    });
            } else { if (refresher) refresher.complete(); reject(); }
        });
    }

    private sortById_asc(messageA, messageB):any {
        return messageA.id - messageB.id;
    }
    private sortById_desc(messageA, messageB):any {
        return messageB.id - messageA.id;
    }

    private checkUCInterval():void {
        if (this.messagesInterval) {
            clearTimeout(this.messIntObject);
            this.messIntObject = setTimeout(() => {
                this.getAndUpdateUndercoverMessages();
            }, 10000);
        }
    }

    private getAndUpdateUndercoverMessages() {
        // console.log('getAndUpdateUndercoverMessages()');
        this.chatPrvd.isMainBtnDisabled = false;
        this.chatPrvd.getMessages(this.isUndercover, this.chatPrvd.postMessages)
            .subscribe(res => {
                // console.log('GPS coords:', this.gpsPrvd.coords);
                if (res) {
                    // console.log('undercover messages update...');
                    if (res.ids_to_remove && res.ids_to_remove.length > 0)
                        for (let i in this.chatPrvd.postMessages)
                            for (let j in res.ids_to_remove)
                                if (this.chatPrvd.postMessages[i].id == res.ids_to_remove[j])
                                    this.chatPrvd.postMessages.splice(i, 1);

                    if (res.messages && res.messages.length > 0) {
                        for (let i in this.chatPrvd.postMessages) {
                            for (let j in res.messages) {
                                if (this.chatPrvd.postMessages[i].id == res.messages[j].id) {
                                    this.chatPrvd.postMessages.splice(i, 1);
                                }
                            }
                        }
                        this.chatPrvd.postMessages = this.chatPrvd.postMessages.concat(res.messages);
                        this.chatPrvd.postMessages = this.chatPrvd.organizeMessages(this.chatPrvd.postMessages);
                        // console.log('postMessages:', this.chatPrvd.postMessages);
                        this.chatPrvd.messageDateTimer.start(this.chatPrvd.postMessages);
                    }
                }
                this.toolsPrvd.hideLoader();
                this.checkUCInterval();
            }, err => {
                // console.error('getAndUpdateUndercoverMessages() err:', err);
                this.toolsPrvd.hideLoader();
                this.checkUCInterval();
            });
    }

    private startMessageUpdateTimer() {
        if (this.chatPrvd.getState() == 'undercover' &&
            this.chatPrvd.allowUndercoverUpdate) {
            this.getAndUpdateUndercoverMessages();
        }
    }

    private goUndercover(event?:any):any {
        console.log('============= goUndercover =============');
        this.messagesInterval = false;
        clearTimeout(this.messIntObject);
        // Disable main button on view load
        this.chatPrvd.isMainBtnDisabled = true;
        this.toolsPrvd.showLoader();

        if (event) {
            console.log('_event:', event);
            event.stopPropagation();
            if (this.chatPrvd.mainBtn.getState() == 'minimised') {
                if (this.activeTopForm) {
                    console.log('txtIn:', this.txtIn);
                    this.txtIn.value = '';
                    this.hideTopSlider(this.activeTopForm);
                    this.chatPrvd.postBtn.setState(false);
                }
                this.keyboard.close();
                setTimeout(() => {
                    this.setMainBtnStateRelativeToEvents();
                }, 300);
            } else if (this.chatPrvd.mainBtn.getState() == 'moved-n-scaled') {
                this.toggleContainer(this.emojiContainer, 'hide');
                this.toggleContainer(this.shareContainer, 'hide');
                this.keyboard.close();
            }else if(this.chatPrvd.mainBtn.getState() == 'back-to-hold'){
                this.toggleContainer(this.emojiContainer, 'hide');
                this.toggleContainer(this.shareContainer, 'hide');
            }
            this.chatPrvd.isMessagesVisible = false;
            this.chatPrvd.postMessages = [];
        }

        if (this.chatPrvd.getState() == 'undercover') {
            this.chatPrvd.detectNetwork().then(res => {
                console.log('[goUndercover] detectNetwork res:', res);
                if (res.network)
                    this.chatPrvd.saveNetwork(res.network);
                console.log('DETECT NETWORK [goUndercover]')
                if (res.message == 'Network not found') {
                    console.log('_no network found');
                    this.toolsPrvd.pushPage(NetworkNoPage, {
                        action: 'create'
                    });
                    this.toolsPrvd.hideLoader();
                    return;
                } else {
                    console.log('_network exists');
                    this.isUndercover = this.undercoverPrvd.setUndercover(!this.isUndercover);
                    this.flipInput();
                    this.changePlaceholderText();
                    setTimeout(() => {
                        this.goArea();
                        this.content.resize();
                    }, 1);
                }
                this.chatPrvd.isMainBtnDisabled = false;
            }, err => console.error(err));

        } else if (this.chatPrvd.getState() == 'area') {
            this.chatPrvd.setState('undercover');
            this.isUndercover = this.undercoverPrvd.setUndercover(!this.isUndercover);

            this.chatPrvd.alreadyScolledToBottom = false;
            // this.cameraPrvd.toggleCameraBg();
            this.runUndecoverSlider(this.pageTag);
            this.startMessageUpdateTimer();
            this.flipInput();
            this.changePlaceholderText();
            this.messagesInterval = true;
            setTimeout(() => {
                this.content.resize();
            }, 1);
            setTimeout(() => {
                this.toolsPrvd.hideLoader();
            }, 1000);
        }

        setTimeout(() => {
            this.chatPrvd.isMainBtnDisabled = false;
            this.toolsPrvd.hideLoader();
            console.log('========= end of goUndercover =========');
        }, 2);
    }

    private goArea():void {
        console.log('_going to area...');
        // remove directions container from area pages
        if (this.nearestPlace) this.nearestPlace = undefined;

        this.messagesInterval = false;
        this.chatPrvd.networkAvailable = null;
        clearTimeout(this.messIntObject);
        if (this.chatPrvd.localStorage.get('areaChange_triggered') !== null) {
            this.chatPrvd.localStorage.rm('areaChange_triggered');
        }

        this.postLockData.hint = null;
        this.postLockData.password = null;
        this.postTimerObj.expireDate = null;
        this.postTimerObj.time = null;
        this.slideAvatarPrvd.sliderPosition = 'left';

        // this.cameraPrvd.toggleCameraBg({ isArea: true });

        this.hideTopSlider(this.activeTopForm);

        this.getUsers().then(res => {
            this.chatPrvd.setState('area');
            this.updateMessages().then(res => {
                this.chatPrvd.isMainBtnDisabled = false;
                this.toolsPrvd.hideLoader();
            }, err => {
                console.error(err);
                this.chatPrvd.isMainBtnDisabled = false;
                this.toolsPrvd.hideLoader();
            });
        }, err => {
            console.error(err);
            this.chatPrvd.isMainBtnDisabled = false;
            this.toolsPrvd.hideLoader();
        });
    }

    private changeZipCallback(params?: any) {
        if (params) {
            this.isUndercover = this.undercoverPrvd.setUndercover(params.undercover);
            if (this.isUndercover) {
                this.goUndercover();
            }
        }
    }

    private getMessagesIds(messageArray: any):Array<number> {
        let idList:Array<number> = [];
        for (let m in messageArray) {
            idList.push(messageArray[m].id);
        }
        return idList;
    }

    private sendDeletedMessages() {
        this.chatPrvd.deleteMessages(this.idList).subscribe( res => {
            this.canRefresh = true;
        }, err => {
            this.canRefresh = true;
        });
    }

    private clearMessages(postMessage):void {
        this.messagesInterval = false;
        clearTimeout(this.messIntObject);
        this.chatPrvd.postMessages = [];
        this.chatPrvd.isCleared = true;
        let messageArray=this.getMessagesIds(postMessage);
        this.chatPrvd.deleteMessages(messageArray).subscribe( res => {
            this.canRefresh = true;
        }, err => {
            this.canRefresh = true;
        });
    }

    private flipInput():void {
        this.flipHover = !this.flipHover;
    }

    private runUndecoverSlider(pageTag):void {
        // console.log('(runUndecoverSlider) arguments:', arguments);
        if (this.chatPrvd.getState() == 'undercover') {
            this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
            this.slideAvatarPrvd.sliderInit(pageTag);
            this.content.resize();
        }
    }

    private goToProfile(profileId?: number, profileTypePublic?: boolean,userRoleName?: any):void {
        this.chatPrvd.goToProfile(profileId, profileTypePublic).then(res => {
            // res['post_code'] = this.chatPrvd.localStorage.get('chat_zip_code');
            // console.log('GO TO PROFILE res:', res);
            this.chatPrvd.isLobbyChat = false;
            if(this.user.id==profileId){
                if(userRoleName){
                    this.toolsPrvd.pushPage(ProfilePage, res);
                }else{
                    this.toolsPrvd.pushPage(UndercoverCharacterPage, res);
                }
            }else{
                this.toolsPrvd.pushPage(ProfilePage, res);
            }
        }, err => {
            console.error('goToProfile err:', err);
        });
    }

    private updateIconBgRelativeToCamera():boolean {
        let camOpt = this.chatPrvd.localStorage.get('enable_uc_camera');
        return (camOpt === null || !camOpt);
    }

    private setMainBtnStateRelativeToEvents():void {
        if (this.shareContainer.getState() == 'on' || this.emojiContainer.getState() == 'on') {
            this.chatPrvd.mainBtn.setState('moved-n-scaled');
        } else if (this.chatPrvd.appendContainer.getState() == 'on'){
            this.chatPrvd.mainBtn.setState('above_append');
        } else {
            this.chatPrvd.mainBtn.setState('normal');
        }
    }

    private constructorLoad():Promise<any> {
        return new Promise(resolve => {
            console.log('%c [CHAT] constructorLoad ', 'background: #1287a8;color: #ffffff');
            this.keyboard.disableScroll(true);

            this.setCustomTransitions();

            this.keyboard.onKeyboardShow().subscribe(res => {
                this.topSlider.setState('slideUp');
                this.chatPrvd.postBtn.setState(true);
                if (this.plt.is('ios')) {
                    try {
                        let footerEl = <HTMLElement>document.querySelector(this.pageTag + ' .chatFooter');
                        let scrollEl = <HTMLElement>document.querySelector(this.pageTag + ' .scroll-content');
                        if (footerEl)
                            footerEl.style.bottom = res.keyboardHeight + 'px';
                        if (scrollEl)
                            scrollEl.style.bottom = res.keyboardHeight + 'px';
                        this.isFeedbackClickable = false;
                    } catch (e) {
                        console.error('on-keyboard-show error:', e);
                    }
                }
                this.chatPrvd.mainBtn.setState('minimised');
                if (!this.chatPrvd.appendContainer.hidden) {
                    this.chatPrvd.mainBtn.setState('above_append');
                }
            }, err => console.error(err));

            this.keyboard.onKeyboardHide().subscribe(res => {
                this.topSlider.setState('slideDown');
                if (this.plt.is('ios')) {
                    try {
                        let footerEl = <HTMLElement>document.querySelector(this.pageTag + ' .chatFooter');
                        let scrollEl = <HTMLElement>document.querySelector(this.pageTag + ' .scroll-content');
                        if (footerEl)
                            footerEl.style.bottom = '0';
                        if (scrollEl)
                            scrollEl.style.bottom = '0';

                        this.contentMargin = null;
                        this.isFeedbackClickable = true;
                    } catch (e) {
                        console.error('on-keyboard-hide error:', e);
                    }
                }
                if (!this.chatPrvd.appendContainer.hidden) {
                    this.chatPrvd.mainBtn.setState('above_append');
                }
                if (this.chatPrvd.appendContainer.hidden) {
                    this.chatPrvd.mainBtn.setState('normal');
                }
                if (this.txtIn.value.trim() == '' &&
                    !this.chatPrvd.appendContainer.isVisible() &&
                    !this.activeTopForm) {
                    this.chatPrvd.postBtn.setState(false);
                } else if (this.txtIn.value.trim() == '' &&
                    this.activeTopForm) {
                    this.chatPrvd.mainBtn.setState('minimised');
                }
            }, err =>  console.error(err));

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
                    updated_at: '2017-04-22T14:59:29.921Z'
                }

            if (!this.user.role_image_url)
                this.user.role_image_url = this.toolsPrvd.defaultAvatar;

            this.textStrings.sendError = 'Error sending message';
            this.textStrings.noNetwork = 'Netwrk not found';
            this.textStrings.require = 'Please fill all fields';

            this.action = this.navParams.get('action');
            // console.log('navParams:', this.navParams);
            // console.log('chat action:', this.action);
            if (this.action) {
                this.chatPrvd.setState(this.action);
                this.isUndercover = this.undercoverPrvd
                    .setUndercover(this.chatPrvd.getState() == 'undercover');
            } else {
                this.isUndercover = true;
                this.chatPrvd.setState('undercover');

            }

            this.flipHover = this.isUndercover ? true : false;

            this.changePlaceholderText();

            this.networkParams = {
                post_code: this.chatPrvd.localStorage.get('chat_zip_code')
            };
            this.hostUrl = this.chatPrvd.hostUrl;

            this.gpsPrvd.changeZipCallback = this.changeZipCallback.bind(this);
            if (this.chatPrvd.getState() == 'undercover') {
                this.chatPrvd.detectNetwork().then(res => {
                    this.network = res;
                    console.log('DETECT NETWORK [constructorLoad]');
                    let firstTimeInChat:any = this.chatPrvd.localStorage.get('first_time_undercover');
                    if (res.network) {
                        if (firstTimeInChat) {
                            this.chatPrvd.networkAvailable = true;
                            this.runClickListener();
                        } else {
                            this.chatPrvd.networkAvailable = null;
                        }
                    } else {
                        if (firstTimeInChat) {
                            this.chatPrvd.networkAvailable = false;
                            this.runClickListener();
                        } else {
                            this.chatPrvd.networkAvailable = null;
                        }
                    }
                    resolve('ok');
                }, err => {
                    console.error('[NETWORK DETECTION ERROR]:', err);
                    resolve('err');
                });
            }
        });
    }

    private runClickListener():void {
        this.global = this.renderer.listen('document', 'touchstart', evt => {
            // console.log('Clicking the document:', evt);
            let destroyEvent:boolean = false;
            this.chatPrvd.localStorage.set('first_time_refresh', false);
            this.chatPrvd.networkAvailable = null;
            this.global();
        });
    }

    private directionSwipe(ev:any):void {
        // swipe directions:
        // left - 2
        // right - 4
        // console.log('swipe event:', ev);
        this.directionCont.nativeElement.classList.remove('swipe-left');
        this.directionCont.nativeElement.classList.remove('swipe-right');
        if (ev.offsetDirection == 2)
            this.directionCont.nativeElement.classList.add('swipe-left');
        else if (ev.offsetDirection == 4)
            this.directionCont.nativeElement.classList.add('swipe-right');
        setTimeout(() => {
            this.dirVisible = false;
        }, 1500);
    }

    ngOnInit() {
        this.chatPrvd.getBlacklist().subscribe(res => {
            // console.log('BLACKLIST:', res);
            if (res && res.length > 0)
                this.chatPrvd.localStorage.set('blacklist', res);
        }, err => console.error(err));
        this.authPrvd.getSocialStatus().subscribe(res => {
            let socialArray = [ 'fb', 'twitter', 'instagram' ];
            // console.log('get social status:',res);
            // Go through all social networks and toggle their switch if active
            for (let i = 0; i < socialArray.length; i++) {
                if (res[socialArray[i]]) {
                    this.socialPrvd.connect[socialArray[i]] = res[socialArray[i]];
                }
            }
        }, err => console.error(err));
        console.log('%c [CHAT] ngOnInit ', 'background: #1287a8;color: #ffffff');
        if (this.chatPrvd.localStorage.get('last_zip_code') === null) {
            this.chatPrvd.localStorage.set('last_zip_code', this.chatPrvd.localStorage.get('chat_zip_code'));
        } else if (this.chatPrvd.localStorage.get('last_zip_code') !=
            this.chatPrvd.localStorage.get('chat_zip_code')) {
            this.chatPrvd.localStorage.set('first_time_undercover', null);
            this.chatPrvd.localStorage.set('last_zip_code', this.chatPrvd.localStorage.get('chat_zip_code'));
        }
        if (this.chatPrvd.localStorage.get('first_time_undercover') === null)
            this.chatPrvd.localStorage.set('first_time_undercover', true);
        else if (this.chatPrvd.localStorage.get('first_time_undercover')) {
            this.chatPrvd.localStorage.set('first_time_undercover', false);
        }
        this.constructorLoad().then(res => {
            this.componentLoaded = true;
        });
    }

    private initResponseFromGPS():Promise<any> {
        return new Promise ((resolve, reject) => {
            console.log('[response from gps]');
            let providedStateFromGps = this.navParams.get('action_from_gps');
            let areaChanged:boolean = (this.chatPrvd.localStorage.get('areaChange_triggered') === true);
            let firstTimeUC:boolean = (this.chatPrvd.localStorage.get('first_time_undercover') === true);
            if (areaChanged || firstTimeUC) {
                let placesToSearch:Array<string> = ['bar', 'cafe', 'park'];
                if (this.nearestPlace) this.nearestPlace = undefined;
                this.places.initMapsService().then(res => {
                    if (res == 'ok') {
                        this.places.getNearestInstitution(
                            document.getElementById('places'),
                            placesToSearch
                        ).then(plcs => {
                                this.nearestPlace = plcs;
                                this.dirVisible = true;
                                reject();
                                // console.log('nearest place:', plcs);
                                resolve();
                            }, err => {
                                console.error('getNearestInstitution:', err);
                                resolve();
                            });
                    } else resolve();
                }, err => {
                    console.error('initMapsService:', err)
                    resolve();
                });
            }
        });
    }

    public goBackOnLanding(event:any):void {
        this.chatPrvd.isLandingPage = true;
        this.chatPrvd.postMessages = [];
        this.chatPrvd.isCleared = true;
        this.canRefresh = true;
        this.refreshChat();
        this.setting.isNewlineScope=false;
        this.toolsPrvd.popPage();
    }

    private onEnter():void {
        console.log('%c [CHAT] ionViewDidEnter ', 'background: #1287a8;color: #ffffff');

        this.toolsPrvd.showLoader();
        this.chatPrvd.isMessagesVisible = false;
        this.chatPrvd.loadedImages = 0;
        this.chatPrvd.imagesToLoad = 0;

        this.mainInput.setState('fadeIn');
        this.mainInput.show();
        this.chatPrvd.mainBtn.setState('normal');
        this.chatPrvd.mainBtn.show();

        // this.chatPrvd.postMessages = [];
        this.pageTag = this.elRef.nativeElement.tagName.toLowerCase();

        if (this.chatPrvd.getState() == 'undercover') {
            this.runUndecoverSlider(this.pageTag);
        }

        this.events.subscribe('image:pushed', res => {
            this.setDefaultTimer();
        });

        this.events.subscribe('message:received', res => {
            console.log('message:received res:', res);
            if (res.messageReceived && this.chatPrvd.isCleared) {
                this.chatPrvd.postMessages = [];
                this.refreshChat();
            }
            if (res.runVideoService) {
                this.videoservice.posterAllVideos(<HTMLElement>document.querySelector(this.pageTag));
            }
        }, err => console.error(err));

        // this.cameraPrvd.toggleCameraBg();

        // init sockets
        this.chatPrvd.socketsInit();
        this.initResponseFromGPS();
        this.setContentPadding(false);
        if (this.chatPrvd.getState() == 'area') {
            this.getUsers().then(res => {
                this.gpsPrvd.getNetwrk(this.chatPrvd.localStorage.get('chat_zip_code'))
                    .subscribe(res => {
                        console.log('getNetwork res:', res);
                        if (res.network) {
                            this.chatPrvd.saveNetwork(res.network);
                            this.updateMessages();
                        }
                    }, err => console.error(err));
            }, err => console.error(err));
        } else if (this.chatPrvd.getState() == 'undercover'){
            this.messagesInterval = true;
            this.startMessageUpdateTimer();
        }

        this.zone.run(() => {
            this.undercoverPrvd.profileType = this.undercoverPrvd.profileType;
        });

        setTimeout(() => {
            this.chatPrvd.updateAppendContainer();
        }, 1);

        this.user = this.authPrvd.getAuthData();
    }

    ionViewDidEnter() {
        this.onEnter();
        this.toolsPrvd.hideLoader();
    }

    public listenForScrollEnd(event):void {
        this.zone.run(() => {
            console.log('scroll end...');
            this.videoservice
                .toggleVideoPlay(<HTMLElement>document.querySelector(this.pageTag));
        });
    }

    ionViewDidLoad() {
        console.log('%c [CHAT] ionViewDidLoad ', 'background: #1287a8;color: #ffffff');
        if (this.chatPrvd.localStorage.get('enable_uc_camera') === null) {
            this.chatPrvd.localStorage.set('enable_uc_camera', true);
        }
        this.chatPrvd.messageDateTimer.enableLogMessages = true;
        this.generateEmoticons();
        this.refreshChat();
        let socialArray = ['fb', 'twitter', 'instagram'];
        this.authPrvd.getSocialStatus().subscribe(res => {
            console.log('get social status:',res);
            // Go through all social networks and toggle their switch if active
            for (let i = 0; i < socialArray.length; i++) {
                if (res[socialArray[i]]) {
                    this.socialPrvd.connect[socialArray[i]] = res[socialArray[i]];
                }
            }
        }, err => console.error(err));
    }

    ionViewWillLeave() {
        console.log('%c [CHAT] ionViewWillLeave ', 'background: #1287a8;color: #ffffff');
        this.navParams.data = {};
        this.componentLoaded = false;
        this.chatPrvd.closeSockets();                                               // unsubscribe from sockets events
        if (this.global) this.global();                                             // stop click event listener
        this.toggleContainer(this.emojiContainer, 'hide');                          // hide emojiContainer
        this.toggleContainer(this.shareContainer, 'hide');                          // hide shareContainer
        this.chatPrvd.messageDateTimer.stop();                                      // stop date timer for messages
        clearInterval(this.chatPrvd.scrollTimer.interval);                          // stop scroll to bottom interval
        this.messagesInterval = false;                                              // clear message update bool
        clearTimeout(this.messIntObject);                                           // clear message update interval
        this.slideAvatarPrvd.changeCallback = null;                                 // stop slider func.
    }
}
