import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides, ItemSliding } from 'ionic-angular';

// Pages
import { ProfileSettingPage } from '../profile-setting/profile-setting';

// Providers
import { Social } from '../../providers/social';
import { Tools } from '../../providers/tools';

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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public social: Social,
    public tools: Tools
  ) {
    setTimeout(()=>{
      for (var i = 0; i < 6; i++) {
        this.testSlides.push(i.toString());
      }
    },100);
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

  openProfile() {
    this.tools.pushPage(ProfileSettingPage);
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

  goBack() { this.tools.popPage(); }

}
