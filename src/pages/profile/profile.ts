import { Component, ViewChild, NgZone } from '@angular/core';
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
  private fbFriends: any = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public social: Social,
    public tools: Tools,
    public undercoverPrvd: UndercoverProvider,
    public slideAvatarPrvd: SlideAvatar,
    public userPrvd: User,
    public authPrvd: Auth,
    public zone: NgZone,
    public alertCtrl: AlertController,
    public api: Api
  ) {
    this.user.id = this.navParams.get('id');
    console.log(this.user);
    // this.isUndercover = this.undercoverPrvd.isUndercover;
  }

  ngAfterViewInit() {
    this.connect.facebook = this.social.getFacebookData();
    this.connect.instagram = this.social.getInstagramData();
    this.connect.twitter = this.social.getTwitterData();
    this.connect.snapchat = false;

    console.log(this.connect.facebook);

    this.social.getFriendList().then(res => {
      console.log(res);
      this.fbFriends = res.data;
      console.log('this.fbFriends', this.fbFriends);
      console.log('this.user:', this.user);
      if (this.fbSlider) {
        this.fbSlider.pager = true;
        this.fbSlider.slidesPerView = 5;
      }
    }).catch(err => console.log(err));
  }

  getFacebookFriends() {
    let seq = this.api.get('profiles/user_by_provider').share();
    let seqMap = seq.map(res => res.json());
    return seqMap;
  }

  connectToFacebook() {
    // this.social.connectToFacebook().then(res => {
    //   this.connect.facebook = this.social.getFacebookData();
    //   this.tools.showToast('Facebook already connected');
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
    this.social.connectToInstagram().then(() => {
      this.connect.instagram = this.social.getInstagramData();
      this.tools.showToast('Instagram already connected');
    });
  }

  connectToTwitter() {
    this.social.connectToTwitter().then(res => {
      this.connect.twitter = this.social.getTwitterData();
      this.tools.showToast('Twitter already connected');
    });
  }

  connectToLinkedIn() {
    this.tools.showToast('LinkedIn isn\'t connected');
  }

  connectToSnapchat() {

  }

  openSettings() {
    this.tools.pushPage(ProfileSettingPage);
  }

  goBack() { this.tools.popPage(); }

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
    console.log(res);
    this.user = res;
    if (res.first_name || res.last_name) {
      this.user.name = `${res.first_name} ${res.last_name}`;
    } else if (res.role_name) {
      this.user.name = res.role_name;
    } else {
      this.user.name = 'No name';
    }
    this.user.avatar_url = this.authPrvd.hostUrl + this.user.avatar_url;
  }

  changeCallback(positionLeft?: boolean) {
    this.zone.run(() => {
      this.undercoverPrvd.profileType = positionLeft ? 'public' : 'undercover';
    });

    // console.log('isUndercover', this.isUndercover);
  }

  ionViewDidEnter() {
    console.log('[PROFILE.ts] viewDidEnter');
    if (this.ownProfile) {
      this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
      let position = this.undercoverPrvd.profileType == 'undercover' ? true : false
      this.slideAvatarPrvd.sliderInit();
      this.slideAvatarPrvd.setSliderPosition(position);
    }
  }

  ionViewDidLoad() {
    this.loadProfile();
    console.log('[PROFILE.ts] viewDidLoad');
  }

  ionViewWillLeave() {
    console.log('[PROFILE.ts] viewWillLeave');
  }

}
