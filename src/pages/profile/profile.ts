import { Component, ViewChild, NgZone, ElementRef } from '@angular/core';
import { NavController, NavParams, Slides } from 'ionic-angular';

// Pages
import { ProfileSettingPage } from '../profile-setting/profile-setting';

// Providers
import { Social } from '../../providers/social';
import { Tools } from '../../providers/tools';
import { UndercoverProvider } from '../../providers/undercover';
import { SlideAvatar } from '../../providers/slide-avatar';
import { User } from '../../providers/user';
import { Auth } from '../../providers/auth';

import { AlertController } from 'ionic-angular';
import { Api } from '../../providers/api';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  @ViewChild('fbSlider') fbSlider: Slides;
  @ViewChild('incognitoSlider') incoSlider;

  greeting: string;
  testSlides: string[] = [];
  public ownProfile: boolean;

  connect: any = {
    facebook: false,
    instagram: false,
    twitter: false,
    snapchat: false
  };

  public user: any = {};
  public profileTypePublic: boolean;
  private fbFriends: any = [];
  private fbPosts: Array<any> = [];
  private pageTag: string;

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
    elRef: ElementRef
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
    let confirm = this.alertCtrl.create({
      title: 'Facebook authentication',
      message: 'You need to sign into Facebook to use this feature. Sign in now?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'OK',
          handler: () => {
            console.log('Agree clicked');
          }
        }
      ]
    });
    confirm.present();
  }

  connectToInstagram() {
    this.socialPrvd.connectToInstagram().then(() => {
      this.connect.instagram = this.socialPrvd.getInstagramData();
      this.toolsPrvd.showToast('Instagram already connected');
    });
  }

  connectToTwitter() {
    this.socialPrvd.connectToTwitter().then(res => {
      this.connect.twitter = this.socialPrvd.getTwitterData();
      this.toolsPrvd.showToast('Twitter already connected');
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

    this.ownProfile = res.id == this.authPrvd.getAuthData().id ? true : false;
    this.user = res;
    this.user.avatar_url = this.authPrvd.hostUrl + this.user.avatar_url;



    this.socialPrvd.getFriendList(this.user.provider_id).then(friends => {
      console.log(friends);
      this.fbFriends = friends.data;
      console.log('this.fbFriends', this.fbFriends);
      console.log('this.user:', this.user);

      this.socialPrvd.getFbUserPosts(this.user.provider_id).then(posts => {
        console.log('[ProfilePage][posts]', posts);
        this.fbPosts = posts.data;
      }).catch(err => console.log('[ProfilePage][posts]', err));

    }).catch(err => console.log(err));
  }

  changeCallback(positionLeft?: boolean) {
    this.zone.run(() => {
      this.undercoverPrvd.profileType = positionLeft ? 'public' : 'undercover';
    });
  }

  ionViewDidEnter() {
    if (this.ownProfile) {
      this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
      this.slideAvatarPrvd.sliderInit(this.pageTag);
    }
  }

  ionViewDidLoad() {
    // this.toolsPrvd.showLoader();
    this.loadProfile();
  }

}
