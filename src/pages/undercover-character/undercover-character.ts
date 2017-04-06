import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { Slides } from 'ionic-angular';

// Pages
import { UndercoverPage } from '../undercover/undercover';

// Providers
import { UndercoverProvider } from '../../providers/undercover';
import { Tools } from '../../providers/tools';

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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public undercover: UndercoverProvider,
    public tools: Tools
  ) {
    this.persons = [
      {
        name: 'Captain America',
        description: 'Captain America is a fictional superhero appearing in American comic books published by Marvel Comics.',
        imageUrl: 'assets/images/cap.png',
      },
      {
        name: 'Doctor Strange',
        description: 'Dr. Stephen Vincent Strange, M.D. (known as Doctor Strange) is a fictional superhero appearing in American comic books published by Marvel Comics.',
        imageUrl: 'assets/images/doc.png',
      },
      {
        name: 'Hulk',
        description: 'The Hulk is a fictional superhero created by writer Stan Lee and artist Jack Kirby, who first appeared in the debut issue of the comic book The Incredible Hulk in May 1962 published by Marvel Comics.',
        imageUrl: 'assets/images/hulk.png',
      },
      {
        name: 'Doctor Strange',
        description: 'Dr. Stephen Vincent Strange, M.D. (known as Doctor Strange) is a fictional superhero appearing in American comic books published by Marvel Comics.',
        imageUrl: 'assets/images/doc.png',
      },
    ];
  }

  public choosePerson() {
    this.undercover.setPerson(this.activePerson);
    this.tools.pushPage(UndercoverPage);
  }

  ionViewDidLoad() {
    this.slides.ionSlideWillChange.subscribe(() => {
      if (this.persons[this.slides.getActiveIndex()])
        this.activePerson = this.persons[this.slides.getActiveIndex()];
      this.changeSlider();
    });

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
