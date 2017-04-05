import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { Slides } from 'ionic-angular';

@Component({
  selector: 'page-undercover-character',
  templateUrl: 'undercover-character.html'
})
export class UndercoverCharacterPage {
  testSlides: string[] = [];
  @ViewChild(Slides) slides: Slides;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams
  ) {

  }

  ionViewDidLoad() {
    console.log(this.slides);
    // this.slides.slideTo(2, 500);
    this.slides.ionSlideWillChange.subscribe(() => {
      this.changeSlider();
    });

    this.slides.ionSlidePrevStart.subscribe(() => {
      this.changeSlider();
    });

    this.slides.ionSlideNextStart.subscribe(() => {
      this.changeSlider();
    });

    this.slides.initialSlide = 2;

    console.log('ionViewDidLoad UndercoverCharacterPage');
  }

  private changeSlider() {
    let allSlides = document.getElementsByClassName('swiper-slide');
    let activeSlide = document.getElementsByClassName('swiper-slide-next')[0];

    let min = true;
    for(var i = 0; i < allSlides.length;i++) {
      allSlides[i].className = allSlides[i].className
        .replace('prev-character', '')
        .replace('active-character', '')
        .replace('next-character', '')

      // console.log(i);
      if (min) {
        allSlides[i].className += ' prev-character';
      } else {
        allSlides[i].className += ' next-character';
      }

      if(allSlides[i] == activeSlide) {
        allSlides[i].className = allSlides[i].className.replace('prev-character', '')
        allSlides[i].className += ' active-character';
        min = false;
      }
    }
  }

}
