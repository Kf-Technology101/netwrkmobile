import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

import { Slides } from 'ionic-angular';

// Pages
import { NetworkFindPage } from '../network-find/network-find';

// Providers
import { UndercoverProvider } from '../../providers/undercover';
import { Tools } from '../../providers/tools';
import { SlideAvatar } from '../../providers/slide-avatar';
import { Auth } from '../../providers/auth';

import { heroes } from '../../includes/heroes';

import * as moment from 'moment';

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
  };
  public sliderLoaded: boolean = false;
  public changeError: string;
  public textError: string;
  private user: any = {};
  private pageTag: string;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public undercoverPrvd: UndercoverProvider,
    public toolsPrvd: Tools,
    public slideAvatarPrvd: SlideAvatar,
    public authPrvd: Auth,
    elRef: ElementRef
  ) {
    this.pageTag = elRef.nativeElement.tagName.toLowerCase();
    this.changeError = 'You can\'t leave this page right now';
    this.textError = 'Something went wrong, please try again later';

    this.user = this.authPrvd.getAuthData();
    this.getPersons();
  }

  choosePerson() {
    this.undercoverPrvd.setPerson(this.activePerson).then(data => {
      this.toolsPrvd.pushPage(NetworkFindPage);
    }, err => {
      this.toolsPrvd.showToast(this.textError);
    });
  }

  private getPersons() {
    let age = moment().diff(this.user.date_of_birthday, 'years');
    console.log('[UndercoverCharacterPage][getPersons] age ', age);
    if (age >= 13 && age < 20) {
      age = 13;
    } else if (age >= 20 && age < 40) {
      age = 20;
    } else {
      age = 40;
    }
    this.persons = heroes[this.user.gender][age];
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
        this.slideAvatarPrvd.setSliderPosition('right');
      }, 300)
      this.toolsPrvd.showToast(this.changeError);
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
    this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
    this.slideAvatarPrvd.sliderInit(this.pageTag);
  }

}
