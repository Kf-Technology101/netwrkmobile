import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ViewController,NavController, NavParams, Platform } from 'ionic-angular';

import { Tools } from '../../providers/tools';
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
  private netwrklist:Array<any> = [];

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
  ) {}

  ionViewDidEnter() {
      this.getAndUpdateUndercoverMessages()
  }
    private getAndUpdateUndercoverMessages() {
        this.chatPrvd.getMessages(true).subscribe(res => {
            this.chatPrvd.postMessages=res.messages;
        }, err => {
            this.toolsPrvd.hideLoader();
        });
    }

    public followNearByNetwork(chatRoomId) {
        this.toolsPrvd.showLoader();
        this.toolsPrvd.showToast('Connected successfully');
        this.chatPrvd.connectUserToChat(chatRoomId).subscribe(res => {
            this.toolsPrvd.hideLoader();
        }, err => {
            this.toolsPrvd.hideLoader();
        });
    }

    public goToLanding() {
        this.toolsPrvd.pushPage(ChatPage);
    }

    private refreshChat(refresher?:any, forced?:boolean):Promise<any> {
        return new Promise((resolve, reject) => {
            this.chatPrvd.getMessages(true, this.chatPrvd.postMessages, null, true)
                .subscribe(res => {
                    res = this.chatPrvd.organizeMessages(res.messages);
                    for (let i in res) this.chatPrvd.postMessages.push(res[i]);
                    this.chatPrvd.messageDateTimer.start(this.chatPrvd.postMessages);
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
  }
}
