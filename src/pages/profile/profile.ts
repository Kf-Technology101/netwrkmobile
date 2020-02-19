import { Component, ViewChild, NgZone, ElementRef } from '@angular/core';
import { NavController, NavParams, Slides, Content, Platform, AlertController, App } from 'ionic-angular';

import { Keyboard } from '@ionic-native/keyboard';
import { CameraPreview } from '@ionic-native/camera-preview';

// Pages
import { ProfileSettingPage } from '../profile-setting/profile-setting';
import { HoldScreenPage } from '../hold-screen/hold-screen';
import { NetwrklistPage } from '../netwrklist/netwrklist';
import { ChatPage } from '../chat/chat';
import { LinePage } from '../linelist/linelist';

// Providers
import { Profile } from '../../providers/profile';
import { Social } from '../../providers/social';
import { Tools } from '../../providers/tools';
import { UndercoverProvider } from '../../providers/undercover';
import { SlideAvatar } from '../../providers/slide-avatar';
import { User } from '../../providers/user';
import { Chat } from '../../providers/chat';
import { Auth } from '../../providers/auth';
import { Camera } from '../../providers/camera';
import { Api } from '../../providers/api';
import { ReportService } from '../../providers/reportservice';
import { VideoService } from '../../providers/videoservice';
import { LocalStorage } from '../../providers/local-storage';
import { Settings } from '../../providers/settings';

import { Toggleable } from '../../includes/toggleable';
// Animations
import { toggleFade, animSpeed } from '../../includes/animations';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
  providers: [
    Profile
  ],
  animations: [
    toggleFade
  ]
})
export class ProfilePage {
  @ViewChild('fbSlider') fbSlider: Slides;
  @ViewChild('incognitoSlider') incoSlider;
  @ViewChild(Content) content: Content;
  @ViewChild('input') nativeInputBtn: ElementRef

  profileContent = new Toggleable('fadeIn', false);
  public backBtnDisabled: boolean = false;

  topSlider = new Toggleable('slideDown', false);

  greeting: string;
  testSlides: string[] = [];
  public ownProfile: boolean;
  private postLoaded: boolean = false;

  public user: any = {};
  public profileTypePublic: boolean;
  private fbFriends: any = [];
  private posts: Array<any> = [];
  private pageTag: string;
  private postLoading: boolean = false;
  private firstTimeHero: boolean = true;

  private usersQueue: Array<any> = [];
    public activePerson: any = {
        name: '',
        description: '',
        imageUrl: ''
    };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public socialPrvd: Social,
    public toolsPrvd: Tools,
    public undercoverPrvd: UndercoverProvider,
    public slideAvatarPrvd: SlideAvatar,
    public userPrvd: User,
    public authPrvd: Auth,
    public zone: NgZone,
    public alertCtrl: AlertController,
    public api: Api,
    public chatPrvd: Chat,
    public elRef: ElementRef,
    public profile: Profile,
    public platform: Platform,
    public keyboard: Keyboard,
    public cameraPrev: CameraPreview,
    public cameraPrvd: Camera,
    public report: ReportService,
    public videoservice: VideoService,
	public storage: LocalStorage,
	public settings: Settings,
	public app: App
	
  ) {
    this.loadConstructor();
  }

  public listenForScrollEnd(event):void {
    this.zone.run(() => {
      console.log('scroll end...');
      this.videoservice
      .toggleVideoPlay(<HTMLElement>document.querySelector(this.pageTag));
    });
  }

  public messageSliderChange(event:any) {
    let parentSlider = document.querySelector('.' + event.slideId);
    let currentSlide = parentSlider.querySelectorAll('ion-slide.swiper-slide')[event.realIndex];
    let video = currentSlide.querySelector('video');
    let videos = parentSlider.querySelectorAll('video');
    for (let i = 0; i < videos.length; i++) {
      videos[i].pause();
    }
    if (video) {
      video.volume = 0;
      video.play();
    }
  }

  private loadConstructor():void {
    this.pageTag = this.elRef.nativeElement.tagName.toLowerCase();
    this.user.id = this.navParams.get('id');
    let publicProfile = this.navParams.get('public');
    this.profileTypePublic = typeof publicProfile == 'boolean' ? publicProfile : true;
    // console.log('remove identity_warning')
	// this.storage.rm('identity_warning'); 
  }

  public removeMessage(messageId:number):void {
    this.toolsPrvd.showLoader();
    this.chatPrvd.deleteMessage(messageId).subscribe(res => {
      console.log('removeMessage success:', res);
      this.toolsPrvd.hideLoader();
      for (let i = 0; i < this.posts.length; i++) {
        if (this.posts[i].id == messageId) {
          this.posts.splice(i, 1);
          this.toolsPrvd.showToast('Post was successfully removed');
          break;
        }
      }
    }, err => {
      this.toolsPrvd.hideLoader();
      this.toolsPrvd.showToast('Error while removing post');
      console.error('removeMessage err:', err);
    });
  }
  
  public editMessage(messageId:number):void{
	this.toolsPrvd.showLoader();
	this.storage.set("edit-post", messageId);
	this.storage.set("edited-page", 'profile');
	console.log('pushpage');
	this.toolsPrvd.pushPage(ChatPage);
	this.toolsPrvd.hideLoader(); 
  }

  choosePerson(post) {
	this.activePerson.name=post.role_name ? post.role_name:post.user.name;
	this.activePerson.imageUrl=post.public ? post.user.avatar_url : post.user.hero_avatar_url;
	this.activePerson.description=post.description;
	this.profile.user.hero_avatar_url=post.public ? post.user.avatar_url : post.user.hero_avatar_url;
	this.profile.user.avatar_url=post.public ? post.user.avatar_url : post.user.hero_avatar_url;
	this.profile.user.role_name=post.role_name ? post.role_name:post.user.name;
	this.profile.user.description=post.description;
	this.undercoverPrvd.setPerson(this.activePerson).then(data => {
		this.loadOwnProfile();
	}, err => {

	});
  }

  private toggleUserBlock():any {
    this.toolsPrvd.showLoader();
    this.report.blockUser(this.user.id).subscribe(res => {
      console.log('blockUser success:', res);
      if (res.message == 'block_ok') {
        this.user.blocked = true;
        this.toolsPrvd.showToast('User successfully blocked');
      } else if (res.message == 'unblock_ok') {
        this.user.blocked = false;
        this.toolsPrvd.showToast('User successfully unblocked');
      }
      this.toolsPrvd.hideLoader();
    }, err => {
      this.toolsPrvd.hideLoader();
      this.toolsPrvd.showToast('Error unblocking user');
      console.error('blockUser err:', err);
    });
  }

  private getFbProfile(userId:any):void {
    this.toggleProfilePageAnimation(false);
    this.userPrvd.getFacebookFriendProfile(userId).subscribe(res => {
      if (res) {
        setTimeout(() => {
          this.posts = [];
          console.log('[GetfbProfile] Res:', res);
          this.showUserData(res);
          this.usersQueue.push(res.id);
          console.log('[usersQueue]:', this.usersQueue);
          if (res.id == this.authPrvd.getAuthData().id)
            this.loadOwnProfile();
          this.toggleProfilePageAnimation(true);
        }, 400);
      } else {
        this.toggleProfilePageAnimation(true);
        setTimeout(() => {
          this.toolsPrvd.showToast('Unable to load profile data');
        }, 400);
      }
    }, err => {
      this.toggleProfilePageAnimation(true);
      setTimeout(() => {
        this.toolsPrvd.showToast('Unable to load profile data');
      }, 400);
      console.error('[GetfbProfile] Err:', err);
    });
  }

  private loadOwnProfile() {
        console.log('LOAD | OWN PROFILE');
        this.showUserData(this.authPrvd.getAuthData());

        this.user = this.authPrvd.getAuthData();
        this.setProfileData();
        this.authPrvd.getSocialStatus().subscribe(res => {
            let socialArray = [ 'fb', 'twitter', 'instagram' ];
            console.log('get social status:',res);
            // Go through all social networks and toggle their switch if active
            for (let i = 0; i < socialArray.length; i++) {
                if (res[socialArray[i]]) {
                    this.socialPrvd.connect[socialArray[i]] = res[socialArray[i]];
                }
            }
        }, err => console.error(err));
    }

  ngAfterViewInit() {
      this.socialPrvd.connect.facebook = this.socialPrvd.getFacebookData();
      this.socialPrvd.connect.instagram = this.socialPrvd.getInstagramData();
      this.socialPrvd.connect.twitter = this.socialPrvd.getTwitterData();
      this.socialPrvd.connect.snapchat = false;
    }

  private goToHoldScreen():void {
      this.toolsPrvd.pushPage(NetwrklistPage);
  }

  private goBack():void {
      this.chatPrvd.postMessages = [];
      this.chatPrvd.isCleared = true;
	  this.settings.isNewlineScope = false;
	  this.settings.isCreateLine = false;
	  this.chatPrvd.isLobbyChat = false;
	  this.chatPrvd.areaLobby = false;
	  if(this.storage.get('lobby_message') && (this.storage.get('lobby_message') != null || this.storage.get('lobby_message') != '')){
		let lobby_message = this.storage.get('lobby_message');
		console.log('setroot2');
		this.app.getRootNav().setRoot(ChatPage,{message:lobby_message});
	  }else{
		  console.log('setroot1');
		this.app.getRootNav().setRoot(ChatPage);
		// this.toolsPrvd.popPage();
	  }
  }

  private toggleProfilePageAnimation(state:boolean):void {
    let cState = state ? 'fadeIn' : 'fadeOutfast';
    let duration = state ? 1000 : null;
    let runAnimation = () => {
      this.profileContent.setState(cState);
      this.backBtnDisabled = false;
    };
    if (duration)
      setTimeout(() => { runAnimation(); }, duration);
    else
      runAnimation();
  }

  private connectToInstagram():void {
    this.toolsPrvd.showLoader();
    this.socialPrvd.connectToInstagram().then(res => {
      this.toolsPrvd.hideLoader();
      this.socialPrvd.connect.instagram = true;
      this.toolsPrvd.showToast('Instagram successfully connected');
    }, err => {
      this.toolsPrvd.hideLoader();
      console.error(err);
    });
  }
  connectToLinkedIn() {
    this.toolsPrvd.showToast('LinkedIn isn\'t connected');
  }

  connectToSnapchat() { }

  openSettings() {
    this.toolsPrvd.pushPage(ProfileSettingPage, {
      public: this.undercoverPrvd.profileType == 'public'
    });
  }

  doInfinite(scroll):void {
	this.showMessages(this.undercoverPrvd.isUndercover).then(res => {
      if (res == 'ok') scroll.complete();
    }, err => scroll.complete());
  }

  private loadPublicProfile() {
    this.userPrvd.getUserData(this.user.id).subscribe(
      res => {
        console.log(res);
        this.showUserData(res);
      },
      err => console.error('ERROR', err)
    );
  }

  private loadProfile() {
    this.toolsPrvd.showLoader();
    console.log('stored user id:', this.user.id, ' current user id:', this.authPrvd.getAuthData().id);
    if (this.user.id == this.authPrvd.getAuthData().id) {
      this.ownProfile = true;
      this.loadOwnProfile();
    } else {
      this.ownProfile = false;
      this.loadPublicProfile();
    }
  }

  private showUserData(res: any) {
    console.log(res);

    this.ownProfile = (res.id == this.authPrvd.getAuthData().id) ? true : false;
    this.user = res;

    this.showMessages(this.undercoverPrvd.isUndercover);
  }

  changeCallback(positionLeft?: boolean) {
    console.log('changeCallback', positionLeft);
    this.zone.run(() => {
      if (positionLeft) {
        this.undercoverPrvd.profileType = 'public';
      } else {
        this.undercoverPrvd.profileType = 'undercover';
      }
      this.posts = [];
      this.showMessages(this.undercoverPrvd.isUndercover);
    });
    this.user = this.profile.changeCallback(positionLeft);
  }

  private showMessages(undercover?: any):Promise<any> {
    return new Promise ((resolve, reject) => {
      let params: any = {
        user_id: this.user.id,
        offset: this.posts.length,
        undercover: undercover,
        public: this.profileTypePublic
      };

      if (this.ownProfile) {
        params.public = this.slideAvatarPrvd.sliderPosition == 'right' ? false : true;
      } else {
        params.public = this.profileTypePublic;
      }

      let mesReq = this.chatPrvd.getMessagesByUserId(params).subscribe(res => {
        if (res) {
		  console.log(res.messages);
          if (res.messages && res.messages.length == 0) this.postLoaded = true;
          if (params.offset == 0) this.posts = [];
          for (let m of res.messages) {
            m.date = this.toolsPrvd.getTime(m.created_at)
            this.posts.push(m);
          }
          this.postLoading = false;
          this.toolsPrvd.hideLoader();
          mesReq.unsubscribe();
          resolve('ok');
        }
      }, err => {
        this.postLoading = false;
        this.toolsPrvd.hideLoader();
        mesReq.unsubscribe();
        reject();
      });

      setTimeout(() => {
        this.toolsPrvd.hideLoader();
      }, 10000);
    });
  }

  setProfileData() {
    this.profile.userName = this.slideAvatarPrvd.sliderPosition == 'left'
      ? this.user.name : this.user.role_name;
    this.profile.userDescription = this.user.role_description;
  }
  
  public editSetting(messageId:number):void{
	console.log(messageId);
	this.toolsPrvd.showLoader();
	this.chatPrvd.getMessageIDDetails(messageId).subscribe(res => {	
		let message = res.message;
		this.chatPrvd.postMessages=[];
		let data:any = {
			lat: parseFloat(message.lat),
			lng: parseFloat(message.lng) 
		};
		this.chatPrvd.gps.coords = data;	
		this.chatPrvd.gps.place_name = message.place_name;
		this.storage.set("edit-post", messageId);	
		this.storage.set("edited-page", 'profile');
		this.storage.set("chat_zip_code", message.post_code);	
		this.settings.isNewlineScope = false;
		this.settings.isCreateLine = true;	
		this.toolsPrvd.pushPage(LinePage);	
		this.toolsPrvd.hideLoader(); 
	});	
  }
  
  public setCommunityIdentity(message:any){
	console.log('setCommunityIdentity');
	this.storage.set('savePrivateProfile',true);
	let curr_auth_details = this.storage.get('curr_auth_metadetails');
	this.profile.userName = message.title;
	this.profile.userDescription = message.text;
	this.profile.community_identity = message;
	this.profile.saveChanges();	
  }
  
  public saveProfileChanges(){
	  console.log('saveProfileChanges');
	 let params = {
        user: {
          role_description: this.profile.userDescription
		}
      }
	this.userPrvd.update(this.user.id, params, this.authPrvd.getAuthType(), 'update')
	.map(res => res.json()).subscribe(res => {
		this.user = res;
		this.toolsPrvd.hideLoader();
	}, err => {
		console.error(err);
		this.toolsPrvd.hideLoader();
	});
  }

  private viewDidEnter(params?:any):void {
    if (params) {
      if (params.id) this.user.id = params.id;
      if (params.public) this.profileTypePublic = params.public;
    }
    this.posts = [];
    this.loadProfile();

    this.user = this.authPrvd.getAuthData();
    this.setProfileData();
  }

  ionViewDidEnter() {
      this.viewDidEnter();
      this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
      this.slideAvatarPrvd.sliderInit(this.pageTag);
  }

  ionViewDidLoad() { this.loadProfile(); }

  ionViewWillLeave() {
	  console.log('ionViewWillLeave');
    // this.profile.saveChangesOnLeave();
    this.setProfileData();
    this.profile.user.hero_avatar_url = null;
    this.profile.user.avatar_url = null;
    this.profile.user.name = null;
    this.profile.user.role_name = null;
  }


  
}
