import { Component, ViewChild, NgZone, ElementRef } from '@angular/core';
import { NavController, NavParams, Slides, Content, Platform } from 'ionic-angular';

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
import { Toggleable } from '../../includes/toggleable';

import { AlertController } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';
import { CameraPreview } from '@ionic-native/camera-preview';

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
    public cameraPrvd: Camera
  ) {
    this.loadConstructor();
  }

  private loadConstructor():void {
    this.pageTag = this.elRef.nativeElement.tagName.toLowerCase();
    this.user.id = this.navParams.get('id');

    let publicProfile = this.navParams.get('public');
    this.profileTypePublic = typeof publicProfile == 'boolean' ? publicProfile : true;
    // console.log(this.user);
    // this.isUndercover = this.undercoverPrvd.isUndercover;
    console.log('[ProfilePage][constructor]', this.navParams.get('public'));
    console.log('[ProfilePage][constructor]', this.profileTypePublic);
  }

  ngAfterViewInit() {
    this.socialPrvd.connect.facebook = this.socialPrvd.getFacebookData();
    this.socialPrvd.connect.instagram = this.socialPrvd.getInstagramData();
    this.socialPrvd.connect.twitter = this.socialPrvd.getTwitterData();
    this.socialPrvd.connect.snapchat = false;

    console.log(this.socialPrvd.connect.facebook);
  }

  private getFbProfile(userId:any):void {
    this.toggleProfilePageAnimation(false);
    this.userPrvd.getFacebookFriendProfile(userId).subscribe(res => {
      setTimeout(() => {
        this.posts = [];
        console.log('[GetfbProfile] Res:', res);
        this.showUserData(res);
        this.usersQueue.push(res.id);
        console.log('[usersQueue]:', this.usersQueue);
        this.toggleProfilePageAnimation(true);
      }, 400);
    }, err => {
      console.error('[GetfbProfile] Err:', err);
      this.toggleProfilePageAnimation(true);
    });
  }

  private goBack():void {
    if (this.usersQueue.length > 0) {
      this.backBtnDisabled = true;
      this.toggleProfilePageAnimation(false);
      setTimeout(() => {
        this.usersQueue.pop();
        this.loadConstructor();
        this.viewDidEnter({
          id: this.usersQueue[this.usersQueue.length - 1],
          public: true
        });
        this.toggleProfilePageAnimation(true);
      }, 400);
    } else {
      this.toolsPrvd.popPage();
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
    this.socialPrvd.connectToInstagram().then(res => {
      this.socialPrvd.connect.instagram = this.socialPrvd.getInstagramData();
      this.toolsPrvd.showToast('Instagram successfully connected');
    }, err => {

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

  ionScroll() {
    if (!this.postLoaded) {
      let posts: any = document.getElementsByClassName('post');
      let lastPost = posts[posts.length - 1];
      let lastPostOffset = lastPost.offsetTop;
      let dimensions = this.content.getContentDimensions();

      if (!this.postLoading
        && dimensions.scrollTop < (dimensions.scrollHeight - 800)) {
        this.postLoading = true;
        this.showMessages(this.undercoverPrvd.isUndercover);
      }
    }
    // console.log(this.content, lastPost, lastPostOffset, this.content.getContentDimensions());
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

  private loadOwnProfile() {
    this.showUserData(this.authPrvd.getAuthData());
  }

  private loadProfile() {
    this.toolsPrvd.showLoader();
    console.log(this.user.id, this.authPrvd.getAuthData().id)
    if (this.user.id == this.authPrvd.getAuthData().id) {
      this.ownProfile = true;
      this.loadOwnProfile();
    } else {
      this.ownProfile = false;
      this.loadPublicProfile();
    }
  }

  private showUserData(res: any) {
    // this.toolsPrvd.hideLoader();
    console.log(res);

    this.ownProfile = (res.id == this.authPrvd.getAuthData().id) ? true : false;
    this.user = res;

    this.showMessages(this.undercoverPrvd.isUndercover);

    this.socialPrvd.getFriendList(this.user.provider_id).then(friends => {
      console.log(friends);
      this.fbFriends = friends.data;
      console.log('this.fbFriends', this.fbFriends);
      console.log('this.user:', this.user);

      // this.socialPrvd.getFbUserPosts(this.user.provider_id).then(posts => {
      //   console.log('[ProfilePage][posts]', posts);
      //   this.fbPosts = posts.data;
      // }).catch(err => console.log('[ProfilePage][posts]', err));

    }).catch(err => console.log(err));
  }

  changeCallback(positionLeft?: boolean) {
    console.log('changeCallback', positionLeft);
    // positionLeft ? this.showMessages(false) : this.showMessages();
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

  private showMessages(undercover?: any) {
    let params: any = {
      user_id: this.user.id,
      offset: this.posts.length,
      undercover: undercover,
      public: this.profileTypePublic,
    };

    console.log('[Profile](showMessages) params:', params);

    if (this.ownProfile) {
      params.public = this.slideAvatarPrvd.sliderPosition == 'right'
        ? false : true;
    } else {
      params.public = this.profileTypePublic;
    }

    console.log('showMessages');

    let mesReq = this.chatPrvd.getMessagesByUserId(params).subscribe(res => {
      console.log(res);
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
      }
    }, err => {
      console.log(err);
      this.postLoading = false;
      this.toolsPrvd.hideLoader();
      mesReq.unsubscribe();
    });

    setTimeout(() => {
      this.toolsPrvd.hideLoader();
    }, 10000);
  }

  showFirstTimeMessage() {
    let subTitle = `We\'re glad you decided to join netwrk! All accounts that
        you connect can be shared manually and seen on your profile, allowing
        others to follow or add you! If you want to boost followers and awareness,
        connect to this area on the shareboard to auto-share all public posts on
        those connected accounts.`;
        this.authPrvd.storage.set('profile_first_time', false);
    let welcomeAlert = this.alertCtrl.create({
      title: '',
      subTitle: subTitle,
      buttons: ['OK']
    });
    welcomeAlert.present();
  }

  setProfileData() {
    this.profile.userName = this.slideAvatarPrvd.sliderPosition == 'left'
      ? this.user.name
      : this.user.role_name;
    this.profile.userDescription = this.user.role_description;
  }

  private viewDidEnter(params?:any):void {
    if (params && params.id) this.user.id = params.id;
    if (params && params.public) this.profileTypePublic = params.public;
    this.posts = [];
    this.loadProfile();
    this.cameraPrvd.toggleCameraBg();
    if (this.ownProfile) {
      // if (this.authPrvd.storage.get('profile_first_time') === null) {
      //   this.showFirstTimeMessage();
      // }
      this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
      this.slideAvatarPrvd.sliderInit(this.pageTag);
    }

    this.user = this.authPrvd.getAuthData();
    this.setProfileData();
    // this.user.avatar_url = this.authPrvd.hostUrl + this.user.avatar_url;
  }

  ionViewDidEnter() {
    this.viewDidEnter();
  }

  ionViewDidLoad() {
    this.loadProfile();
  }

  ionViewWillLeave() {
    this.profile.saveChangesOnLeave();
    this.setProfileData();
    this.profile.user.hero_avatar_url = null;
    this.profile.user.avatar_url = null;
    this.profile.user.name = null;
    this.profile.user.role_name = null;
  }

}
