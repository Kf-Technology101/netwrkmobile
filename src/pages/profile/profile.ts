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

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  greeting: string;
  testSlides: string[] = [];
  public ownProfile: boolean;
  public isUndercover: boolean;
  @ViewChild('fbSlider') fbSlider: Slides;
  @ViewChild('incognitoSlider') incoSlider;

  connect: any = {
    facebook: false,
    instagram: false,
    twitter: false,
    snapchat: false
  };

  public user: {
    id: number,
    name: string,
    imageUrl: string,
  } = {
    id: null,
    name: null,
    imageUrl: null,
  };

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
  ) {
    this.user.id = this.navParams.get('id');
    console.log(this.user);

    setTimeout(()=>{
      for (var i = 0; i < 6; i++) {
        this.testSlides.push(i.toString());
      }
    },100);

    // this.user = this.undercoverPrvd.getPerson();
    this.isUndercover = this.undercoverPrvd.isUndercover;
  }

  ngAfterViewInit() {
    this.connect.facebook = this.social.getFacebookData();
    this.connect.instagram = this.social.getInstagramData();
    this.connect.twitter = this.social.getTwitterData();
    this.connect.snapchat = false;

    this.fbSlider.pager = true;
    this.fbSlider.slidesPerView = 5;
  }

  connectToFacebook() {
    this.social.connectToFacebook().then(res => {
      this.connect.facebook = this.social.getFacebookData();
      this.tools.showToast('Facebook already connected');
    });
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
      this.loadOwnProfile();
    } else {
      this.loadPublicProfile();
    }
  }

  private showUserData(res: any) {
    console.log(res);
    if (res.first_name || res.last_name) {
      this.user.name = `${res.first_name} ${res.last_name}`;
    } else if (res.role_name) {
      this.user.name = res.role_name;
    } else {
      this.user.name = 'No name';
    }

    this.user.imageUrl = res.avatar ?
      res.avatar : this.user.imageUrl = 'assets/images/incognito.png';
  }

  changeCallback(positionLeft?: boolean) {
    this.zone.run(() => {
      this.isUndercover = this.undercoverPrvd.setUndercover(!positionLeft);
    });

    console.log('isUndercover', this.isUndercover);
  }

  ionViewDidEnter() {
    console.log("[PROFILE.ts] viewDidEnter");
    this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
    let position = this.undercoverPrvd.isUndercover;
    this.slideAvatarPrvd.sliderInit();
    this.slideAvatarPrvd.setSliderPosition(position);
  }

  ionViewDidLoad() {
    this.loadProfile();
    console.log("[PROFILE.ts] viewDidLoad");
    // this.slideAvatar.startSliderEvents();
  }

  ionViewWillLeave() {
    console.log("[PROFILE.ts] viewWillLeave");
  }

}
