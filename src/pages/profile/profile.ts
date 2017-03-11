import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides } from 'ionic-angular';

// Pages
import { ProfileSettingPage } from '../profile-setting/profile-setting';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  greeting: string;
  testSlides: string[] = [];
  @ViewChild('fbSlider') fbSlider: Slides;

  connect: any = {
    facebook: false,
    instagram: false,
    twitter: false,
    snapchat: false,
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    setTimeout(()=>{
      for (var i = 0; i < 6; i++) {
        this.testSlides.push(i.toString());
      }
    },100);
  }

  ngAfterViewInit() {
    // this.connect.facebook = true;

    this.fbSlider.pager = true;
    this.fbSlider.slidesPerView = 5;

  }

  openProfile() {
    this.navCtrl.push(ProfileSettingPage);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

}
