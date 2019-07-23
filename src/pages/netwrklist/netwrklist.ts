import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ViewController,NavController, NavParams, Platform, ModalController, App } from 'ionic-angular';
// import { Contacts, ContactFieldType, ContactFindOptions } from 'ionic-native';
//pages
import { UndercoverCharacterPage } from '../../pages/undercover-character/undercover-character';
import { ChatPage } from '../../pages/chat/chat';
import { ProfilePage } from '../../pages/profile/profile';
import { HoldMapPage } from '../../pages/hold-map/hold-map';

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

// Modals
import { CustomModal } from '../../modals/custom/custom';


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
  @ViewChild('textInput') txtIn;
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
  public showActivitiesContainer: boolean = false; 
  public showContactsStep: boolean = false; 
  public postLoading: boolean = false; 
  public placeholderText:any = 'Add a custom portion to your message';
  public selectedCommunity: any = [];
  public selectedContacts: any = [];
  public error_txt:any = '';
  public contacts = [];
  public listType = '';
  public checkCommunityFlag: boolean;
  public checkContactFlag: boolean;
  public isDisabled: boolean = false;
  public newlyAdded:any = null;
  public isCreateCheck:boolean = false;
  
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
    elRef: ElementRef
  ) {
	   /*  Contacts.find(['displayName', 'phoneNumbers'], {filter: "", multiple: true})
		.then(data => {
		  this.contactsfound = data;
		});
		 */
	  if(this.navParams.get('message')){
		this.newlyAdded = this.navParams.get('message');
		this.selectedCommunity.push(this.newlyAdded);
		this.isDisabled = true;
	  }
      this.listType = 'phones'; 
	  this.contactsPrvd.getContacts(this.listType).then(data => {
		  this.contacts = data;
		  if (this.contacts.length > 0 ||
			 (this.contacts[this.listType] &&
			  this.contacts[this.listType].length > 0)) {
			// this.setErrorMessages(this.contacts);
			// this.doSelectAll();
		  } else {
			this.toolsPrvd.showToast('Contacts not available');
		  }
      }, err => {
		  this.toolsPrvd.showToast('Contacts not available');
      });
	
	  if(this.storage.get('edited-page')=='holdpage'){
		this.showContactsStep = true; 
		this.toolsPrvd.showLoader();
		this.showMessages();
		this.storage.rm('edited-page');
	  }else{
		this.loadActivity();
		this.user = this.authPrvd.getAuthData();
		this.gpsPrvd.getMyZipCode();

		this.storage.rm('local_coordinates');
		let loc = {
		  lat : parseFloat(this.gpsPrvd.coords.lat),
		  lng : parseFloat(this.gpsPrvd.coords.lng)
		}
		this.storage.set('local_coordinates',loc);	  
	  }
	  
  }
	 
  public loadActivity(){
	return new Promise(resolve => {
		this.activity = [];
		this.activity.push({itemName: "Hang out",itemId:'1'});
		this.activity.push({itemName: "Go out",itemId:'2'});
		this.activity.push({itemName: "Grab food",itemId:'3'});
		this.activity.push({itemName: "Ball",itemId:'4'});
		this.activity.push({itemName: "Game",itemId:'5'});
		this.activity.push({itemName: "Jam",itemId:'6'});  
		this.activity.push({itemName: "Custom",itemId:'7'});
		
		resolve(true);        
	});           
	
  }
  
  public show_activity(){
	this.loadActivity();
	this.showActivitiesContainer = true;	
  }
  
  public select_activity(item){
	if(item.itemId == 7){
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
			let item = this.storage.get('last-activity');
			this.activitySelected = item.itemName;			
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
  
  
  public showContacts(){     
	if(this.storage.get('last-activity') && this.storage.get('last-activity')!='' && this.storage.get('last_hold_location_details') && this.storage.get('last_hold_location_details')!=''){
		this.showContactsStep = true; 
		this.toolsPrvd.showLoader();
		this.showMessages();
	}else{
		this.toolsPrvd.showToast('Select activity and location to share.');
	}	
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
            m.date = this.toolsPrvd.getTime(m.created_at)
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
		this.app.getRootNav().setRoot(ChatPage);
	}else if(this.showContactsStep){
		this.loadActivity();
		this.showContactsStep = false; 
	}
  } 

  public selectMe(data:any, event){
	if(event.checked){
		if(this.selectedCommunity.length <= 0){
			this.selectedCommunity.push(data);
			this.isDisabled = true;			
		}if(this.selectedCommunity.length > 1){
			this.toolsPrvd.showToast('You could just select one community to share');
		}
	}else if(!event.checked){
		let index = this.selectedCommunity.indexOf(data);
		this.isDisabled = false;
		if(index != -1){
			this.selectedCommunity.splice(index, 1);
		}else{
			this.selectedCommunity = [];
			this.newlyAdded = null;	
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
	if(this.selectedCommunity.length <= 0){
		this.toolsPrvd.showToast('Select community to share');
	}else if(this.selectedContacts.length <= 0 ){
		this.toolsPrvd.showToast('Select contacts to share with');
	}else{
		this.error_txt = '';
		this.checkCommunityFlag = true;
		// this.checkContactFlag = true; 
		this.checkContactFlag = false;
		this.sendContactsMessage();
		
		/* if(this.selectedCommunity.length > 0){
			this.checkCommunityFlag = false;
			this.postMessage();	
		} */
	}
  }
  
  public createNewCommunity(event){
	if(event.checked){
		this.storage.set('edited-page','holdpage')	  
		this.settings.isNewlineScope=false;
		this.settings.isCreateLine=true;
		this.toolsPrvd.pushPage(UndercoverCharacterPage);
	}
  }
  
  public sendContactsMessage(){	
	let shareLink = '';
	for(let i=0; i<this.selectedCommunity.length; i++){
		let message = this.selectedCommunity[i];
		if (this.platform.is('ios')){
			shareLink = 'netwrkapp://netwrkapp.com/landing/'+message.id;
		}else{
			shareLink = 'https://netwrkapp.com/landing/'+message.id;
		}
	}
	
	let shareMessage =  this.activitySelected+' at '+this.locationSelected+'? '+this.txtIn.value.trim()+' '+shareLink;
	
	let contacts = [];
	for(let i = 0;i<this.selectedContacts.length;i++){
		let checkedObj = {
		  name: this.selectedContacts[i].name.formatted,
		  phone: this.selectedContacts[i].phoneNumbers[0].value
		}
		contacts.push(checkedObj);		
	}
	
	this.contactsPrvd.sendSMS(contacts,shareMessage).subscribe(res => {
	  this.checkContactFlag = true; 
	  this.goBackSuccess();
	  this.toolsPrvd.hideLoader();
	}, err => this.toolsPrvd.hideLoader());;
  }
  
  private postMessage(emoji?: string, params?: any) {
	try {
		let publicUser: boolean;
		let images = [];
		let messageParams: any = {};
		let message: any = {};
		
		if(this.slideAvatarPrvd.sliderPosition == 'left' || this.storage.get('slider_position')=='left'){
			publicUser=true; 
		}else{
			publicUser=false;
		}
		
		this.user = this.authPrvd.getAuthData();
		let shareMessage =  this.activitySelected+' at '+this.locationSelected+'? '+this.txtIn.value.trim();
		let selectedCommunityIdsArr:any = [];
		for(let i=0; i < this.selectedCommunity.length; i++){
			selectedCommunityIdsArr.push(this.selectedCommunity[i].id);
		} 
		messageParams = {
			messageable_type : 'Room',
			message_ids 	 : selectedCommunityIdsArr,
			text			 : shareMessage,
			text_with_links	 : shareMessage,
			user_id			 : this.user ? this.user.id : 0,
			role_name		 : this.user.role_name,
			place_name		 : this.gpsPrvd.place_name,
			images			 : [],	
			video_urls		 : [],
			undercover		 : true,
			public			 : publicUser,
			is_emoji		 : false,
			locked			 : false,
			password		 : null,
			hint			 : null,
			expire_date		 : null,
			timestamp		 : Math.floor(new Date().getTime()/1000)
		};
		
		if (params) Object.assign(messageParams, params);

		message = Object.assign(message, messageParams);
		message.image_urls =[];
		message.isTemporary = false;
		message.temporaryFor = 0;
		this.toolsPrvd.showLoader();
		
		this.chatPrvd.sendMessage(messageParams).then(res => {
			message.id 			= res.id;
			message.user_id		= this.user.id;
			message.user 		= this.user;
			this.checkCommunityFlag = true;
			this.goBackSuccess();
			this.toolsPrvd.hideLoader();
		}).catch(err => {
			this.toolsPrvd.hideLoader();
		});
	
	} catch (e) {
		console.error('Error in postMessage:', e);
	}
  }
	
  public goBackSuccess(){
	let successCase;
	if(this.selectedCommunity.length > 0 && this.selectedContacts.length > 0){
		successCase = 1;
	}else if(this.selectedCommunity.length > 0){
		successCase = 2;
	}else if(this.selectedContacts.length > 0){
		successCase = 3;
	}
	switch(successCase){
		case 1:
			if(this.checkCommunityFlag && this.checkContactFlag){
				this.toolsPrvd.pushPage(NetwrklistPage);		
			}
		break;
		case 2:
			if(this.checkCommunityFlag){
				this.toolsPrvd.pushPage(NetwrklistPage);
			}
		break;
		case 3:
			if(this.checkContactFlag){
				this.toolsPrvd.pushPage(NetwrklistPage);
			}
		break;
	}
  }
  
  ionViewDidEnter() {	
	setTimeout(function(){ this.isCreateCheck = false; });
	this.activity = [];
	this.loadActivity();
	if(this.storage.get('last_hold_location_details')){
		let locDetails = this.storage.get('last_hold_location_details');
		let place_name = locDetails.place_name;
		let input_string = place_name.indexOf(",")>-1?place_name.substring(0, place_name.indexOf(",")):place_name;
		this.locationSelected = input_string;
		let latlng = {
		  lat : parseFloat(locDetails.loc.lat),
		  lng : parseFloat(locDetails.loc.lng)
		};
		this.storage.set('custom_coordinates', latlng);
		this.storage.set('chat_zip_code', locDetails.zipcode);
		this.storage.set('place_name', locDetails.place_name);
		
		
	}else{
		this.locationSelected = "Location";
	} 
	

	if(this.storage.get('last-activity')){
		let item = this.storage.get('last-activity');
		this.activitySelected = item.itemName;
	}else{
		this.activitySelected = "Activity";
	}
	
  }
 
    /* private getAndUpdateUndercoverMessages() {		
		console.log('[netwrkLineList]'+this.netwrkLineList);
        this.chatPrvd.getNearByMessages(this.netwrkLineList, null, false).subscribe(res => {
            res = this.chatPrvd.organizeMessages(res.messages,true);
			// console.log('netwklist',res);
			this.netwrkLineList=res;
			this.isProcessing = false;
        }, err => {
            this.toolsPrvd.hideLoader();
        });
    } */

    /* private goToProfile(profileId?: number, profileTypePublic?: boolean,userRoleName?: any):void {
        this.chatPrvd.goToProfile(profileId, profileTypePublic).then(res => {
            this.chatPrvd.isLobbyChat = false;
            if(this.user.id==profileId){
                if(userRoleName){
                    this.toolsPrvd.pushPage(ProfilePage, res);
                }else{
                    this.toolsPrvd.pushPage(UndercoverCharacterPage, res);
                }
            }else{
                this.toolsPrvd.pushPage(ProfilePage, res);
            }
        }, err => {
            console.error('goToProfile err:', err);
        });
    } */

    /* private goToLobby(messageParams:any){
        this.chatPrvd.postMessages=[];
        this.chatPrvd.isCleared = true;
        messageParams.image_urls='';
        this.app.getRootNav().setRoot(ChatPage, {message:messageParams});
    } */

    /* public resetFilter():void {
		if(!this.isProcessing){
			this.isProcessing = true;
			this.toolsPrvd.showLoader();
			if(this.chatPrvd.holdFilter){
				this.chatPrvd.holdFilter=false;
				this.getAndUpdateUndercoverMessages();
				this.toolsPrvd.hideLoader();
			}else{
				this.chatPrvd.holdFilter=true;
				this.getAndUpdateUndercoverMessages();
				this.toolsPrvd.hideLoader();
			}
		}
    } */

    /* public followNearByNetwork(message) {
        this.toolsPrvd.showLoader();
        message.is_followed=!message.is_followed;
        this.chatPrvd.followUserToLine(message.id).subscribe(res => {
            this.toolsPrvd.hideLoader();
            this.toolsPrvd.showToast('Followed successfully');
        }, err => {
            this.toolsPrvd.hideLoader();
        });
    } */

   
    /* private refreshChat(refresher?:any, forced?:boolean):Promise<any> {
        return new Promise((resolve, reject) => {
            this.chatPrvd.getNearByMessages(this.netwrkLineList, null, true)
                .subscribe(res => {
                    res = this.chatPrvd.organizeMessages(res.messages,true);
					for (let i in res) this.netwrkLineList.push(res[i]);
                    if (refresher) refresher.complete();
                    resolve();
                }, err => {
                    console.error(err);
                    if (refresher) refresher.complete(); reject();
                });
        });
    } */

    /* public listenForScrollEnd(event):void {
        this.zone.run(() => {
            console.log('scroll end...');
        });
    } */

    /* private doInfinite(ev):void {
        setTimeout(() => {
            this.refreshChat(ev).then(succ => ev.complete(), err => ev.complete());
        }, 500);
    } */

  /* public closeModal():void {
      this.viewCtrl.dismiss();

      let pageIndex = this.navCtrl.length() - 1;

      this.app.getRootNav().setRoot(ChatPage).then(() => {
          if(pageIndex){
              this.navCtrl.remove(pageIndex);
          }
      });
  } */
  
  /* public openLineLobby(message:any){
	  if(this.user.id != message.user_id && message.locked_by_user){
		 console.log('Private Line...') 
	  }else{
		this.toolsPrvd.showLoader();
		this.storage.set('parameterData', '{"messagePermalink":'+message.id+'}');
		this.chatPrvd.isCleared = true;
        this.app.getRootNav().setRoot(ChatPage);
	  }
  } */
  
  /* public getNCL(message:any,event,index){
	let clBtn = event.currentTarget;
	let currState = clBtn.classList.contains('down-btn')?'down':'up';
	let paElement = clBtn.parentElement;
	if(currState == 'down'){ // perform down action && this.currentCLLobbyIndex == null
		this.toolsPrvd.showLoader();
		this.chatPrvd.getNonCuctomLines(message).subscribe(res => {
			if(res.messages.length > 0){
				res = this.chatPrvd.organizeMessages(res.messages,true);
				for (let i in res){  
					if(parseInt(i) > 0){
						res[i].addClass = true; 
					}
					this.netwrkLineList.splice(index+1,0, res[i]);
				}			
				clBtn.classList.add('up-btn');
				clBtn.classList.remove('down-btn');
				paElement.classList.add('active-cl'); 
				this.toolsPrvd.hideLoader();
			}else{
				this.toolsPrvd.hideLoader();
			}
		}, err => {
			clBtn.classList.add('up-btn');
			clBtn.classList.remove('down-btn');
			paElement.classList.add('active-cl');
			this.toolsPrvd.hideLoader();			
		});	
	}else if(currState == 'up'){ // perform up action
		this.netwrkLineList.splice(index+1,message.lines_count);
		paElement.classList.remove('active-cl');
		clBtn.classList.add('down-btn');
		clBtn.classList.remove('up-btn');
	}	
  } */
  
}
