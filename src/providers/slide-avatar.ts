import { Injectable } from '@angular/core';
import { App,AlertController } from 'ionic-angular';
import { Tools } from './tools';

import { UndercoverProvider } from './undercover';
import { LocalStorage } from './local-storage';

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
  private dEnd: number = 19;

  private firedOnce: boolean = true;

  public changeCallback: (positionLeft?: boolean) => void;
  public sliderPosition: string = 'left';

  public heroDisabled:boolean = false;

  constructor(
    public app: App,
    public undercoverPrvd: UndercoverProvider,
    public toolsPrvd: Tools,
    public storage: LocalStorage,
	private alertCtrl: AlertController
  ) {
    this.app.viewDidLoad.subscribe(view => {
      // console.log('<SLIDER.ts> viewDidLoad');
    });

    this.app.viewDidEnter.subscribe(view => {
      // console.log('<SLIDER.ts> viewDidEnter', view);
    });

    this.app.viewWillLeave.subscribe(view => {
      console.log('<SLIDER.ts> viewWillLeave');
	  /* let metadata = this.storage.get('curr_auth_metadetails');
	  if(metadata.communities_count > 0){
		this.stopSliderEvents();
	  } */
    });

    console.log('getActiveNav', this.app.getActiveNav());
  }

  public sliderInit(pageTag: string) {
	  console.log('sliderinit');
    this.stopSliderEvents();

    this.toolsPrvd.checkIfHeroAvalable().subscribe(res => {
      console.log('checkIfHeroAvalable res:', res);
      if (res.disabled) {
        this.heroDisabled = res.disabled;
        this.stopSliderEvents(); 
      }
      //if (this.storage.get('chat_state') == 'area') {
      //  this.sliderPosition = 'left';
      //}
      let intervalCleared:boolean = false;
      let initInterval = setInterval(() => {
        let currentView = document.querySelector(pageTag);
        if (currentView) {
          this.selectedItem = currentView.querySelectorAll('.draggable-element')['0'];
          if(this.selectedItem.parentElement.classList.contains('landing-lobby')){
			this.dEnd = 19;
		  }else{
			this.dEnd = 129;
		  }
		  
		  if (this.selectedItem) {
            clearInterval(initInterval);
            intervalCleared = true;
            if (!this.heroDisabled) {
              if (this.storage.get('slider_position')==null) {
                this.sliderPosition = 'left';
                this.setSliderDimentions();
                this.setSliderPosition(this.sliderPosition);
              } else {
                this.sliderPosition = this.storage.get('slider_position');
                this.setSliderPosition(this.sliderPosition);
              }
                this.startSliderEvents();
            } else {
			  if (this.storage.get('slider_position')==null) {
                this.sliderPosition = 'left';
			  }
              this.setSliderDimentions();
              this.setSliderPosition(this.sliderPosition);
            }
          } else {
            console.error('Slider interval error: Can not find slider DOM element');
          }
        }
      }, 100);
      if (initInterval && !intervalCleared) {
        setTimeout(() => {
          console.info('Stoping slider\'s init infinite loop...');
          clearInterval(initInterval);
        }, 3000);
      }
    });
  }

  private setSliderDimentions() {
    let interval = setInterval(() => { 
      if (this.selectedItem) {
        clearInterval(interval);
        let dragLineW = this.selectedItem.parentElement.clientWidth;
		console.log('dragLineW'+dragLineW);
        if (dragLineW > 0 && this.selectedItem.offsetWidth > 0) {
          console.log(dragLineW);

          this.dStart = 0 - this.selectedItem.offsetWidth / 2;
          this.dEnd = dragLineW - this.selectedItem.offsetWidth / 2;
        }
      }
    }, 100);
  }

  public setSliderPosition(state?: string) {
    if (this.selectedItem) {
      this.arrowIcon = this.selectedItem.parentElement.children['1'];
	  this.arrowIcon.style.opacity = '1';
	  
      if (state == 'left') {
          if (this.storage.get('slider_position')==null) {
              this.selectedItem.style.left = this.dStart + 'px';
              this.arrowIcon.classList.add('left');
              this.arrowIcon.classList.remove('right');
          }else if(this.storage.get('slider_position')=='left') {
			  this.selectedItem.style.left = this.dStart + 'px';
              this.arrowIcon.classList.add('left');
              this.arrowIcon.classList.remove('right');
          }		 
      } else {
          if(this.storage.get('slider_position')=='right'){
              this.selectedItem.style.left = this.dEnd + 'px';
              this.arrowIcon.classList.add('right');
              this.arrowIcon.classList.remove('left');
          }
      } 	
	  
	  this.sliderPosition = state;
      this.storage.set('slider_position', state);
    }
  }

  private onTouchStart(e) {
	this.storage.rm('identity_warning'); 
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
	  console.log(this.xElem);
	  let metadata = this.storage.get('curr_auth_metadetails');
	  console.log('metadata',metadata.communities_count); 
	  if(metadata && metadata.communities_count > 0 && parseInt(metadata.user_points_count) > -120 && metadata.community_identity != null){
		  this.selectedItem = e.target;
		  let xPosxElem = this.xPos - this.xElem;
		  let dEndDivTwo = this.dEnd / 2 + 3;

		  this.arrowIcon.style.opacity = '1';
		  this.selectedItem.classList.add('transition');
		  if (xPosxElem <= dEndDivTwo) {
			this.selectedItem.style.left = this.dStart + 'px';
			this.arrowIcon.classList.remove('right');
			this.sliderState = false;
			if (this.changeCallback) {
			  if (this.sliderPosition != 'left') {
				this.sliderPosition = 'left';
				this.storage.set('slider_position', this.sliderPosition);
				this.changeCallback(true);
			  }
			}
		  } else if (xPosxElem > dEndDivTwo) {
			this.selectedItem.style.left = this.dEnd + 'px';
			this.arrowIcon.classList.add('right');
			this.sliderState = true;
			if (this.changeCallback) {
			  if (this.sliderPosition != 'right') {
				this.sliderPosition = 'right';
				this.storage.set('slider_position', this.sliderPosition);
				this.changeCallback(false);
			  }
			}
		  }
		  this.selectedItem = null;
		  this.firedOnce = true; 		 
	  }else{
		this.selectedItem.style.left = this.dStart + 'px';
		let popupDetails: any = [];
		if(metadata.communities_count <= 0 || metadata.community_identity == null){
			popupDetails.goodStuffPopupHtml = '<div class="center good-stuff-content"><div class="label-18 normal-text"><strong>You must create a community to use its name.</strong></div></div>';
		}else{
			popupDetails.goodStuffPopupHtml = '<div class="center good-stuff-content"><div class="label-18 normal-text"><strong>Your privilege to have an alternate identity has been disabled. Please go and ponder what it would take to be your best self!</strong></div></div>';
		}
		popupDetails.cssClass = 'good-stuff';
		popupDetails.buttonText = 'Okay!';
		popupDetails.buttonCssClass = 'try-span';	
		popupDetails.buttonHandler = () => {this.storage.rm('identity_warning');};
		let alert = this.alertCtrl.create({
			subTitle: popupDetails.goodStuffPopupHtml,
			cssClass: popupDetails.cssClass,
			buttons: [ {
				cssClass: popupDetails.buttonCssClass ,
				text: popupDetails.buttonText,
				handler:() => {
					alert.dismiss();
					popupDetails.buttonHandler();
					return false; 
				}
			}]
		});
		if(!this.storage.get('identity_warning')){
			this.storage.set('identity_warning',1);
			console.log('show alert');
			alert.present();
		}
	  
		return false; 
	  }  
		 
	}	
  }

  private startSliderEvents() {
	if (!this.heroDisabled) {
      document.addEventListener('touchstart', this.onTouchStart.bind(this));
      document.addEventListener('touchmove', this.onTouchMove.bind(this));
      document.addEventListener('touchend', this.onTouchEnd.bind(this));
    }
  }
    
  private stopSliderEvents() {
	document.removeEventListener('touchstart', this.onTouchStart.bind(this));
    document.removeEventListener('touchmove', this.onTouchMove.bind(this));
    document.removeEventListener('touchend', this.onTouchEnd.bind(this));
  }
}
