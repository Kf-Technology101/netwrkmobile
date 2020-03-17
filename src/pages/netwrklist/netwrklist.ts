import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ViewController,NavController, NavParams, Platform, ModalController, App,AlertController } from 'ionic-angular';
// import { Contacts, ContactFieldType, ContactFindOptions } from 'ionic-native';
// import { SMS } from '@ionic-native/sms/ngx';
import { SocialSharing } from '@ionic-native/social-sharing';
//pages
import { UndercoverCharacterPage } from '../../pages/undercover-character/undercover-character';
import { ChatPage } from '../../pages/chat/chat';
import { ProfilePage } from '../../pages/profile/profile';
import { HoldMapPage } from '../../pages/hold-map/hold-map';
import { Keyboard } from '@ionic-native/keyboard';
import { AppAvailability } from '@ionic-native/app-availability';

// Providers
import { Gps } from '../../providers/gps';
import { UndercoverProvider } from '../../providers/undercover';
import { SlideAvatar } from '../../providers/slide-avatar';
import { Tools } from '../../providers/tools';
import { Auth } from '../../providers/auth';
import { Places } from '../../providers/places';
import { LocalStorage } from '../../providers/local-storage';
import { FeedbackService } from '../../providers/feedback.service';
import { Api } from '../../providers/api';
import { Chat } from '../../providers/chat';
import { Settings } from '../../providers/settings';
import { ContactsProvider } from '../../providers/contacts';

import { SnapProvider } from '../../providers/snap';

// Modals
import { CustomModal } from '../../modals/custom/custom';
import * as moment from 'moment';

// Animations
import {
    animSpeed,
        chatAnim,
        toggleInputsFade,
        rotateChatPlus,
        toggleChatOptionsBg,
        scaleMainBtn,
        toggleGallery,
        toggleFade,
        slideToggle,
        toggleUcSlider,
        lobbyAnimation
} from '../../includes/animations';
import { ModalRTLEnterAnimation } from '../../includes/rtl-enter.transition';
import { ModalRTLLeaveAnimation } from '../../includes/rtl-leave.transition';

@Component({
  selector: 'page-netwrklist',
  templateUrl: 'netwrklist.html',
    animations: [
        toggleInputsFade,
        rotateChatPlus,
        toggleChatOptionsBg,
        scaleMainBtn,
        toggleGallery,
        toggleFade,
        slideToggle,
        toggleUcSlider,
        lobbyAnimation
    ]
})


export class NetwrklistPage {
customYearValues = [2020, 2016, 2008, 2004, 2000, 1996];
customDayShortNames = ['sun', 'mon', 'tues', 'wed', 'thur', 'fri', 'sat'];
customPickerOptions: any; 
  @ViewChild('textInput') txtIn;
  @ViewChild('activityDateInput') activityDateInput; 
  public isUndercover: boolean;
  public user: any = {};
  public netwrkLineList: any = [];
  public posts: any = [];
  public isProcessing: boolean;
  public nclAddedCnt: number = 0;
  public currentCLLobbyIndex: number = null;
  public activity :any=[];
  public activitySelected:any;
  public locationSelected:any;
  public dateTimeSelected:any ='';
  public showActivitiesContainer: boolean = false; 
  public showContactsStep: boolean = false; 
  public postLoading: boolean = false; 
  public placeholderText:any = 'Tap to add additional text';
  public selectedCommunity: any = [];
  public selectedContacts: any = [];
  public contacts = [];
  public listType = '';
  public checkCommunityFlag: boolean;
  public checkContactFlag: boolean;
  public isDisabled: boolean = false;
  public newlyAdded:any = null;
  public isCreateCheck:boolean = false;
  public createNewCommunity:boolean = false;
  public shareViaSnapchat:boolean = false;
  public shareViaTwitter:boolean = false;
  public shareViaFacebook:boolean = false;
  public shareViaInstagram:boolean = false;
  public holdSaveLM:boolean = false;
  public minYear: string;
  public maxYear: string;
  public shareWith = null;
  public lm_title: string = '';
  public activityDate='';
  public isWeekly: boolean = false;
  
  public showFbApp: boolean = false;
  public showTwitterApp: boolean = false;
  
  constructor(
    private viewCtrl: ViewController,
    private api: Api,
    public app: App,
    private chatPrvd: Chat,
    public platform: Platform,
	public modalCtrl: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public toolsPrvd: Tools,
    public storage: LocalStorage,
    public places: Places,
    public zone: NgZone,
    public gpsPrvd: Gps,
    public slideAvatarPrvd: SlideAvatar,
    public authPrvd: Auth,
	public feedbackService: FeedbackService,
	public settings: Settings,
	public contactsPrvd: ContactsProvider,
	private keyboard: Keyboard,
    elRef: ElementRef,
	public socialSharing: SocialSharing,
	private alertCtrl: AlertController,
	public snap: SnapProvider,
	private appAvailability: AppAvailability
  ) {
	  let fbappSlug;
	  let twitterappSlug;
	  if (this.platform.is('ios')) {
		fbappSlug = 'fb://';
		twitterappSlug = 'twitter://';
	  } else if (this.platform.is('android')) {
		fbappSlug = 'com.facebook.android';
		twitterappSlug = 'com.twitter.android';
	  }	  
	  
	  /* this.appAvailability.check(fbappSlug).then(
		(yes: boolean) => {
			this.showFbApp = true; 
			// this.toolsPrvd.showToast(fbappSlug+' is available.');
		},
		(no: boolean) => {
			this.showFbApp = false;
			// this.toolsPrvd.showToast(fbappSlug+' is not available.');
		}
	  );
	  this.appAvailability.check(twitterappSlug).then(
		(yes: boolean) => { 
			this.showTwitterApp = true;
			// this.toolsPrvd.showToast(twitterappSlug+' is available.');
		},
		(no: boolean) => {
			this.showTwitterApp = false;
			// this.toolsPrvd.showToast(twitterappSlug+' is not available.');
		}
	  );  */
	  
	/*   this.appAvailability.check(fbappSlug).then(() => {
		this.showFbApp = true; 
		this.toolsPrvd.showToast(fbappSlug+' is available.');
	  }).catch(() => {
		this.showFbApp = false; 
		this.toolsPrvd.showToast(fbappSlug+' is not available.');
	  });	  
	  this.appAvailability.check(twitterappSlug).then(() => {
		this.showTwitterApp = true; 
		this.toolsPrvd.showToast(twitterappSlug+' is available.');
	  }).catch(() => {
		this.showTwitterApp = false; 
		this.toolsPrvd.showToast(twitterappSlug+' is not available.');
	  });  */ 
	  	  
	 /*  this.socialSharing.canShareVia('com.apple.social.facebook', 'Check for share', null, null, null).then(() => {
		this.showFbApp = true; 
		this.toolsPrvd.showToast('facebook is available.');
	  }).catch(() => {
		this.showFbApp = false; 
		this.toolsPrvd.showToast('facebook is not available.');
	  });
	  
	  this.socialSharing.canShareVia('twitter', 'Check for share', null, null, null).then(() => {
		this.showTwitterApp = true; 
		this.toolsPrvd.showToast('twitter is available.');
	  }).catch(() => {
		this.showTwitterApp = false; 
		this.toolsPrvd.showToast('twitter is not available.');
	  }); */

	  	  
	  let mindate = new Date(); // today
	  let maxdate = new Date(mindate.getFullYear(),mindate.getMonth(),mindate.getDate()+365);
	  this.minYear = mindate.toISOString();
	  this.maxYear = maxdate.toISOString();
	  
	  this.listType = 'phones'; 
	  this.contactsPrvd.getContacts(this.listType).then(data => {
		  this.contacts = data;
		  if (this.contacts.length > 0) {
			console.log(this.contacts);
		  } else {
			this.toolsPrvd.showToast('Contacts not available');
			this.toolsPrvd.hideLoader();
		  }
      }, err => {
		  this.toolsPrvd.showToast('Contacts not available');
		  this.toolsPrvd.hideLoader();
      });
	
	  if(this.storage.get('edited-page')=='holdpage'){
		// this.showMessages();
		this.holdSaveLM = true;
		let localMessageDetails = this.storage.get('localMessageDetails');
		this.selectedContacts = localMessageDetails.selectedContacts;
		this.txtIn = { value: localMessageDetails.txtIn };
		this.selectedCommunity = localMessageDetails.selectedCommunity;
		if(this.navParams.get('message')){
			this.newlyAdded = this.navParams.get('message');
			this.selectedCommunity.push(this.newlyAdded);
		} 
		this.storage.rm('edited-page');
		this.performPostMessage();
	  }else{
		this.loadActivity();
		this.user = this.authPrvd.getAuthData();
		this.storage.rm('local_coordinates');
		let loc = {
		  lat : parseFloat(this.gpsPrvd.coords.lat),
		  lng : parseFloat(this.gpsPrvd.coords.lng)
		}
		this.storage.set('local_coordinates',loc);	  
	  }	  
	  console.log(this.user);
  }
	 
  public loadActivity(){
	return new Promise(resolve => {
		this.activity = [];
		this.activity.push({itemName: "+ Create an activity or topic"}); 
		this.activity.push({itemName: "Go on an adventure"});
		this.activity.push({itemName: "Dinner"});
		this.activity.push({itemName: "Lunch"});
		this.activity.push({itemName: "Hang out"});
		this.activity.push({itemName: "Work out"});
		this.activity.push({itemName: "Ball"});
		this.activity.push({itemName: "Game"});
		this.activity.push({itemName: "Jam"});  
		this.activity.push({itemName: "Surf"});
		this.activity.push({itemName: "Chill"});
		this.activity.push({itemName: "Hike"});
		this.activity.push({itemName: "Yoga"});
		this.activity.push({itemName: "Chat"});
		this.activity.push({itemName: "Skate"});		
		resolve(true);        
	}); 
  }
  
  public show_activity(){
	this.loadActivity();
	this.showActivitiesContainer = true;	
  }
  
  public select_activity(item){
	if(item.itemName == this.activity[0].itemName){//this.activity.length
		// this.storage.set('last-activity', item);
		// popup text box for custom input
		this.showActivitiesContainer = false;
		let customModal = this.modalCtrl.create(CustomModal,{}, {
		  showBackdrop: true,
		  enableBackdropDismiss: true,
		  enterAnimation: 'modal-slide-left',
		  leaveAnimation: 'modal-slide-right'
		});
		setTimeout(() => {
			customModal.present();
		}, chatAnim/2);
		
		customModal.onDidDismiss(data => {
			this.toolsPrvd.showLoader();
			if(this.storage.get('last-activity') && this.storage.get('last-activity')!='' && this.storage.get('last-activity')!=undefined && this.storage.get('last-activity')!=null){
				let item = this.storage.get('last-activity');
				if(item.itemName != this.activity[0].itemName){
					this.activitySelected = item.itemName;
				}
			}				
			this.toolsPrvd.hideLoader();			
		});
	}else{
		this.storage.set('last-activity', item);
		this.activitySelected = item.itemName;
		this.showActivitiesContainer = false;	
	}
  }
  
  public select_loaction(){
	this.toolsPrvd.pushPage(HoldMapPage);
  }
  public select_dateTime(){
	
  }
  
  public remove_loaction(){
	this.storage.set('last_hold_location_details','');
	this.locationSelected = '';
  }
  
  public showContacts(){     
	if(this.storage.get('last-activity') && this.storage.get('last-activity')!=''){
		this.showContactsStep = true;
		console.log('asdasd');
		this.chatPrvd.mainBtn.setState('txtual-move');
		
		let locDetails = this.storage.get('last_hold_location_details');
		let place_name = locDetails?locDetails.place_name:'';
		
		this.lm_title = this.activitySelected;
		if(place_name !=''){
			this.lm_title += ' near '+place_name;
		}
		if(this.activityDate != ''){
			let today = new Date(); // today
			if(moment.utc(today).format("L") == moment.utc(this.activityDate).format("L")){
				this.lm_title += ' at '+ moment.utc(this.activityDate).format("LT");
			}else{
				this.lm_title += ' on '+ moment.utc(this.activityDate).format("MMM D");
			}
		} 
		this.lm_title +='?';
		
		this.toolsPrvd.showLoader();
		this.showMessages();
	}else{
		this.toolsPrvd.showToast('Select activity to share.'); // and location  
	}
	/* else if(this.storage.get('last-activity') && this.storage.get('last-activity')!=''){
		let alert = this.alertCtrl.create({
			subTitle: 'Do you wants to create private group?',
			buttons: [{
			  text: 'No', 
			  role: 'cancel',
			  handler: () => {
				alert.dismiss();
			  }
			}, {
			  cssClass: 'active',
			  text: 'Yes',
			  handler: () => {
				alert.dismiss();
				this.toolsPrvd.showLoader();
				this.createPrivateGroup(); 
			  }
			}]
		});
		alert.present();		  
		
	} */	
  }
  
  
  private showMessages():Promise<any> {
    return new Promise ((resolve, reject) => {
      let params: any = {
        offset: this.posts.length
      }; 
 
      let mesReq = this.chatPrvd.getFollowedAndOwnLine(params).subscribe(res => {
		  
        if (res) {
		  if (params.offset == 0) this.posts = [];
          for (let m of res.messages) {
            // m.date = this.toolsPrvd.getTime(m.created_at)
            this.posts.push(m);
          }
          this.postLoading = false;
          this.toolsPrvd.hideLoader();
          mesReq.unsubscribe();
          resolve('ok');
        }
      }, err => {
        this.postLoading = false;
        this.toolsPrvd.hideLoader();
        mesReq.unsubscribe();
        reject();
      });

      setTimeout(() => {
        this.toolsPrvd.hideLoader();
      }, 10000);
    });
  }
  
  
  public goToLanding() {
	if(!this.showContactsStep){
		this.chatPrvd.isCleared = true;
		this.storage.rm('edited-page');
		this.chatPrvd.request_type = '';
		this.toolsPrvd.popPage();
		// this.app.getRootNav().setRoot(ChatPage);
		
	}else if(this.showContactsStep){
		this.loadActivity();
		this.showContactsStep = false; 
	}
  } 


  public selectMe(data:any, event){
	if(event.checked){
		this.selectedCommunity.push(data);
	}else if(!event.checked){
		let index = this.selectedCommunity.indexOf(data);
		if(index != -1){
			this.selectedCommunity.splice(index, 1);
		}
	}		
  }
  
  public selectPerson(data:any, event){
	if(event.checked){
		this.selectedContacts.push(data);  
	}else if(!event.checked){
		let index = this.selectedContacts.indexOf(data);
		this.selectedContacts.splice(index, 1);
	}
  }
  
  public sendMessage(){
	if(this.createNewCommunity){
		this.toolsPrvd.showLoader();
		if(this.storage.get('last_hold_location_details')){
			let localMessageDetails = {
				selectedContacts: this.selectedContacts,
				txtIn: this.txtIn.value.trim(),
				selectedCommunity: this.selectedCommunity
			};
			this.storage.set('localMessageDetails',localMessageDetails);
			this.storage.set('edited-page','holdpage');	  
			this.settings.isNewlineScope = false;
			this.settings.isCreateLine = true;
			this.toolsPrvd.pushPage(UndercoverCharacterPage);				
		}else{
			this.createPrivateGroup();
		}		
	}else{
		if(this.selectedCommunity.length <= 0){
			this.toolsPrvd.showToast('Select community to share');
		}else{
			this.toolsPrvd.showLoader();
			this.performPostMessage();
		}
	}	
  }
  
  public performPostMessage(){
	this.toolsPrvd.showLoader();
	this.checkCommunityFlag = true;
	this.checkContactFlag = true; 
	if(this.selectedContacts.length > 0){
		this.checkContactFlag = false;
	}
	if(this.selectedCommunity.length > 0){
		this.checkCommunityFlag = false;
	}
	this.postMessage();	
  }
  
  public createNewCommunityF(event){
	if(event.checked){
		this.createNewCommunity = true;		
	}else{
		this.createNewCommunity = false;
	}
  }
  
  public setShare(via){
	this.shareViaSnapchat = false;
	this.shareViaTwitter = false;
	this.shareViaFacebook = false;
	this.shareViaInstagram = false;
	console.log(via);
	switch(via){
		case 'SnapChat':
			this.shareViaSnapchat = true;
		break;
		case 'Instagram':
			this.shareViaInstagram = true;
		break;
		case 'Twitter':
			this.shareViaTwitter = true;
		break;
		case 'Facebook':
			this.shareViaFacebook = true;
		break;	
	}
  }
  
/*   public snapchatShare(event){
	if(event.checked){
		this.shareViaSnapchat = true;		
	}else{
		this.shareViaSnapchat = false;
	} 
  }
  public twitterShare(event){
	if(event.checked){
		this.shareViaTwitter = true;		
	}else{
		this.shareViaTwitter = false;
	} 
  }
   public facebookShare(event){
	if(event.checked){
		this.shareViaFacebook = true;		
	}else{
		this.shareViaFacebook = false;
	} 
  } */
  
  /* public twitterShare(event){
	this.socialSharing.shareViaTwitter(null,null,'https://somvo.app/landing?id=881').then(res=>{
		this.toolsPrvd.showToast('Shared link ');
	}).catch(err=>{
		this.toolsPrvd.showToast('error'+err);
	});;
	
  } 

  public facebookShare(event){
	this.socialSharing.shareViaFacebook(null,null,'https://somvo.app/landing?id=881').then(res=>{
		this.toolsPrvd.showToast('Shared link ');
	}).catch(err=>{
		this.toolsPrvd.showToast('error'+err);
	});
	
  }*/
  
  public sendContactsMessage(message:any){
	return new Promise((resolve, reject) => { 
	
		let messageParamsId = message.id;  
	
		let shareLink = '';
		if (this.platform.is('ios')){
			shareLink = 'somvo://somvo.app/landing/'+ messageParamsId; // this.selectedCommunity[0].id;
		}else{
			shareLink = 'https://somvo.app/landing/'+ messageParamsId; // this.selectedCommunity[0].id;
		}
		
		this.user = this.authPrvd.getAuthData();
		// let shareMessage =  "Want to "+this.activitySelected.toLowerCase()+"? Download https://testflight.apple.com/join/vkIJtwFV"+" and reply via "+shareLink; 
		
		
		// let shareLink = 'https://somvo.app/landing?id='+messageParamsId+'&platform=android';
		let userName = message.public?this.user.name:message.role_name;
		let messageType = message.public?'Public':'Private';
		let shareMessage = '  '+message.title + '? '+message.text+"\n Somvo Community: "+this.selectedCommunity[0].title+"\n Type:"+messageType; 
		
		let contacts = ''; //[]   
		for(let i = 0;i<this.selectedContacts.length;i++){		
			if(contacts == ''){
				contacts = this.selectedContacts[i].phoneNumbers[0].value;
			}else{
				contacts = contacts + ',' + this.selectedContacts[i].phoneNumbers[0].value;
			} 
		}
		this.checkContactFlag = true; 
		this.socialSharing.shareViaSMS(shareMessage,contacts);
		// this.goBackSuccess(message);
		// this.toolsPrvd.hideLoader();
		resolve();
	});  
  }
  
  private createPrivateGroup(){
	this.user = this.authPrvd.getAuthData();
	let publicUser: boolean;
	let images = [];
	let messageParams: any = {};
	let message: any = {};
	let msgrequest_type = '';
	let textInput = '';
	  	
	let messageable_type: any = null;
	let title_desc = this.user.name+' wants to '+this.activitySelected;
	messageParams = {
		messageId		 : null,
		undercover		 : true,
		text			 : title_desc,
		text_with_links	 : title_desc,
		title			 : this.activitySelected,
		user_id			 : this.user ? this.user.id : 0,
		role_name		 : 'Private Group',			
		images			 : [],	
		video_urls		 : [],
		public			 : false,
		place_name		 : '',
		is_emoji		 : false,
		locked			 : false,
		password		 : null,
		hint			 : null,
		expire_date		 : '',
		timestamp		 : Math.floor(new Date().getTime()/1000),
		line_avatar		 : []
	};
	this.gpsPrvd.coords.lat = null;
	this.gpsPrvd.coords.lng = null;
      
	message = Object.assign(message, messageParams);
	message.image_urls = [];
	message.isTemporary = false;
	message.temporaryFor = 0;
	  
	this.chatPrvd.sendMessage(messageParams).then(res => {
	  message.id = res.id;
	  message.user_id = this.user.id;
	  message.user = this.user;
	  this.chatPrvd.getMessageIDDetails(res.id).subscribe(result => {
		// this.toolsPrvd.pushPage(ChatPage,{message:result.message});
		this.newlyAdded = result.message;
		this.selectedCommunity.push(this.newlyAdded);
		// this.newlyAdded.date = this.toolsPrvd.getTime(this.newlyAdded.created_at)
		// this.posts.push(this.newlyAdded);
		this.holdSaveLM = true;
		this.performPostMessage();
		setTimeout(()=>{
			this.isCreateCheck = false;
		});
	  });
	  this.toolsPrvd.hideLoader();
	}).catch(err => {
	 this.toolsPrvd.hideLoader();
	});     
		
  }
  
  private postMessage(emoji?: string, params?: any) {
	try {
		let publicUser: boolean = false; // Private
		let images = [];
		let messageParams: any = {};
		let netwrkParams: any = {};
		let message: any = {};
			
		this.user = this.authPrvd.getAuthData();
		let selectedCommunityIdsArr:any = [];
		for(let i=0; i < this.selectedCommunity.length; i++){
			if(this.selectedCommunity[i].public && !publicUser){ // Check for public
				publicUser = true;
			}
			selectedCommunityIdsArr.push(this.selectedCommunity[i].id);
		} 
		
		let userPublicProfile:boolean;
		if(this.slideAvatarPrvd.sliderPosition == 'left' || this.storage.get('slider_position')=='left'){
            userPublicProfile = true;
        }else{
            userPublicProfile = false;
        }
		
		let currentDate = moment(new Date());
		let locDetails = this.storage.get('last_hold_location_details');
		console.log('locDetails:::',locDetails);
		let place_name = locDetails?locDetails.place_name:'';
		this.chatPrvd.request_type = "LOCAL_MESSAGE";	
		let item = this.storage.get('last-activity');
		this.activitySelected = item.itemName;
		
		let title = this.activitySelected;
		if(place_name !=''){
			title += ' near '+place_name;
		}
		
		if(this.activityDate != ''){
			let today = new Date(); // today
			if(moment.utc(today).format("L") == moment.utc(this.activityDate).format("L")){
				title += ' at '+ moment.utc(this.activityDate).format("LT");
			}else{
				title += ' on '+ moment.utc(this.activityDate).format("MMM D");
			}
		} 
		title +='?';
		
			
		this.gpsPrvd.coords.lat = locDetails?parseFloat(locDetails.loc.lat):null;
		this.gpsPrvd.coords.lng = locDetails?parseFloat(locDetails.loc.lng):null;
		let extra_data = {
			community_ids:selectedCommunityIdsArr,
			activity: this.activitySelected,
			place_name: place_name,
			initial_date: this.activityDate!=''?this.activityDate:moment()
		};
		netwrkParams = {
			messageId		 : null,
			undercover		 : false,
			text			 : this.txtIn.value.trim(),
			text_with_links	 : this.txtIn.value.trim(),
			title			 : title,
			user_id			 : this.user ? this.user.id : 0,
			role_name		 : this.user.role_name,			
			images			 : [],	
			video_urls		 : [],
			public			 : publicUser,
			place_name		 : place_name,
			is_emoji		 : false,
			locked			 : false,
			password		 : null,
			hint			 : null,
			expire_date		 : currentDate.add(12, 'hours'),
			timestamp		 : Math.floor(new Date().getTime()/1000),
			line_avatar		 : [],
			user_public_profile: userPublicProfile,
			extra	 		 : JSON.stringify(extra_data),
			start_date 		 : this.activityDate!=''?this.activityDate:moment(),
			weekly_status    : this.isWeekly
		};
		
		if (params) Object.assign(netwrkParams, params);
		message = Object.assign(message, netwrkParams);
		message.image_urls =[];
		message.isTemporary = false;
		message.temporaryFor = 0; 
		// this.toolsPrvd.showLoader();		
		this.chatPrvd.sendMessage(netwrkParams).then(result => {
			let res 			= result;
			message.id 			= res.id;
			message.user_id		= this.user.id;
			message.user 		= this.user;
			netwrkParams.conversation_line_id = message.id;
			netwrkParams.messageable_type = 'Room';
			netwrkParams.message_ids = selectedCommunityIdsArr;
			netwrkParams.undercover = true;
			
			this.chatPrvd.request_type = "CONV_REQUEST";
			console.log('CONV_REQUEST');
			this.chatPrvd.sendMessage(netwrkParams).then(msg_result => {
				let res = msg_result.send_messages[0];
				res.notification_type = "new_message"; 
				// this.chatPrvd.sendNotification(res).subscribe(notificationRes => {
					this.checkCommunityFlag = true;
					if(this.selectedContacts.length > 0){
						this.sendContactsMessage(message).then(res=>{
							this.goBackSuccess(message);
						});
					}else{
						this.goBackSuccess(message);
					}
				// }, err => console.error(err));				
			}).catch(err => {
				this.toolsPrvd.hideLoader();
			}); 
		}).catch(err => {
			this.toolsPrvd.hideLoader();
		});	
	
	} catch (e) {
		console.error('Error in postMessage:', e);
	}
  }
	
  public goBackSuccess(message:any = {}){
	let successCase;
	if(this.selectedCommunity.length > 0 && this.selectedContacts.length > 0){
		successCase = 1;
	}else if(this.selectedCommunity.length > 0){
		successCase = 2;
	}else if(this.selectedContacts.length > 0){
		successCase = 3;
	}
	let messageParamsId = message.id;  
	let shareLink = 'https://somvo.app/landing?id='+messageParamsId+'&title='+message.title;
	let userName = message.public?this.user.name:message.role_name;
	let messageType = message.public?'Public':'Private';
	let shareMessage = message.title + '? '+message.text+"\n Somvo Community: "+this.selectedCommunity[0].title+"\n Type:"+messageType; 

	if(this.shareViaSnapchat){
		this.socialSharing.shareVia('snapchat', shareMessage, null, null, shareLink).then(res=>{
			this.toolsPrvd.showToast('Shared via SnapChat.');
		}).catch(err=>{
			this.toolsPrvd.showToast('Error: '+err);
		});
	} 
	
	if(this.shareViaTwitter){		
		this.socialSharing.shareViaTwitter(shareMessage,null,shareLink).then(res=>{
			this.toolsPrvd.showToast('Shared link ');
		});
	} 
	
	
	if(this.shareViaInstagram){		
		/* this.socialSharing.shareVia('instagram',shareMessage, null, null,shareLink).then(res=>{
			this.toolsPrvd.showToast('Shared link ');
		}); */ 
		shareMessage = shareMessage + ' ' + shareLink;		
		this.socialSharing.shareViaInstagram(shareMessage,this.user.avatar_url).then(res=>{
			this.toolsPrvd.showToast('Shared link ');
		}); 
	} 
	
	if(this.shareViaFacebook){
		this.socialSharing.shareViaFacebook(shareMessage,null,shareLink).then(res=>{
			this.toolsPrvd.showToast('Shared link');
		});
	} 
	
	
	switch(successCase){
		case 1:		
			if(this.checkCommunityFlag && this.checkContactFlag){
				this.chatPrvd.getMessageIDDetails(messageParamsId).subscribe(res => {	
					this.toolsPrvd.pushPage(ChatPage,{message:res.message});
					this.toolsPrvd.showToast('Somvo sent successfully. Get together and have a great time! ');						
				});
			}
		break;
		case 2:
			if(this.checkCommunityFlag){
				this.chatPrvd.getMessageIDDetails(messageParamsId).subscribe(res => {	
					this.toolsPrvd.pushPage(ChatPage,{message:res.message});
					this.toolsPrvd.showToast('Somvo sent successfully. Get together and have a great time! ');		
				});	
			}
		break;
		case 3:
			if(this.checkContactFlag){
				this.chatPrvd.getMessageIDDetails(messageParamsId).subscribe(res => {	
					this.toolsPrvd.pushPage(ChatPage,{message:res.message});
					this.toolsPrvd.showToast('Somvo sent successfully. Get together and have a great time! ');		
				});	
			}
		break;
	}
	
  }
  
  ionViewDidEnter() {	
	setTimeout(function(){ this.isCreateCheck = false; });
	this.activity = [];
	this.loadActivity();
	if(this.storage.get('last_hold_location_details') && this.storage.get('last_hold_location_details')!='' && this.storage.get('last_hold_location_details')!='undefined'){
		let locDetails = this.storage.get('last_hold_location_details');
		let place_name = locDetails?locDetails.place_name:'';
		let input_string = place_name.indexOf(",")>-1?place_name.substring(0, place_name.indexOf(",")):place_name;
		this.locationSelected = input_string;
		let latlng = {
		  lat : locDetails?parseFloat(locDetails.loc.lat):'',
		  lng : locDetails?parseFloat(locDetails.loc.lng):''
		};		
		this.storage.set('custom_coordinates', latlng);
		this.storage.set('chat_zip_code', locDetails?locDetails.zipcode:'');
		this.storage.set('place_name', locDetails?locDetails.place_name:'');
	}else{
		this.locationSelected = "";
	} 	
	if(this.storage.get('last-activity') && this.storage.get('last-activity')!='' && this.storage.get('last-activity')!=undefined && this.storage.get('last-activity')!=null){
		let item = this.storage.get('last-activity');
		if(item.itemName != this.activity[0].itemName){
			this.activitySelected = item.itemName;
		}
	}else{
		this.activitySelected = "+";
	}	
  }
  
  public inputOnBlur():void{
	this.placeholderText = 'Tap to add additional text';
  }
  
  public inputOnFocus():void {
	this.placeholderText = '';
	this.keyboard.onKeyboardShow().subscribe(res => {		
		let keyboardHeight = res && res.keyboardHeight ? res.keyboardHeight + 'px' : '30%';
		let scrollEl = <HTMLElement>document.querySelector('.message-input');
		if (scrollEl)
			scrollEl.style.bottom = keyboardHeight;		
		this.chatPrvd.mainLineBtn.setState('minimised');              
	}, err =>{
		console.error(err);
	}); 
	
	this.keyboard.onKeyboardHide().subscribe(res => {
		try {
			let scrollEl = <HTMLElement>document.querySelector('.message-input');
			if (scrollEl)
				scrollEl.style.bottom = '27%';
		} catch (e) {
			console.error('on-keyboard-hide error:', e);
		}
		this.chatPrvd.mainLineBtn.setState('normal');    
	}, err =>{
		console.error(err);
	}); 
  }
  
 

}
