import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { Slides } from 'ionic-angular';

// Pages
import { UndercoverPage } from '../undercover/undercover';

// Providers
import { UndercoverProvider } from '../../providers/undercover';
import { Tools } from '../../providers/tools';

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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public undercover: UndercoverProvider,
    public tools: Tools
  ) {
    this.persons = heroes;
  }

  public choosePerson() {
    this.undercover.setPerson(this.activePerson);
    this.tools.pushPage(UndercoverPage);
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

  private changeSlider() {
    let allSlides = document.getElementsByClassName('swiper-slide');
    let activeSlide = document.getElementsByClassName('swiper-slide-next')[0];

    for(var i = 0; i < allSlides.length;i++) {
      allSlides[i].className = allSlides[i].className.replace('active-character', '')
      if(allSlides[i] == activeSlide) allSlides[i].className += ' active-character';
    }
  }

}
