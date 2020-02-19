import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavParams, ViewController, NavController} from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';

import { LocalStorage } from '../../providers/local-storage';
import { Tools } from '../../providers/tools';

@Component({
  selector: 'custom',
  templateUrl: 'custom.html'
})
export class CustomModal {
 
  public inputElement: any = '';
  public placeholderText:any = "Get together at 7?";
  public isError:boolean = false;
  constructor(
    public viewCtrl: ViewController,
    private params: NavParams,
	public storage: LocalStorage,
	public toolsPrvd: Tools,
	private keyboard: Keyboard,
    private navCtrl: NavController
  ) {
    
  }

  private closeModal():any {
    // this.navCtrl.pop();
	this.viewCtrl.dismiss();
  }
  
  private saveModal(){
	if(this.inputElement.trim() != ''){
		if(this.storage.get('last-activity') && this.storage.get('last-activity')!=''){
			let item = this.storage.get('last-activity');
			item.itemName = this.inputElement.trim();
			this.storage.set('last-activity', item);
		}else{
			let item = {itemName: "Custom"};
			item.itemName = this.inputElement.trim();
			this.storage.set('last-activity', item);
		}
		this.isError = false;
		this.toolsPrvd.showLoader();
		this.viewCtrl.dismiss();
	}else{
		this.isError = true;
	}	
  }
  
  public inputOnFocus():void {
	  // console.log( <HTMLElement>document.querySelector('.customActivityFooter'));
	// this.textareaFocused = true;
	this.keyboard.onKeyboardShow().subscribe(res => {
		// this.toolsPrvd.showToast('Keyboard show with height '+res.keyboardHeight);
		let keyboardHeight = res && res.keyboardHeight ? res.keyboardHeight+ 'px' : '30%';
		let scrollEl = <HTMLElement>document.querySelector('.customActivityFooter');
		if (scrollEl){
			// this.toolsPrvd.showToast('customActivityFooter '+keyboardHeight);
			scrollEl.style.bottom = keyboardHeight;				
		}      
	}, err =>{
		console.error(err);
		// this.toolsPrvd.showToast('on-keyboard-show error 2');
	}); 
	
	this.keyboard.onKeyboardHide().subscribe(res => {
		try {
			let scrollEl = <HTMLElement>document.querySelector('.customActivityFooter');
			if (scrollEl)
				scrollEl.style.bottom = '0px';
		} catch (e) {
			console.error('on-keyboard-hide error:', e);
			// this.toolsPrvd.showToast('on-keyboard-hide error');
		}   
		
	}, err =>{
		console.error(err);
		// this.toolsPrvd.showToast('on-keyboard-hide error 2');
	}); 
  }
  ngAfterViewInit() {

  }
}
