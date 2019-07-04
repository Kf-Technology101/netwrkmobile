import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, App } from 'ionic-angular';

import { ChatPage } from '../chat/chat';		

import { Chat } from '../../providers/chat';
import { User } from '../../providers/user';
import { Auth } from '../../providers/auth';
import { Tools } from '../../providers/tools';

/**
 * Generated class for the ProfileNameImgPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-profile-name-img',
  templateUrl: 'profile-name-img.html',
})
export class ProfileNameImgPage {

  @ViewChild('input') nativeInputBtn: ElementRef
  
  public userName:any;
  public tempFiles:any = [];
  public lineimg: string;
  public user: any;
  public formValidator: any = {};
  
  constructor(
	  public navCtrl: NavController, 
	  public navParams: NavParams,
	  public chatPrvd: Chat,
	  public authPrvd: Auth,
	  public userPrvd: User,
	  public tools: Tools,
	  public app: App
  ) {
	  this.lineimg = this.chatPrvd.defaultAvatarUrl();
	  this.user = this.authPrvd.getAuthData();
	  this.formValidator={
		'all':'Profile name and image is required.',
		'userName': 'Please add name for your profile.',
		'tempFiles': 'Please upload an image for your profile.',
		'tempFilesType': 'Profile image is invalid.'
	  }
	  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfileNameImgPage');
  }


  public filesAdded(event): void {
	let formValid: boolean = true;
	
	if(!this.userName && this.tempFiles.length <= 0){
		this.tools.showToast(this.formValidator.all);
		formValid = false;
	}else if(!this.userName){
		this.tools.showToast(this.formValidator.userName);
		formValid = false;
	}else if(this.tempFiles.length <= 0){
		this.tools.showToast(this.formValidator.tempFiles);
		formValid = false;
	}
	
	if(formValid){
		this.tools.showLoader();	
		let userId = this.user.id;
		let fieldName: string;		
		let formData:any = null;
		
		fieldName = 'avatar';
		formData = {
			name: this.userName
		};
		
		if (this.tempFiles.length > 0) {
		  this.userPrvd.updateProfileNameAvatar(userId, this.tempFiles, formData, fieldName).then(res => {
			this.user = res;
			this.app.getRootNav().setRoot(ChatPage);
		  }, err => {
			this.tools.hideLoader();
		  }); 
		} else {
		  this.tools.hideLoader();
		}
	}else{
		return;
	}
   
  }


  public loadImage(event): void {
    this.tools.showLoader(); 
    let files: FileList = (<HTMLInputElement>event.target).files;    
   
	if(files.length > 0){
		this.tempFiles = [];
		for (let i = 0; i < files.length; i++) {
		  this.tempFiles.push(files.item(i));
		  let reader = new FileReader();
		  reader.onload = e => this.lineimg = reader.result;
		  reader.readAsDataURL(files.item(i));
		}
	}	
	this.tools.hideLoader();	
  }
  
  
}
