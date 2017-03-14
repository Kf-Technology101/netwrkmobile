import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides } from 'ionic-angular';

// Pages
import { ProfileSettingPage } from '../profile-setting/profile-setting';

// Providers
import { Social } from '../../providers/social';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  greeting: string;
  testSlides: string[] = [];
  hiddenMainBtn: boolean = false;
  @ViewChild('fbSlider') fbSlider: Slides;

  connect: any = {
    facebook: false,
    instagram: false,
    twitter: false,
    snapchat: false,
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public social: Social
  ) {
    setTimeout(()=>{
      for (var i = 0; i < 6; i++) {
        this.testSlides.push(i.toString());
      }
    },100);
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
    let navOptions = {
      animate: true,
      animation: 'ios-transition',
      direction: 'forward'
    }

    this.hiddenMainBtn = true;
    this.navCtrl.push(ProfileSettingPage, null, navOptions);
  }

  connectToFacebook() {
    this.social.connectToFacebook().then(res => {
      this.connect.facebook = this.social.getFacebookData();
    });
  }

  connectToInstagram() {
    this.social.connectToInstagram().then(() => {
      this.connect.instagram = this.social.getInstagramData();
    });
  }

  connectToTwitter() {
    this.social.connectToTwitter().then(res => {
      this.connect.twitter = this.social.getTwitterData();
    });
  }

  connectToSnapchat() {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }
  ionViewWillEnter() {
    this.hiddenMainBtn = false;
    console.log('ionViewWillEnter ProfilePage');
  }
  ionViewDidEnter() {
    console.log('ionViewDidEnter ProfilePage');
  }
  ionViewWillLeave() {
    console.log('ionViewWillLeave ProfilePage');
  }
  ionViewDidLeave() {
    console.log('ionViewDidLeave ProfilePage');
  }
  ionViewWillUnload() {
    console.log('ionViewWillUnload ProfilePage');
  }

}
