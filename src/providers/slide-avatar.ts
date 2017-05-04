import { Injectable } from '@angular/core';
import { App } from 'ionic-angular';

import { UndercoverProvider } from '../providers/undercover';

@Injectable()
export class SlideAvatar {

  private sliderState: boolean;

  private selectedItem: any = null;
  private arrowIcon: any = null;
  // private activateOnce: any = true;
  private xPos: number = 0;
  private xElem: number = 0;

  private dStart: number = -13 - 18;
  private dEnd: number = 200 - 13 - 18;

  private firedOnce: boolean = true;

  public changeCallback: (positionLeft?: boolean) => void;
  public sliderPosition: string;

  constructor(
    public app: App,
    public undercoverPrvd: UndercoverProvider
  ) {
    this.app.viewDidLoad.subscribe(view => {
      // console.log("<SLIDER.ts> viewDidLoad");
    });

    this.app.viewDidEnter.subscribe(view => {
      // console.log('<SLIDER.ts> viewDidEnter', view);
    });

    this.app.viewWillLeave.subscribe(view => {
      // console.log("<SLIDER.ts> viewWillLeave");
      this.stopSliderEvents();
    });
  }

  public sliderInit(position?: boolean) {
    console.log('activeNav:', this.app.getActiveNav());
    // let currentView = document.querySelector('ion-view[nav-view="active"]');
    // this.selectedItem = currentView.querySelectorAll('div.draggable-element')['0'];
    // console.log('[SLIDER] currentView:', currentView);
    // console.log('[SLIDER] selectedItem:', this.selectedItem);
    if (this.selectedItem) {
      // for (let i = 0; i < slider.length; i++) {
      //   if (slider[i].classList.contains('active')) {
      //     slider[i].classList.remove('active');
      //   } else {
      //     slider[i].classList.add('active');
      //   }
      // }

      if (!position && typeof position == 'boolean') {
      } else {
        position = this.sliderPosition == 'right' ? true : false;
      }

      this.setSliderDimentions();
      this.setSliderPosition(position);
      this.startSliderEvents();
    }
    else {
      console.warn("Slider init. failed. Details:", this.selectedItem);
      return false;
    }
  }

  private setSliderDimentions() {
    let dragEl = document.getElementsByClassName('draggable-element active')['0'];
    if (dragEl) {
      let dragLineW = dragEl.parentElement.clientWidth;

      this.dStart = 0 - dragEl.offsetWidth/2;
      this.dEnd = dragLineW - dragEl.offsetWidth/2;
    }
  }

  public setSliderPosition(state?: boolean) {
    if (!state) state = false;
    this.setSliderDimentions();
    let slider = document.getElementsByClassName('draggable-element active');
    if (this.selectedItem) {
      this.sliderState = state;
      this.arrowIcon = this.selectedItem.parentElement.children['1'];
      this.arrowIcon.style.opacity = '1';
      if (state) {
        this.selectedItem.style.left = this.dEnd + 'px';
        this.arrowIcon.classList.add('right');
        this.sliderPosition = 'right';
      } else {
        this.selectedItem.style.left = this.dStart + 'px';
        this.arrowIcon.classList.remove('right');
        this.sliderPosition = 'left';
      }
    }
  }

  private onTouchStart(e) {
    if (e.target.classList.contains('draggable-element')) {
      this.selectedItem = e.target;
      this.arrowIcon = e.target.parentElement.children['1'];

      if (this.firedOnce) {
        this.xPos = e.touches['0'].pageX;
        if (this.selectedItem !== null) {
          this.selectedItem.classList.remove('transition');
          this.arrowIcon.style.opacity = '0';
          if (this.xPos - this.xElem >= this.dStart &&
              this.xPos - this.xElem <= this.dEnd) {
            this.selectedItem.style.left = (this.xPos - this.xElem) + 'px';
          }
        }
        this.firedOnce = false;
      }
      this.xElem = this.xPos - this.selectedItem.offsetLeft;
    }
  }

  private onTouchMove(e) {
    if (e.target.classList.contains('draggable-element')) {
      this.xPos = e.touches['0'].pageX;
      if (this.selectedItem !== null) {
        this.selectedItem.classList.remove('transition');
        this.arrowIcon.style.opacity = '0';
        if (this.xPos - this.xElem >= this.dStart &&
            this.xPos - this.xElem <= this.dEnd) {
          this.selectedItem.style.left = (this.xPos - this.xElem) + 'px';
        }
      }
    }
  }

  private onTouchEnd(e) {
    if (e.target.classList.contains('draggable-element')) {
      this.selectedItem = e.target;
      if (this.xPos - this.xElem <= this.dEnd/2 + 3) {
        this.selectedItem.style.left = this.dStart + 'px';
        this.selectedItem.classList.add('transition');
        setTimeout(() => {
          if (this.changeCallback) this.changeCallback(true);
          this.arrowIcon.style.opacity = '1';
          this.arrowIcon.classList.remove('right');
          this.sliderPosition = 'left';
        }, 300);
        this.sliderState = false;
      }
      if (this.xPos - this.xElem > this.dEnd/2 + 3) {
        this.selectedItem.style.left = this.dEnd + 'px';
        this.selectedItem.classList.add('transition');
        setTimeout(() => {
          if (this.changeCallback) this.changeCallback(false);
          this.arrowIcon.style.opacity = '1';
          this.arrowIcon.classList.add('right');
          this.sliderPosition = 'right';
        }, 300);
        this.sliderState = true;
      }
      this.selectedItem = null;
      this.firedOnce = true;
    }
  }

  private startSliderEvents() {
    document.addEventListener('touchstart', this.onTouchStart.bind(this));
    document.addEventListener('touchmove', this.onTouchMove.bind(this));
    document.addEventListener('touchend', this.onTouchEnd.bind(this));
  }

  private stopSliderEvents() {
    document.removeEventListener('touchstart', this.onTouchStart.bind(this));
    document.removeEventListener('touchmove', this.onTouchMove.bind(this));
    document.removeEventListener('touchend', this.onTouchEnd.bind(this));
  }
}
