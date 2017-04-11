import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

import { Slides } from 'ionic-angular';

// Pages
import { UndercoverPage } from '../undercover/undercover';

// Providers
import { UndercoverProvider } from '../../providers/undercover';
import { Tools } from '../../providers/tools';
import { SlideAvatar } from '../../providers/slide-avatar';

import { heroes } from '../../includes/heroes';

@Component({
  selector: 'page-undercover-character',
  templateUrl: 'undercover-character.html'
})
export class UndercoverCharacterPage {
  @ViewChild(Slides) slides: Slides;
  public persons: Array<any>;
  public activePerson: any = {
    name: '',
    description: '',
    imageUrl: '',
    active: false
  };
  public sliderLoaded: boolean = false;
  public changeError: string;
  public textError: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public undercover: UndercoverProvider,
    public tools: Tools,
    public slideAvatar: SlideAvatar,
    public platform: Platform
  ) {
    this.persons = heroes;
    // this.undercover.setActivePerson(true);
    this.changeError = 'You can\'t leave Undercover mode right now';
    this.textError = 'Something went wrong, please try again later';
  }

  choosePerson() {
    if (this.platform.is('cordova')) {
      this.undercover.setPerson(this.activePerson).then(() => {
        this.tools.pushPage(UndercoverPage);
      }, err => {
        this.tools.showToast(this.textError);
      });
    } else {
      this.tools.pushPage(UndercoverPage);
    }
  }

  private changeSlider() {
    let allSlides = document.getElementsByClassName('swiper-slide');
    let activeSlide = document.getElementsByClassName('swiper-slide-next')[0];

    for(var i = 0; i < allSlides.length;i++) {
      allSlides[i].classList.remove('active-character')
      if(allSlides[i] == activeSlide) allSlides[i].classList.add('active-character');
    }
  }

  changeCallback(positionLeft?: boolean) {
    if (positionLeft) {
      setTimeout(() => {
        this.slideAvatar.setSliderPosition(true);
      }, 300)
      this.tools.showToast(this.changeError);
    }
  }

  ionViewDidLoad() {
    this.slides.ionSlideWillChange.subscribe(() => {
      let activeIndex = this.slides.getActiveIndex();

      if (!this.sliderLoaded) setTimeout(() => { this.sliderLoaded = true; }, 500);
      if (this.persons[activeIndex]) this.activePerson = this.persons[activeIndex];
      if (activeIndex !== this.slides.length() - 2) this.changeSlider();
    });

    console.log('ionViewDidLoad UndercoverCharacterPage');
  }

  ionViewDidEnter() {
    this.slideAvatar.changeCallback = this.changeCallback.bind(this);
    this.slideAvatar.sliderInit();
    this.slideAvatar.setSliderPosition(true);
  }

}
