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
    elRef: ElementRef
  ) {
      this.user = this.authPrvd.getAuthData();
      this.places.displayNearRoutes=false;
  }

    ionViewDidEnter() {
        this.toolsPrvd.showLoader();
        this.getAndUpdateUndercoverMessages()
    }

    private getAndUpdateUndercoverMessages() {
        this.chatPrvd.getNearByMessages(this.netwrkLineList, null, false).subscribe(res => {
            this.toolsPrvd.hideLoader();
            this.netwrkLineList=res.messages;
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


    public followNearByNetwork(message) {
        this.toolsPrvd.showLoader();
        message.is_followed=!message.is_followed;
        this.chatPrvd.followUserToLine(message.id).subscribe(res => {
            this.toolsPrvd.hideLoader();
            this.toolsPrvd.showToast('Followed Line successfully');
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
                    res = this.chatPrvd.organizeMessages(res.messages);
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
}
