import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ViewController,NavController, NavParams, Platform } from 'ionic-angular';

import { Api } from '../../providers/api';
import { Chat } from '../../providers/chat';

import { NetworkFindPage } from '../../pages/network-find/network-find';
import { NetworkNoPage } from '../../pages/network-no/network-no';
import { NetworkPage } from '../../pages/network/network';
import { ChatPage } from '../../pages/chat/chat';
// Providers
import { Gps } from '../../providers/gps';
import { UndercoverProvider } from '../../providers/undercover';
import { SlideAvatar } from '../../providers/slide-avatar';
import { Tools } from '../../providers/tools';
import { Auth } from '../../providers/auth';


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
  selector: 'modal-netwrklist',
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
export class NetwrklistModal {

  public isUndercover: boolean;
  public user: any = {};
  public netwrkLineList: any = [];

  constructor(
    private viewCtrl: ViewController,
    private api: Api,
    private chatPrvd: Chat,
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public toolsPrvd: Tools,
    public zone: NgZone,
    public gpsPrvd: Gps,
    public slideAvatarPrvd: SlideAvatar,
    public authPrvd: Auth,
    elRef: ElementRef
  ) {
      this.user = this.authPrvd.getAuthData();
  }

  ionViewDidEnter() {
     this.getAndUpdateUndercoverMessages()
  }
    private getAndUpdateUndercoverMessages() {
        this.chatPrvd.getNearByMessages(this.isUndercover, this.netwrkLineList, null, true).subscribe(res => {
            this.netwrkLineList=res.messages;
        }, err => {
            this.toolsPrvd.hideLoader();
        });
    }


    public followNearByNetwork(message) {
        message.isFollowed=true;
        this.toolsPrvd.showLoader();
        this.chatPrvd.connectUserToChat(message.room_id).subscribe(res => {
            this.toolsPrvd.hideLoader();
            this.toolsPrvd.showToast('User connected successfully');
        }, err => {
            this.toolsPrvd.hideLoader();
            this.toolsPrvd.showToast('User already connected');
        });
    }

    public goToLanding() {
        this.viewCtrl.dismiss();
        this.toolsPrvd.pushPage(ChatPage);
    }

    private refreshChat(refresher?:any, forced?:boolean):Promise<any> {
        return new Promise((resolve, reject) => {
            this.chatPrvd.getNearByMessages(true, this.netwrkLineList, null, true)
                .subscribe(res => {
                    res = this.chatPrvd.organizeMessages(res.messages);
                    for (let i in res) this.netwrkLineList.push(res[i]);
                    this.chatPrvd.messageDateTimer.start(this.netwrkLineList);
                    this.chatPrvd.isCleared = false;
                    if (refresher) refresher.complete();
                    resolve();
                }, err => {
                    console.error(err);
                    if (refresher) refresher.complete();
                    reject();
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
            this.refreshChat().then(succ => ev.complete(), err => ev.complete());
        }, 500);
    }

  public closeModal():void {
    this.viewCtrl.dismiss();
      this.toolsPrvd.pushPage(ChatPage);
  }
}
