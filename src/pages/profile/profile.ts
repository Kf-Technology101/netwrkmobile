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

import { AlertController } from 'ionic-angular';
import { Api } from '../../providers/api';
import { Keyboard } from '@ionic-native/keyboard';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
  providers: [
    Profile
  ]
})
export class ProfilePage {
  @ViewChild('fbSlider') fbSlider: Slides;
  @ViewChild('incognitoSlider') incoSlider;
  @ViewChild(Content) content: Content;
  @ViewChild('input') nativeInputBtn: ElementRef

  greeting: string;
  testSlides: string[] = [];
  public ownProfile: boolean;
  private postLoaded: boolean = false;

  connect: any = {
    facebook: false,
    instagram: false,
    twitter: false,
    snapchat: false
  };

  public user: any = {};
  public profileTypePublic: boolean;
  private fbFriends: any = [];
  private posts: Array<any> = [];
  private pageTag: string;
  private postLoading: boolean = false;

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
    elRef: ElementRef,
    public profile: Profile,
    public platform: Platform,
    public keyboard: Keyboard
  ) {
    this.pageTag = elRef.nativeElement.tagName.toLowerCase();
    this.user.id = this.navParams.get('id');

    let publicProfile = this.navParams.get('public');
    this.profileTypePublic = typeof publicProfile == 'boolean' ? publicProfile : true;
    // console.log(this.user);
    // this.isUndercover = this.undercoverPrvd.isUndercover;
    console.log('[ProfilePage][constructor]', this.navParams.get('public'));
    console.log('[ProfilePage][constructor]', this.profileTypePublic);
  }

  ngAfterViewInit() {
    this.connect.facebook = this.socialPrvd.getFacebookData();
    this.connect.instagram = this.socialPrvd.getInstagramData();
    this.connect.twitter = this.socialPrvd.getTwitterData();
    this.connect.snapchat = false;

    console.log(this.connect.facebook);
  }

  getFbProfile(userId) {
    this.userPrvd.getFacebookFriendProfile(userId)
    .subscribe(res => {
      console.log('[GetfbProfile] Res:', res);
      this.posts = [];
      this.showUserData(res);
    }, err => {
      console.error('[GetfbProfile] Err:', err);
    });
  }

  connectToFacebook() {
    // this.social.connectToFacebook().then(res => {
    //   this.connect.facebook = this.social.getFacebookData();
    //   this.toolsPrvd.showToast('Facebook already connected');
    // });
    // this.social.getFbPermission();
    //
    // let confirm = this.alertCtrl.create({
    //   title: 'Facebook authentication',
    //   message: 'You need to sign into Facebook to use this feature. Sign in now?',
    //   buttons: [
    //     {
    //       text: 'Cancel',
    //       handler: () => {
    //         console.log('Disagree clicked');
    //       }
    //     },
    //     {
    //       text: 'OK',
    //       handler: () => {
    //         console.log('Agree clicked');
    //       }
    //     }
    //   ]
    // });
    // confirm.present();
  }

  connectToInstagram() {
    this.socialPrvd.connectToInstagram().then(res => {
      this.connect.instagram = this.socialPrvd.getInstagramData();
      this.toolsPrvd.showToast('Instagram successfully connected');
    }, err => {

    });
  }
  connectToLinkedIn() {
    this.toolsPrvd.showToast('LinkedIn isn\'t connected');
  }

  connectToSnapchat() {

  }

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
        this.showMessagesWithType();
      }
    }
    // console.log(this.content, lastPost, lastPostOffset, this.content.getContentDimensions());
  }

  goBack() { this.toolsPrvd.popPage(); }

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

  private showMessagesWithType() {
    // if (this.ownProfile) {
    //   if (this.slideAvatarPrvd.sliderPosition == 'right') {
    //     this.showMessages();
    //   } else {
    //     this.showMessages(false);
    //   }
    // } else {
    //   if (this.profileTypePublic) {
    //     this.showMessages(false);
    //   } else {
    //     this.showMessages(true);
    //   }
    // }
    this.showMessages(this.undercoverPrvd.isUndercover);
  }

  private showUserData(res: any) {
    // this.toolsPrvd.hideLoader();
    console.log(res);

    this.ownProfile = (res.id == this.authPrvd.getAuthData().id) ? true : false;
    this.user = res;

    this.showMessagesWithType();

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

    if (this.ownProfile) {
      params.public = this.slideAvatarPrvd.sliderPosition == 'right'
        ? false : true;
    } else {
      params.public = this.profileTypePublic;
    }

    console.log('showMessages');

    let mesReq = this.chatPrvd.getMessagesByUserId(params).subscribe(res => {
      console.log(res);
      if (res.messages && res.messages.length == 0) this.postLoaded = true;
      if (params.offset == 0) this.posts = [];
      for (let m of res.messages) {
        m.date = this.toolsPrvd.getTime(m.created_at)
        this.posts.push(m);
      }
      this.postLoading = false;
      this.toolsPrvd.hideLoader();
      mesReq.unsubscribe();
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

  showFirstTimeMessage(alertType:string) {
    let subTitle:string;
    switch (alertType) {
      case 'area':
        subTitle = `We\'re glad you decided to connect to this area! You can now,
                   once a month, call a post legendary either under cover or on the
                   area shareboard. This is a big responsibility, legends
                   eventually become timeless tradition, and tradition shapes
                   areas over time.` + '<br>' + `Your connected accounts will now
                    auto-share to the area shareboard, building awareness and
                    boosting followers for you!
                  Connected accounts can also be shared manually, click the + and
                  then (share icon) to share under cover or with your area`;
        this.authPrvd.storage.set('area_first_time', false);
      break;
      case 'profile':
        subTitle = `We\'re glad you decided to join netwrk! All accounts that
        you connect can be shared manually and seen on your profile, allowing
        others to follow or add you! If you want to boost followers and awareness,
        connect to this area on the shareboard to auto-share all public posts on
        those connected accounts.`;
        this.authPrvd.storage.set('profile_first_time', false);
      break;
    }
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

  ionViewDidEnter() {
    if (this.ownProfile) {
      if (this.authPrvd.storage.get('profile_first_time') === null) {
        this.showFirstTimeMessage('profile');
      }
      this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
      this.slideAvatarPrvd.sliderInit(this.pageTag);

      if (this.platform.is('ios')) {
        this.keyboard.onKeyboardShow().subscribe(res => {
          document.addEventListener('click', (event) => {
            console.log('click event:', event);
            console.log('activeElement:', document.activeElement);
            let element = event.target as HTMLElement;
            if (element.tagName != 'TEXTAREA') {
              this.keyboard.close();
            }
          });
        }, err => {
          console.error('[E] onKeyboardShow:', err);
        });
      }
    }

    if (this.authPrvd.storage.get('area_first_time') === null) {
      this.showFirstTimeMessage('area')
    }

    this.user = this.authPrvd.getAuthData();
    this.setProfileData();
    // this.user.avatar_url = this.authPrvd.hostUrl + this.user.avatar_url;
  }

  ionViewDidLoad() {
    this.loadProfile();
  }

  ionViewWillLeave() {
    this.profile.saveChangesOnLeave();
    this.setProfileData();
  }

}
