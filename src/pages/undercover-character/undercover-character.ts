import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

import { Slides } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LocalStorage } from '../../providers/local-storage';
import { Settings } from '../../providers/settings';

// Pages
import { ChatPage } from '../chat/chat';
import { LinePage } from '../linelist/linelist';
// Providers
import { UndercoverProvider } from '../../providers/undercover';
import { Tools } from '../../providers/tools';
import { SlideAvatar } from '../../providers/slide-avatar';
import { Auth } from '../../providers/auth';

import { heroes } from '../../includes/heroes';
import { heroesLines } from '../../includes/heroesLines';
import * as moment from 'moment';

@Component({
  selector: 'page-undercover-character',
  templateUrl: 'undercover-character.html'
})
export class UndercoverCharacterPage {
  @ViewChild(Slides) slides: Slides;
  public persons: Array<any> = [];
  public activePerson: any = {
    name: '',
    description: '',
    imageUrl: ''
  };
  public sliderLoaded: boolean = false;
  public changeError: string;
  public textError: string;
  private user: any = {};
  private pageTag: string;
  private firstTimeHero: boolean = true;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public settings: Settings,
    public undercoverPrvd: UndercoverProvider,
    public toolsPrvd: Tools,
    public slideAvatarPrvd: SlideAvatar,
    public authPrvd: Auth,
    elRef: ElementRef,
    private storage: LocalStorage,
    public splash: SplashScreen
  ) {
    this.pageTag = elRef.nativeElement.tagName.toLowerCase();
    this.changeError = 'You can\'t leave this page right now';
    this.textError = 'Something went wrong, please try again later';

    this.user = this.authPrvd.getAuthData();
    this.getPersons();
  }

  choosePerson(avatar) {
     this.activePerson.name=avatar.name;
     this.activePerson.imageUrl=avatar.imageUrl;
     this.activePerson.description=avatar.description;

    this.undercoverPrvd.setPerson(this.activePerson).then(data => {
      if (this.storage.get('first_time_hero') === null) {
        this.firstTimeHero = false;
        this.storage.set('first_time_hero', this.firstTimeHero);
      }
        if(this.settings.isCreateLine){
            this.settings.isCreateLine=false;
            this.toolsPrvd.pushPage(LinePage);
        }else{
            this.toolsPrvd.pushPage(ChatPage, {
                action: 'undercover'
            });
        }
    }, err => {
      this.settings.isCreateLine=false;
      //this.toolsPrvd.showToast(this.textError);
    });
  }

  private goBack() {
    this.toolsPrvd.popPage();
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

    if(this.settings.isCreateLine){
        this.persons.push(heroes.default);
        for (let i = 0; i < heroes[age].length; i++) {
            this.persons.push(heroes[age][i]);
        }
    }else{
        this.persons.push(heroesLines.default);
        for (let i = 0; i < heroesLines[age].length; i++) {
            this.persons.push(heroesLines[age][i]);
        }
    }

    let defaultHero = this.persons[0];
    let secondHero = this.persons[1];
    this.persons[0] = secondHero;
    this.persons[1] = defaultHero;
    console.log('characters:', this.persons);
  }

  private changeSlider() {
    let allSlides = document.getElementsByClassName('swiper-slide');
    let activeSlide = document.getElementsByClassName('swiper-slide-next')[0];

    for(var i = 0; i < allSlides.length;i++) {
      allSlides[i].classList.remove('active-character')
      if (allSlides[i] == activeSlide) allSlides[i].classList.add('active-character');
    }
  }

  ionViewDidLoad() {
    this.slides.ionSlideWillChange.subscribe(() => {
      let activeIndex = this.slides.getActiveIndex();
      if (!this.sliderLoaded) setTimeout(() => {
        this.sliderLoaded = true;
      }, 500);
      if (this.persons[activeIndex]) this.activePerson = this.persons[activeIndex];
      if (activeIndex !== this.slides.length() - 2) this.changeSlider();
    });

    console.log('ionViewDidLoad UndercoverCharacterPage');
  }

  ionViewDidEnter() {
    this.splash.hide();
    this.toolsPrvd.hideLoader();
    //if (this.storage.get('first_time_hero') === null)
      //this.firstTimeHero = true;
    // this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
    //this.slideAvatarPrvd.sliderInit(this.pageTag);
    //this.slideAvatarPrvd.setSliderPosition('right');
  }

}
