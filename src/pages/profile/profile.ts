import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides, ItemSliding } from 'ionic-angular';

// Pages
import { ProfileSettingPage } from '../profile-setting/profile-setting';

// Providers
import { Social } from '../../providers/social';
import { Tools } from '../../providers/tools';
import { UndercoverProvider } from '../../providers/undercover';
import { SlideAvatar } from '../../providers/slide-avatar';
import { User } from '../../providers/user';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  greeting: string;
  testSlides: string[] = [];
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
    public slideAvatar: SlideAvatar,
    public userPrvd: User
  ) {
    this.user.id = this.navParams.get('id');
    console.log(this.user);

    setTimeout(()=>{
      for (var i = 0; i < 6; i++) {
        this.testSlides.push(i.toString());
      }
    },100);

    // this.user = this.undercoverPrvd.getPerson();
  }

  ondrag(event, item) {
    setTimeout(() => {
      let percent = item.getSlidingPercent();
      if (percent >= 0) {
        console.log('incognito [OFF]');
      } else {
        console.log('incognito [ON]');
      }
      if (Math.abs(percent) > 1) {
        console.log('overscroll');
      }
    }, 1);
  }

  share(slidingItem: ItemSliding) {
    slidingItem.close();
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

  ionViewDidEnter() {
    console.log("[PROFILE.ts] viewDidEnter");
    this.slideAvatar.sliderInit();
  }

  ionViewDidLoad() {
    this.userPrvd.getUserData(this.user.id).subscribe(
      res => {
        console.log(res);
      },
      err => console.error('ERROR', err)
    );
    console.log("[PROFILE.ts] viewDidLoad");
    // this.slideAvatar.startSliderEvents();
  }

  ionViewWillLeave() {
    console.log("[PROFILE.ts] viewWillLeave");
  }

}
