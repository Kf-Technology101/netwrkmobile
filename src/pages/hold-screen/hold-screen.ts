import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

import { Slides } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LocalStorage } from '../../providers/local-storage';
// Pages
import { NetworkFindPage } from '../network-find/network-find';
import { NetworkNoPage } from '../network-no/network-no';
import { NetworkPage } from '../network/network';
import { ChatPage } from '../chat/chat';
// Providers
import { Gps } from '../../providers/gps';
import { Chat } from '../../providers/chat';
import { UndercoverProvider } from '../../providers/undercover';
import { Tools } from '../../providers/tools';
import { SlideAvatar } from '../../providers/slide-avatar';
import { Auth } from '../../providers/auth';

import { heroes } from '../../includes/heroes';
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
  selector: 'page-hold',
  templateUrl: 'hold-screen.html',
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

export class HoldScreenPage {

  private user: any = {};
  public nearByNetworks: Array<any> = [];
  public isUndercover: boolean;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public undercoverPrvd: UndercoverProvider,
    public toolsPrvd: Tools,
    public chatPrvd: Chat,
    public zone: NgZone,
    public gpsPrvd: Gps,
    public slideAvatarPrvd: SlideAvatar,
    public authPrvd: Auth,
    elRef: ElementRef,
    private storage: LocalStorage,
    public splash: SplashScreen
  ) {
    this.user = this.authPrvd.getAuthData();
  }

    ionViewDidEnter() {
        this.splash.hide();
        this.getAndUpdateUndercoverMessages();
        this.gpsPrvd.getNetwrk(this.chatPrvd.localStorage.get('chat_zip_code')).subscribe(res => {
            console.log('Nearby netwrk List:', res);
            this.nearByNetworks.push(res.network);
            this.toolsPrvd.hideLoader();
        }, err => this.toolsPrvd.errorHandler(err));
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

    public goToChat() {
        this.splash.hide();
        this.toolsPrvd.pushPage(ChatPage);
    }

    public goToLanding() {
        this.splash.hide();
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
}
