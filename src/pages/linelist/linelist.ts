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
import { ChatPage } from '../../pages/chat/chat';
import { HoldScreenPage } from '../../pages/hold-screen/hold-screen';
import { ProfilePage } from '../../pages/profile/profile';
import { LogInPage } from '../../pages/log-in/log-in';
import { NetwrklistPage } from '../netwrklist/netwrklist';
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
import { Profile } from '../../providers/profile';
import { User } from '../../providers/user';

import { VideoService } from '../../providers/videoservice';
import { FeedbackService } from '../../providers/feedback.service';
import { LocalStorage } from '../../providers/local-storage';

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
    providers: [
        Profile
    ],
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
    public noErrors: boolean = true;
    public map: any;

  @ViewChild(Content) content: Content;
  @ViewChild('galleryCont') gCont;
  // @ViewChild('textInput') txtIn;
  @ViewChild('directions') directionCont;
  @ViewChild('mapElement') mapElement: ElementRef;

    shareLineContainer = new Toggleable('off', true);
    emojiLineContainer = new Toggleable('off', true);
    mainInput = new Toggleable('fadeIn', false);
    postTimer = new Toggleable('slideUp', true);
    postLock = new Toggleable('slideUp', true);
    topSlider = new Toggleable('slideDown', false);
    postUnlock  = new Toggleable('slideUp', true);

    public action:any;

    flipHover: boolean;

    toggLineContainers: any = [
        this.emojiLineContainer,
        this.shareLineContainer
    ];
    private messagesInterval:boolean;
    private messIntObject:any;
	public txtIn:any;
    public isSocialPostsLoaded:boolean = false;

    emoticX = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C'];
    emoticY = ['1F60', '1F61', '1F62', '1F63', '1F64'];
    emojis = [];

    caretPos: number = 0;

    contentBlock: any = undefined;

    public chatUsers: any = [];
	public tempFiles: any = [];
	
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
    private bottomMargin: string;

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
	
    public editPostId: number = 0;
    public editMessage: any = null;
	public lineTitle: string = ''
	public lineimg: string = ''

    constructor(
        private viewCtrl: ViewController,
        private api: Api,
        private chatPrvd: Chat,
        public plt: Platform,
        public navCtrl: NavController,
        public navParams: NavParams,
        public toolsPrvd: Tools,
        public cameraPrvd: Camera,
        public storage: LocalStorage,
        public zone: NgZone,
        public gpsPrvd: Gps,
        public setting: Settings,
        public userPrvd: User,
        public profile: Profile,
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
			console.log('[Line Page]');
			this.chatPrvd.isLandingPage = false;
			this.user = this.authPrvd.getAuthData();
			this.bottomMargin="115px";
		}


    public closeModal():void {
        this.viewCtrl.dismiss();
    }

    private setCustomTransitions():void {
        this.config.setTransition('modal-slide-left', ModalRTLEnterAnimation);
        this.config.setTransition('modal-slide-right', ModalRTLLeaveAnimation);
    }

    private setDefaultTimer(forced?:boolean):void {
        if (this.chatPrvd.getState() == 'undercover' && !this.postTimerObj.time) {
            this.setPostTimer(0);
        }
    }

    private toggleChatOptions():void {

        this.chatPrvd.plusBtn.setState((this.chatPrvd.plusBtn.getState() == 'spined') ? 'default' : 'spined');
        this.chatPrvd.bgState.setState((this.chatPrvd.bgState.getState() == 'stretched') ? 'compressed' : 'stretched');

        if (this.chatPrvd.bgState.getState() == 'stretched') {
			this.bottomMargin="65px";
            this.chatPrvd.postBtn.setState(false);
            for (let i = 0; i < this.chatPrvd.chatBtns.state.length; i++) {
                setTimeout(() => {
                    this.chatPrvd.chatBtns.state[i] = 'btnShown';
                }, chatAnim/3 + (i*50));
            }
        } else {
			this.bottomMargin="115px";			
            if (this.txtIn.trim() != '' ||
                this.cameraPrvd.takenPictures.length > 0) {
                this.chatPrvd.postBtn.setState(true);
            }
            for (let i = 0; i < this.chatPrvd.chatBtns.state.length; i++) {
                this.chatPrvd.chatBtns.state[i] = 'btnHidden';
            }
        }
    }

    private changePlaceholderText():void {
        this.placeholderText = 'Add a description or #categories';
    }

    private generateEmoticons():void {
        for (let i = 0; i < this.emoticX.length; i++) {
            for (let j = 0; j < this.emoticY.length; j++) {
                this.emojis.push('0x' + this.emoticY[j].concat(this.emoticX[i]));
            }
        }
    }

    private openCamera():void {
        this.toggleLineContainer(this.emojiLineContainer, 'hide');
        this.toggleLineContainer(this.shareLineContainer, 'hide');
        this.mainInput.setState('fadeOutfast');
        setTimeout(() => {
            this.mainInput.hide();
            this.chatPrvd.mainLineBtn.setState('minimisedForCamera');
            setTimeout(() => {
                this.chatPrvd.mainLineBtn.hide();
                this.toolsPrvd.pushPage(CameraPage);
            }, chatAnim/2);
        }, animSpeed.fadeIn/2);
    }

    private setContentPadding(status):void {
        try {
            this.contentPadding = status ? document.documentElement.clientHeight / 2 + 76 + 'px' : '180px';
        } catch (e) {
            console.log(e);
        }
    }

    private updateContainer(container:any) {
        if (this.chatPrvd.appendLineContainer.hidden)
            this.chatPrvd.mainLineBtn.setState('normal');
        else this.chatPrvd.mainLineBtn.setState('above_append');

        container.setState('off');
        this.setContentPadding(false);
        setTimeout(() => {
            container.hide();
            this.socialPosts = [];
        }, chatAnim / 2);
    }

    private toggleLineContainer(container, visibility?: string, name?: string):void {
        if (visibility && visibility == 'hide') {
            this.updateContainer(container);
            if(this.chatPrvd.plusBtn.getState() == 'spined'){
                this.chatPrvd.mainLineBtn.setState('back-to-hold');
            }
        }

        if (!visibility) {
            if (container.hidden) {
                this.chatPrvd.mainLineBtn.setState('moved-n-scaled');
                container.show();
                container.setState('on');
                this.setContentPadding(true);

                if (container == this.emojiLineContainer) {
                    this.setDefaultTimer();
                }

                for (let i = 0; i < this.toggLineContainers.length; i++) {
                    if (!this.toggLineContainers[i].hidden &&
                        container != this.toggLineContainers[i]) {
                        this.toggLineContainers[i].setState('off');
                        setTimeout(() => {
                            this.toggLineContainers[i].hide();
                        }, chatAnim / 2);
                    }
                }
                if (name && name == 'shareLineContainer') this.getSocialPosts();
            } else {
                this.updateContainer(container);
            }
        }

    }

    private insertEmoji(emoji):void {
        let emojiDecoded = String.fromCodePoint(emoji);
        this.postMessage(emojiDecoded);
        if (this.chatPrvd.bgState.getState() == 'stretched') {
            this.toggleChatOptions();
        }
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
        if (this.chatPrvd.bgState.getState() == 'stretched') {
            this.toggleChatOptions();
        }
        this.postMessage(null, params);
    }

    private updatePost(data: any, message?:any, emoji?:any):void {
        // this.toolsPrvd.hideLoader();
        if (!emoji) {
            this.txtIn = '';
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

    private postMessage(emoji?: string, params?: any) {
        try {
			let publicUser: boolean;
            let images = [];
            let messageParams: any = {};
            let message: any = {};
			
			if(this.slideAvatarPrvd.sliderPosition == 'right' && (!this.postLockData.password || !this.postLockData.hint)){
				this.noErrors = false;
				return false;
			}
			
			if(!this.lineTitle){
				this.noErrors = false;
				return false;
			}
			 
			// this.saveNetworkName();
			let lineRole = '';
            if(this.slideAvatarPrvd.sliderPosition == 'left' || this.storage.get('slider_position')=='left'){
                publicUser=true; 
			}else{
                publicUser=false;
			}
			
			this.user = this.authPrvd.getAuthData();
			console.log(this.user);

            if (this.cameraPrvd.takenPictures) images = this.cameraPrvd.takenPictures;

            if (params && params.social && !this.chatPrvd.isLobbyChat)
                this.setDefaultTimer();
			
			let lineAvtr = this.setting.lineAvatar;
			// alert('editMessage : '+this.editPostId)
			this.storage.set('edit-post','');
            messageParams = {
				messageId:this.editPostId ? this.editPostId : null,
                text: emoji ?  emoji : this.txtIn,
                text_with_links: emoji ?  emoji : this.txtIn,
                user_id: this.user ? this.user.id : 0,
                role_name: lineAvtr.name,
                title: this.lineTitle,
                place_name: this.gpsPrvd.place_name,
                images: emoji ? [] : images,
                video_urls: params && params.video_urls ? params.video_urls : [],
                undercover: (this.chatPrvd.getState() == 'area') ? false : this.isUndercover,
                public: publicUser,
                is_emoji: emoji ? true : false,
                locked: (this.postLockData.hint && this.postLockData.password) ? true : false,
                password: this.postLockData.password ? this.postLockData.password : null,
                hint: this.postLockData.hint ? this.postLockData.hint : null,
                expire_date: this.postTimerObj.expireDate ? this.postTimerObj.expireDate : null,
                timestamp: Math.floor(new Date().getTime()/1000),
				line_avatar : this.tempFiles
            };
			
            if (params) Object.assign(messageParams, params);

            message = Object.assign(message, messageParams);
			let imageUrls = emoji ? [] : images;
			message.image_urls = messageParams.social_urls ? messageParams.social_urls : imageUrls;
            message.isTemporary = false;
            message.temporaryFor = 0;
			this.toolsPrvd.showLoader();
			
			console.log(messageParams);
			
			this.chatPrvd.sendMessage(messageParams).then(res => {
				message.id=res.id;
				console.log("my res after result return");
				console.log(res);
				
				if ((message.text && message.text.trim() != '') || (message.images && message.images.length > 0) || (message.social_urls && message.social_urls.length > 0)) {
					let alert = this.alertCtrl.create({
						subTitle: 'Share the line with your friends?',
						buttons: [{
							text: 'No',
							role: 'cancel',
							handler: () => {

								if (!message.social) {
									console.log('this user:', this.user);
									message.user_id = this.user.id;
									message.user = this.user;
									message.image_urls = message.images;
									message.is_synced = false;
									if (this.chatPrvd.isLobbyChat) message.expire_date = null;
								}
								this.goToLobby(res);
							}
						}, {
							cssClass: 'active',
							text: 'Yes',
							handler: () => {
								alert.dismiss();
								let subject = message.text_with_links ? message.text_with_links : '';
								let file = message.image_urls.length > 1 ? message.image_urls[0] : null;
								if (this.plt.is('ios')){
									this.sharing.share(subject, 'Netwrk', file, 'netwrkapp://netwrkapp.com/landing/'+message.id).then(res => {
											this.toolsPrvd.showToast('Message successfully shared');
											if (!message.social) {
												console.log('this user:', this.user);
												message.user_id = this.user.id;
												message.user = this.user;
												message.image_urls = message.images;
												message.is_synced = false;
												if (this.chatPrvd.isLobbyChat) message.expire_date = null;

											}

											this.goToLobby(res);
										}, err =>{
											this.toolsPrvd.showToast('Unable to share message');
											this.goToLobby(res);
										}
									);
								}else{
									this.sharing.share(subject, 'Netwrk', file, 'https://netwrkapp.com/landing/'+message.id).then(res => {
											this.toolsPrvd.showToast('Message successfully shared');
											if (!message.social) {
												console.log('this user:', this.user);
												message.user_id = this.user.id;
												message.user = this.user;
												message.image_urls = message.images;
												message.is_synced = false;
												if (this.chatPrvd.isLobbyChat) message.expire_date = null;
												
											}

											this.goToLobby(res);
										}, err =>{
											this.toolsPrvd.showToast('Unable to share message');
											this.goToLobby(res);
										}
									);
								}

								return false;
							}
						}]
					});

					alert.present();
					if (!emoji) {
						this.chatPrvd.appendLineContainer.setState('off');
						this.chatPrvd.mainLineBtn.setState('hidden');
						setTimeout(() => {
							this.chatPrvd.appendLineContainer.hide();
						}, chatAnim/2);
						this.cameraPrvd.takenPictures = [];
					}
				}
			}).catch(err => {
				console.log('err: '+JSON.stringify(err));
				this.toolsPrvd.hideLoader();
			});
		
		} catch (e) {
            console.error('Error in postMessage:', e);
        }
    }

    private goToHoldScreen():void {
        this.toolsPrvd.pushPage(NetwrklistPage);
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

    private goToLobby(messageParams:any){
        // this.toolsPrvd.showLoader();
        // this.chatPrvd.sendMessage(messageParams).then(res => {
            this.setting.isNewlineScope=false;
            this.app.getRootNav().setRoot(ChatPage, {message:messageParams});
			this.toolsPrvd.hideLoader();
			// this.chatPrvd.postMessages.unshift(message);
        // }).catch(err => {
            // this.toolsPrvd.hideLoader();
        // });
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
                                this.getAndUpdateUndercoverMessages();
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
            this.chatPrvd.mainLineBtn.setState('normal');
            this.chatPrvd.appendLineContainer.setState('off');
            if (this.txtIn.trim().length == 0)
                this.chatPrvd.postBtn.setState(false);
            setTimeout(() => {
                this.chatPrvd.appendLineContainer.hide();
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

    private hideTopSlider(container:string) {
        let cont = this.getTopSlider(container);
		if(container == 'lock'){
			if(this.slideAvatarPrvd.sliderPosition == 'right' && (!this.postLockData.password || !this.postLockData.hint )){
				this.noErrors = false;
				return false;
			}
		}
		
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

    private toggleTopSlider(container:string) {
        this.inputOnFocus();
        //if (this.plt.is('ios'))
        //    this.keyboard.show();
        // if ((container == 'lock' || container == 'timer')
        //     && this.txtIn.value.trim() == '') {
        //   this.toolsPrvd.showToast('What do you want to hang?');
        //   return;
        // }
		
        let cont = this.getTopSlider(container);
        if (this.activeTopForm){
			if(this.slideAvatarPrvd.sliderPosition == 'right' && (!this.postLockData.password || !this.postLockData.hint)){
				this.noErrors = false;
				return false;
			}else{
				this.noErrors = true;
				this.hideTopSlider(this.activeTopForm);
			}
		}

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
                        for (let i in res) {
                            if(this.chatPrvd.postMessages.indexOf(res[i])==-1){
                                this.chatPrvd.postMessages.push(res[i]);
                            }
                        }
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

    private getAndUpdateUndercoverMessages() {
		
        this.chatPrvd.isMainBtnDisabled = false;
        this.chatPrvd.getMessages(this.isUndercover, this.chatPrvd.postMessages)
            .subscribe(res => {
                if (res) {
                    if (res.messages && res.messages.length > 0) {
						// alert("I m in else of getAndUpdateUndercoverMessages(). this.editPostId: "+this.editPostId);
                        if(this.chatPrvd.postMessages.length > 0){
							for (let i in this.chatPrvd.postMessages) {							
								for (let j in res.messages) {
									if (this.chatPrvd.postMessages[i].id == res.messages[j].id) {
										this.chatPrvd.postMessages.splice(i, 1);
									}
									if(res.messages[j].id == this.editPostId){
										res.messages.splice(j, 1);
									}
								} 
							}						
						}else if(this.editPostId > 0){
							// alert("I m in else of getAndUpdateUndercoverMessages(). this.editPostId: "+this.editPostId);
							for (let j in res.messages) {
								if(res.messages[j].id == this.editPostId){
									res.messages.splice(j, 1);
								}
							} 
						}
						
                        this.chatPrvd.postMessages = this.chatPrvd.postMessages.concat(res.messages);
                        this.chatPrvd.postMessages = this.chatPrvd.organizeMessages(this.chatPrvd.postMessages);
                        this.chatPrvd.messageDateTimer.start(this.chatPrvd.postMessages);
                    }
                }
                this.toolsPrvd.hideLoader();
            }, err => {
                this.toolsPrvd.hideLoader();
            });
    }

    private getMessagesIds(messageArray: any):Array<number> {
        let idList:Array<number> = [];
        for (let m in messageArray) {
            idList.push(messageArray[m].id);
        }
        return idList;
    }

    private getMessagesIdByUndercover(messageArray: any):Array<number> {
        let idList:Array<number> = [];
        for (let m in messageArray) {
            if(this.isUndercover == messageArray[m].undercover){
                idList.push(messageArray[m].id);
            }
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
    }

    private flipInput():void {
        this.flipHover = !this.flipHover;
    }

    private runUndecoverSlider(pageTag):void {
        if (this.chatPrvd.getState() == 'undercover') {
            this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
            this.slideAvatarPrvd.sliderInit(pageTag);
            this.content.resize();
        }
    }

    private goToProfile(profileId?: number, profileTypePublic?: boolean,userRoleName?: any):void {
        this.chatPrvd.goToProfile(profileId, profileTypePublic).then(res => {
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
        if (this.shareLineContainer.getState() == 'on' || this.emojiLineContainer.getState() == 'on') {
			this.chatPrvd.mainLineBtn.setState('moved-n-scaled');
        } else if (this.chatPrvd.appendLineContainer.getState() == 'on'){
			this.chatPrvd.mainLineBtn.setState('above_append');
        } else {
			this.chatPrvd.mainLineBtn.setState('normal');
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
                        let footerEl = <HTMLElement>document.querySelector(this.pageTag + ' .lineChatFooter');
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
                this.chatPrvd.mainLineBtn.setState('minimised');
                if (!this.chatPrvd.appendLineContainer.hidden) {
                    this.chatPrvd.mainLineBtn.setState('above_append');
                }
            }, err => console.error(err));

            this.keyboard.onKeyboardHide().subscribe(res => {
                this.topSlider.setState('slideDown');
                if (this.plt.is('ios')) {
                    try {
                        let footerEl = <HTMLElement>document.querySelector(this.pageTag + ' .lineChatFooter');
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
                if (!this.chatPrvd.appendLineContainer.hidden) {
                    this.chatPrvd.mainLineBtn.setState('above_append');
                }
                if (this.chatPrvd.appendLineContainer.hidden) {
                    this.chatPrvd.mainLineBtn.setState('normal');
                }
                if (this.txtIn.trim() == '' &&
                    !this.chatPrvd.appendLineContainer.isVisible() &&
                    !this.activeTopForm) {
                    this.chatPrvd.postBtn.setState(false);
                } else if (this.txtIn.trim() == '' &&
                    this.activeTopForm) {
                    this.chatPrvd.mainLineBtn.setState('minimised');
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
                    email: 'sannagare99@gmail.com',
                    name: 'Sachin nagare',
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

            if (this.chatPrvd.bgState.getState() == 'stretched') {
                this.toggleChatOptions();
            }

            this.isUndercover = true;
            this.chatPrvd.setState('undercover');
            this.changePlaceholderText();
        });
    }

    private runClickListener():void {
        this.global = this.renderer.listen('document', 'touchstart', evt => {
            let destroyEvent:boolean = false;
            this.chatPrvd.localStorage.set('first_time_refresh', false);
            this.chatPrvd.networkAvailable = null;
            this.global();
        });
    }

    private directionSwipe(ev:any):void {
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
            if (res && res.length > 0)
                this.chatPrvd.localStorage.set('blacklist', res);
        }, err => console.error(err));
        this.authPrvd.getSocialStatus().subscribe(res => {
            let socialArray = [ 'fb', 'twitter', 'instagram' ];
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
		if(this.editPostId > 0){
			this.storage.set('edit-post','');
			this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length() - 4));
		}else{
			this.cameraPrvd.takenPictures=[];
			this.chatPrvd.isLandingPage = true;
			this.chatPrvd.postMessages = [];
			this.chatPrvd.isCleared = true;
			this.setting.isNewlineScope=false;
			this.canRefresh=true;
			this.refreshChat();
			this.app.getRootNav().setRoot(ChatPage);
		}
    }

    private onEnter():void {
        this.toolsPrvd.showLoader();
        this.chatPrvd.isMessagesVisible = false;
        this.chatPrvd.loadedImages = 0;
        this.chatPrvd.imagesToLoad = 0;

        this.mainInput.setState('fadeIn');
        this.mainInput.show();
        this.chatPrvd.mainLineBtn.setState('normal');
        this.chatPrvd.mainLineBtn.show();

        this.pageTag = this.elRef.nativeElement.tagName.toLowerCase();

        this.runUndecoverSlider(this.pageTag);

        this.events.subscribe('image:pushed', res => {
            this.setDefaultTimer();
        });

        this.events.subscribe('message:received', res => {
           
            if (res.messageReceived && this.chatPrvd.isCleared) {
                this.refreshChat();
            }
            if (res.runVideoService) {
                this.videoservice.posterAllVideos(<HTMLElement>document.querySelector(this.pageTag));
            }
        }, err => console.error(err));

        // init sockets
        this.chatPrvd.socketsInit();
        this.initResponseFromGPS();
        this.setContentPadding(false);
        this.messagesInterval = true;
		
		this.getAndUpdateUndercoverMessages();

        this.zone.run(() => {
            this.undercoverPrvd.profileType = this.undercoverPrvd.profileType;
        });

        setTimeout(() => {
            this.chatPrvd.updateAppendLineContainer();
        }, 1);

        this.user = this.authPrvd.getAuthData();

        if(this.slideAvatarPrvd.sliderPosition == 'right'){
			this.toggleTopSlider('lock');			
        }
		
        if(this.user.role_name=='Temporary gathering' && this.slideAvatarPrvd.sliderPosition == 'right'){
            this.toggleTopSlider('timer');
        }
    }

    ionViewDidEnter() {
        this.editPostId = this.storage.get('edit-post');
		if(this.editPostId > 0){
			this.chatPrvd.getMessageIDDetails(this.editPostId).subscribe(res => {
				this.editMessage = res.message;
				this.lineTitle = this.editMessage.text_with_links; 				
				this.setProfileData();
			}); 				
		}else{
			this.setProfileData();
		}
		
		/* this.storage.set('slider_position', 'right');
		this.slideAvatarPrvd.setSliderPosition('right'); */
				
        this.onEnter();
        if (this.chatPrvd.bgState.getState() == 'stretched') {
            this.toggleChatOptions();
        }
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
        this.setProfileData();
        console.log('%c linelist ionViewDidLoad ', 'background: #1287a8;color: #ffffff');
        if (this.chatPrvd.localStorage.get('enable_uc_camera') === null) {
            this.chatPrvd.localStorage.set('enable_uc_camera', true);
        }
        this.chatPrvd.messageDateTimer.enableLogMessages = true;
        this.generateEmoticons();
        let socialArray = ['fb', 'twitter', 'instagram'];
        this.authPrvd.getSocialStatus().subscribe(res => {
            console.log('get social status:',res);
            for (let i = 0; i < socialArray.length; i++) {
                if (res[socialArray[i]]) {
                    this.socialPrvd.connect[socialArray[i]] = res[socialArray[i]];
                }
            }
        }, err => console.error(err));
    }

    public saveNetworkName() {

        let params: any;
        if (this.profile.userName){
            this.toolsPrvd.showLoader();
            params = {
                user: {
                    role_name: this.profile.userName,
                    role_description: this.profile.userDescription
                }
            }
        }

        if (params)
            this.userPrvd.update(this.user.id, params, this.authPrvd.getAuthType(), 'update')
                .map(res => res.json()).subscribe(res => {
                    console.log('[user provider] (Update) res:', res);
                    this.authPrvd.saveAuthData(res);
                    this.user = res;
                    this.toolsPrvd.hideLoader();
                }, err => {
                    console.error(err);
                    this.toolsPrvd.hideLoader();
                });
    }
	
	public setLineName(){
		console.log('setLineName');
		if(!this.lineTitle){
			this.noErrors = false;
			return false;
		}else{
			this.noErrors = true;
		}
	}
	
	
    setProfileData() {
		if(this.editPostId > 0 && this.editMessage){
			this.profile.userName = this.editMessage.role_name;
			this.lineTitle = this.editMessage.title;
		}else{
			this.lineTitle = '';
			this.profile.userName = this.user.role_name;
			// this.profile.userDescription = this.user.role_description;
		}
			
    }
	
	
  public filesAdded(event): void {
    this.toolsPrvd.showLoader(); 
    let files: FileList = (<HTMLInputElement>event.target).files;    
    let fieldName: string = "avatar";
    
	console.log('linelistts files1:', files);
	if(files.length > 0){
		this.tempFiles = [];
		for (let i = 0; i < files.length; i++) {
		  this.tempFiles.push(files.item(i));
		  let reader = new FileReader();
		  reader.onload = e => this.lineimg = reader.result;
		  reader.readAsDataURL(files.item(i));
		}
	}
	
	this.toolsPrvd.hideLoader();
	console.log('linelistts filesAdded tempFiles:', this.tempFiles);    
  }
  


    ionViewWillLeave() {
        this.profile.saveChangesOnLeave();
        this.setProfileData();
        // this.profile.user.role_name = this.profile.userName;

        console.log('%c [CHAT] ionViewWillLeave ', 'background: #1287a8;color: #ffffff');
        this.navParams.data = {};
        this.componentLoaded = false;
        this.chatPrvd.closeSockets();                                               // unsubscribe from sockets events
        if (this.global) this.global();                                             // stop click event listener
        this.toggleLineContainer(this.emojiLineContainer, 'hide');                          // hide
        this.toggleLineContainer(this.shareLineContainer, 'hide');
        this.chatPrvd.messageDateTimer.stop();                                      // stop date timer for messages
        clearInterval(this.chatPrvd.scrollTimer.interval);                          // stop scroll to bottom interval
        this.messagesInterval = false;                                              // clear message update bool
        clearTimeout(this.messIntObject);                                           // clear message update interval
        this.slideAvatarPrvd.changeCallback = null;                                 // stop slider func.
    }
}
