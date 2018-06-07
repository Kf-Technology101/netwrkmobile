import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

import { Slides } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LocalStorage } from '../../providers/local-storage';
// Pages
import { NetworkFindPage } from '../network-find/network-find';
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

@Component({
  selector: 'page-hold',
  templateUrl: 'hold-screen.html'
})

export class HoldScreenPage {

  private user: any = {};
  public nearNetworkLines : any = {};

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
        this.toolsPrvd.hideLoader();
    }

    goToChat() {
        this.splash.hide();
        this.toolsPrvd.pushPage(ChatPage);
    }

    goToLanding() {
        this.splash.hide();
        this.toolsPrvd.pushPage(ChatPage);
    }

}
