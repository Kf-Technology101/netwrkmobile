import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

import { Slides } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LocalStorage } from '../../providers/local-storage';
// Pages
import { NetwrklistPage } from '../netwrklist/netwrklist';
import { ChatPage } from '../chat/chat';
// Providers
import { Gps } from '../../providers/gps';
import { Chat } from '../../providers/chat';
import { UndercoverProvider } from '../../providers/undercover';
import { Tools } from '../../providers/tools';
import { SlideAvatar } from '../../providers/slide-avatar';
import { Settings } from '../../providers/settings';
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

  public users: any = {};
  public nearByNetworks: Array<any> = [];
  public isUndercover: boolean;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public undercoverPrvd: UndercoverProvider,
    public toolsPrvd: Tools,
    public chatPrvd: Chat,
    public settings: Settings,
    public zone: NgZone,
    public gpsPrvd: Gps,
    public slideAvatarPrvd: SlideAvatar,
    public authPrvd: Auth,
    elRef: ElementRef,
    private storage: LocalStorage,
    public splash: SplashScreen
  ) {
    this.users = this.authPrvd.getAuthData();
    this.gpsPrvd.getMyZipCode();
  }

    public goBack():void {
        this.storage.set('_fromPrSett', true);
        this.toolsPrvd.popPage();
    }

    public showNetwrklist():void {
        this.toolsPrvd.pushPage(NetwrklistPage);
    }

    ionViewWillLeave() {
        this.slideAvatarPrvd.changeCallback = null;
    }

    ionViewDidEnter() {
        this.splash.hide();
        this.gpsPrvd.getNetwrk(this.chatPrvd.localStorage.get('chat_zip_code')).subscribe(res => {
            console.log('Nearby network List:', res);
            this.nearByNetworks.push(res.network);
            this.toolsPrvd.hideLoader();
        }, err => this.toolsPrvd.errorHandler(err));

        this.toolsPrvd.hideLoader();
    }

    public goToLanding() {
        this.chatPrvd.setState('landing');
        this.toolsPrvd.pushPage(ChatPage);
    }

}
