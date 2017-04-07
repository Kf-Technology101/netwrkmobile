import { Injectable } from '@angular/core';
import { App } from 'ionic-angular';

import { UndercoverProvider } from '../providers/undercover';

@Injectable()
export class SlideAvatar {

  private sliderState: boolean;

  private selectedItem: any = null;
  private arrowIcon: any = null;
  private xPos: number = 0;
  private xElem: number = 0;

  private dStart: number = -21 - 8;
  private dEnd: number = 158 + 21 - 8;

  constructor(
    public app: App,
    public undercoverProvider: UndercoverProvider
  ) {
    this.app.viewDidEnter.subscribe((view) => {
      console.log('viewDidEnter', view);
    });
    this.app.viewDidLoad.subscribe((view) => {
      console.log("viewDidLoad");
      this.arrowIcon = document.getElementsByClassName('ion-ios-log-out');
      console.log("arrowIcon:", this.arrowIcon);
      this.sliderState = this.undercoverProvider.getPerson().active;
      this.setSliderPosition(this.sliderState);
    });
  }

  private dragInit(elem){
    this.selectedItem = elem;
    this.xElem = this.xPos - this.selectedItem.offsetLeft;
  }

  private moveElem(e) {
    this.xPos = e.touches[0].pageX;
    if (this.selectedItem !== null &&
        e.target.classList.contains('draggable-element')) {
      this.selectedItem.classList.remove('transition');
      this.arrowIcon['0'].style.opacity = '0';
      if (this.xPos - this.xElem >= this.dStart &&
          this.xPos - this.xElem <= this.dEnd) {
        this.selectedItem.style.left = (this.xPos - this.xElem) + 'px';
      }
    }
  }

  private dragDestroy(e) {
    if (e.target.classList.contains('draggable-element')) {
      if (this.xPos - this.xElem <= this.dEnd/2 + 3) {
        this.selectedItem.style.left = this.dStart + 'px';
        this.selectedItem.classList.add('transition');
        setTimeout(() => {
          this.arrowIcon['0'].style.opacity = '1';
          this.arrowIcon['0'].classList.remove('right');
        }, 300);
      }
      if (this.xPos - this.xElem > this.dEnd/2 + 3) {
        this.selectedItem.style.left = this.dEnd + 'px';
        this.selectedItem.classList.add('transition');
        setTimeout(() => {
          this.arrowIcon['0'].style.opacity = '1';
          this.arrowIcon['0'].classList.add('right');
        }, 300);
      }
      this.selectedItem = null;
    }
  }

  public startSliderEvents() {
    let self = this;
    let element = document.getElementsByClassName('draggable-element');
    element[0].addEventListener("touchstart", function(ev){
      self.moveElem(ev);
      self.dragInit(ev.target);
      return false;
    });
    document.addEventListener("touchmove", function(ev){
      self.moveElem(ev);
    });
    document.addEventListener("touchend", function(ev){
      self.dragDestroy(ev);
    });
  }

  public stopSliderEvents() {
    let self = this;
    let element = document.getElementsByClassName('draggable-element');
    element[0].addEventListener("touchstart", function(ev){
      self.moveElem(ev);
      self.dragInit(ev.target);
      return false;
    });
    document.removeEventListener("touchmove", function(ev){
      self.moveElem(ev);
    });
    document.removeEventListener("touchend", function(ev){
      self.dragDestroy(ev);
    });
  }

  public setSliderPosition(state) {
    let slider = document.getElementsByClassName('draggable-element');
    if (state) {
      slider['0'].style.left = this.dEnd + 'px';
      this.arrowIcon['0'].classList.add('right');
    } else {
      slider['0'].style.left = this.dStart + 'px';
      this.arrowIcon['0'].classList.remove('right');
    }
  }
}
