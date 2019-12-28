import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavParams, ViewController, NavController} from 'ionic-angular';

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

  ngAfterViewInit() {

  }
}
