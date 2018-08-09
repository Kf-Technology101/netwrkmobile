import { Component, ViewChild, NgZone, ElementRef } from '@angular/core';
import { NavController, NavParams, Slides, Content, Platform, AlertController } from 'ionic-angular';

import { Keyboard } from '@ionic-native/keyboard';
import { CameraPreview } from '@ionic-native/camera-preview';

// Pages
import { ProfileSettingPage } from '../profile-setting/profile-setting';

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

  private usersQueue: Array<any> = [];

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
    public videoservice: VideoService
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
    console.log('[ProfilePage][constructor]', this.navParams.get('public'));
    console.log('[ProfilePage][constructor]', this.profileTypePublic);
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
        //this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
        //this.slideAvatarPrvd.sliderInit(this.pageTag);

        this.user = this.authPrvd.getAuthData();
        this.setProfileData();
        //this.authPrvd.getSocialStatus().subscribe(res => {
        //    let socialArray = [ 'fb', 'twitter', 'instagram' ];
        //    console.log('get social status:',res);
        //    // Go through all social networks and toggle their switch if active
        //    for (let i = 0; i < socialArray.length; i++) {
        //        if (res[socialArray[i]]) {
        //            this.socialPrvd.connect[socialArray[i]] = res[socialArray[i]];
        //        }
        //    }
        //}, err => console.error(err));
    }

    //ngAfterViewInit() {
    //  this.socialPrvd.connect.facebook = this.socialPrvd.getFacebookData();
    //  this.socialPrvd.connect.instagram = this.socialPrvd.getInstagramData();
    //  this.socialPrvd.connect.twitter = this.socialPrvd.getTwitterData();
    //  this.socialPrvd.connect.snapchat = false;
    //
    //  console.log(this.socialPrvd.connect.facebook);
    //}

  private goBack():void {
      this.toolsPrvd.popPage();

    //if (this.usersQueue.length > 0) {
    //  this.backBtnDisabled = true;
    //  this.toggleProfilePageAnimation(false);
    //  setTimeout(() => {
    //    this.usersQueue.pop();
    //    this.loadConstructor();
    //    this.viewDidEnter({
    //      id: this.usersQueue[this.usersQueue.length - 1],
    //      public: true
    //    });
    //    this.toggleProfilePageAnimation(true);
    //  }, 400);
    //} else {
    //  this.toolsPrvd.popPage();
    //}
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
    console.log('stored user id:', this.user.id,
                ' current user id:', this.authPrvd.getAuthData().id);
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

    //  Uncomment for social Intigration

    //this.socialPrvd.getFriendList(this.user.provider_id).then(friends => {
    //  console.log(friends);
    //  this.fbFriends = friends.data;
    //  console.log('this.fbFriends:', this.fbFriends);
    //  console.log('this.user:', this.user);
    //}).catch(err => console.log(err));
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

      console.log('[Profile](showMessages) params:', params);

      if (this.ownProfile) {
        params.public = this.slideAvatarPrvd.sliderPosition == 'right'
          ? false : true;
      } else {
        params.public = this.profileTypePublic;
      }

      let mesReq = this.chatPrvd.getMessagesByUserId(params).subscribe(res => {
        console.log('[getMessagesByUserId] res:', res);
        if (res) {
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
        console.error('[getMessagesByUserId] err', err);
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

  private viewDidEnter(params?:any):void {
    console.log('PROFILE | DIDENTER');
    //console.log('connect:', this.socialPrvd.connect);
    if (params) {
      if (params.id) this.user.id = params.id;
      if (params.public) this.profileTypePublic = params.public;
    }
    this.posts = [];
    this.loadProfile();
    //this.cameraPrvd.toggleCameraBg();
    //if (this.ownProfile) {
    //  this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
    //  this.slideAvatarPrvd.sliderInit(this.pageTag);
    //
    //}
    this.user = this.authPrvd.getAuthData();
    this.setProfileData();
  }

  ionViewDidEnter() { this.viewDidEnter(); }

  ionViewDidLoad() { this.loadProfile(); }

  ionViewWillLeave() {
    this.profile.saveChangesOnLeave();
    this.setProfileData();
    this.profile.user.hero_avatar_url = null;
    this.profile.user.avatar_url = null;
    this.profile.user.name = null;
    this.profile.user.role_name = null;
  }

}
