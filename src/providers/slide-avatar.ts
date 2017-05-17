import { Injectable } from '@angular/core';
import { App } from 'ionic-angular';
import { Tools } from '../providers/tools';

import { UndercoverProvider } from '../providers/undercover';

@Injectable()
export class SlideAvatar {

  // sliderState represents slider position:
  // true  - right
  // false - left
  private sliderState: boolean;

  private selectedItem: any = null;
  private arrowIcon: any = null;

  private xPos: number = 0;
  private xElem: number = 0;

  // def: start: -31  end: 129  dragline: 160
  private dStart: number = -31;
  private dEnd: number = 129;

  private firedOnce: boolean = true;

  public changeCallback: (positionLeft?: boolean) => void;
  public sliderPosition: string = null;

  constructor(
    public app: App,
    public undercoverPrvd: UndercoverProvider,
    public toolsPrvd: Tools
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

  public sliderInit(pageTag: string, position?: boolean) {
    let interval = setInterval(() => {
      let currentView = document.querySelector(pageTag);

      if (currentView) {
        this.selectedItem = currentView.querySelectorAll('.draggable-element')['0'];
        console.log('[SLIDER] currentView:', currentView);
        console.log('[SLIDER] selectedItem:', this.selectedItem);

        console.log('slider position ', this.sliderPosition);

        if (this.selectedItem) {
          clearInterval(interval);
          if (typeof position == 'boolean') {

          } else {
            position = this.sliderPosition == 'right' ? true : false;
          }

          if (!this.sliderPosition) {
            this.setSliderDimentions();
            this.setSliderPosition(position);
          } else {
            position = this.sliderPosition == 'right' ? true : false;
            this.setSliderPosition(position);
          }
          this.startSliderEvents();
        } else {
          console.log('error');
        }
      }
    }, 100);
  }

  private setSliderDimentions() {
    let interval = setInterval(() => {
      if (this.selectedItem) {
        clearInterval(interval);
        let dragLineW = this.selectedItem.parentElement.clientWidth;

        if (dragLineW > 0 && this.selectedItem.offsetWidth > 0) {
          console.log(dragLineW);

          this.dStart = 0 - this.selectedItem.offsetWidth / 2;
          this.dEnd = dragLineW - this.selectedItem.offsetWidth / 2;
        }
        console.log(this.selectedItem.offsetWidth);

        console.log('start:', this.dStart, ' end:', this.dEnd, ' dragline:', dragLineW);
      }
    }, 100);
  }

  public setSliderPosition(state?: boolean) {
    // if (!state) state = true;
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
      let xPosxElem = this.xPos - this.xElem;
      let dEndDivTwo = this.dEnd / 2 + 3;
      console.log(this.xPos, this.xElem)

      this.arrowIcon.style.opacity = '1';
      this.selectedItem.classList.add('transition');
      if (xPosxElem <= dEndDivTwo) {
        this.selectedItem.style.left = this.dStart + 'px';
        this.sliderPosition = 'left';
        this.arrowIcon.classList.remove('right');
        this.sliderState = false;
      } else if (xPosxElem > dEndDivTwo) {
        this.selectedItem.style.left = this.dEnd + 'px';
        this.sliderPosition = 'right';
        this.arrowIcon.classList.add('right');
        this.sliderState = true;
      }
      this.selectedItem = null;
      this.firedOnce = true;
      if (this.changeCallback) this.changeCallback(!this.sliderState);
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
