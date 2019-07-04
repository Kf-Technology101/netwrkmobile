import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ViewController,NavController, NavParams, Platform, App } from 'ionic-angular';

import { Api } from '../../providers/api';
import { Chat } from '../../providers/chat';

import { UndercoverCharacterPage } from '../../pages/undercover-character/undercover-character';
import { ChatPage } from '../../pages/chat/chat';

// Providers
import { Gps } from '../../providers/gps';
import { UndercoverProvider } from '../../providers/undercover';
import { SlideAvatar } from '../../providers/slide-avatar';
import { Tools } from '../../providers/tools';
import { Auth } from '../../providers/auth';
import { Places } from '../../providers/places';
import { LocalStorage } from '../../providers/local-storage';
import { FeedbackService } from '../../providers/feedback.service';

import { ProfilePage } from '../../pages/profile/profile';
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

  public isUndercover: boolean;
  public user: any = {};
  public netwrkLineList: any = [];
  public isProcessing: boolean;
  public nclAddedCnt: number = 0;
  public currentCLLobbyIndex: number = null;
  
  constructor(
    private viewCtrl: ViewController,
    private api: Api,
    public app: App,
    private chatPrvd: Chat,
    public platform: Platform,
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
    elRef: ElementRef
  ) {
      this.user = this.authPrvd.getAuthData();
      this.places.displayNearRoutes=false;
	  this.storage.rm('local_coordinates');
	  this.gpsPrvd.getMyZipCode();
	  let loc = {
		  lat : parseFloat(this.gpsPrvd.coords.lat),
		  lng : parseFloat(this.gpsPrvd.coords.lng)
	  }
	  this.chatPrvd.isLandingPage=false;
	  this.storage.set('local_coordinates',loc);	  
  }

    ionViewDidEnter() {
        this.toolsPrvd.showLoader();
		this.isProcessing = true;
        this.getAndUpdateUndercoverMessages()
		 this.toolsPrvd.hideLoader();
    }

    private getAndUpdateUndercoverMessages() {		
		console.log('[netwrkLineList]'+this.netwrkLineList);
        this.chatPrvd.getNearByMessages(this.netwrkLineList, null, false).subscribe(res => {
            res = this.chatPrvd.organizeMessages(res.messages,true);
			// console.log('netwklist',res);
			this.netwrkLineList=res;
			this.isProcessing = false;
        }, err => {
            this.toolsPrvd.hideLoader();
        });
    }

    private goToProfile(profileId?: number, profileTypePublic?: boolean,userRoleName?: any):void {
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
    }

    private goToLobby(messageParams:any){
        this.chatPrvd.postMessages=[];
        this.chatPrvd.isCleared = true;
        messageParams.image_urls='';
        this.app.getRootNav().setRoot(ChatPage, {message:messageParams});
    }

    public resetFilter():void {
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
    }

    public followNearByNetwork(message) {
        this.toolsPrvd.showLoader();
        message.is_followed=!message.is_followed;
        this.chatPrvd.followUserToLine(message.id).subscribe(res => {
            this.toolsPrvd.hideLoader();
            this.toolsPrvd.showToast('Followed successfully');
        }, err => {
            this.toolsPrvd.hideLoader();
        });
    }

    public goToLanding() {
        this.chatPrvd.postMessages=[];
        this.chatPrvd.isCleared = true;
        this.app.getRootNav().setRoot(ChatPage);
    }

    private refreshChat(refresher?:any, forced?:boolean):Promise<any> {
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
    }

    public listenForScrollEnd(event):void {
        this.zone.run(() => {
            console.log('scroll end...');
        });
    }

    private doInfinite(ev):void {
        setTimeout(() => {
            this.refreshChat(ev).then(succ => ev.complete(), err => ev.complete());
        }, 500);
    }

  public closeModal():void {
      this.viewCtrl.dismiss();

      let pageIndex = this.navCtrl.length() - 1;

      this.app.getRootNav().setRoot(ChatPage).then(() => {
          if(pageIndex){
              this.navCtrl.remove(pageIndex);
          }
      });
  }
  
  public openLineLobby(message:any){
	  if(this.user.id != message.user_id && message.locked_by_user){
		 console.log('Private Line...') 
	  }else{
		this.toolsPrvd.showLoader();
		this.storage.set('parameterData', '{"messagePermalink":'+message.id+'}');
		this.chatPrvd.isCleared = true;
        this.app.getRootNav().setRoot(ChatPage);
	  }
  }
  
  public getNCL(message:any,event,index){
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
  }
  
}
