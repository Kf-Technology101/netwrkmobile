import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

// Page
import { NetworkNoPage } from '../network-no/network-no';
import { NetworkPage } from '../network/network';
import { ChatPage } from '../chat/chat';

// Providers
import { Tools } from '../../providers/tools';
import { Gps } from '../../providers/gps';
import { Chat } from '../../providers/chat';
// import { Permission } from '../../providers/permission';

@Component({
  selector: 'page-network-find',
  templateUrl: 'network-find.html'
})
export class NetworkFindPage {
  public hideSearch: boolean = true;
  private skipNetworkFind: boolean = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public gps: Gps,
    public tools: Tools,
    private platform: Platform,
    public chatPrvd: Chat
  ) {}

  go() {
    if (this.platform.is('cordova')) {
      this.tools.showToast('Please wait...', null, 'bottom');
      this.getZipCode();
    } else {
      this.tools.pushPage(NetworkNoPage);
    }
  }

  ionViewDidEnter() {
    this.hideSearch = false;
    if (!this.skipNetworkFind)
      this.getZipCode();
  }

  private getZipCode() {
    this.gps.getMyZipCode().then(zipRes => {
      this.gps.getNetwrk(zipRes.zip_code).subscribe(res => {
        let post_code: number = res.network ? res.network.post_code : null;
        let params: any = {
          zipCode: post_code,
          accessed: res.network ? res.network.accessed : null,
          action: null
        };

        if (res.message == 'Network not found') {
          params.action = 'create';
          this.tools.pushPage(NetworkNoPage, params);
        } else {
          if (res.network.users_count && res.network.users_count >= 10) {
            params.action = this.chatPrvd.getState();
            // params.action = 'area';
            // this.tools.pushPage(ChatPage, params);
            this.navCtrl.setRoot(ChatPage, params);
          } else {
            params.action = 'join';
            this.tools.pushPage(NetworkPage, params);
          }
          this.chatPrvd.setZipCode(post_code);
          this.chatPrvd.saveNetwork(res.network);
        }
      }, err => this.tools.errorHandler(err));
    }, err => {
      console.error('[getZipCode] err:', err);
      if (err.code && err.code == 1) {
        this.tools.showToast(err.message, null, 'bottom');
      }
    });
  }

  ngOnInit():void {
    if (this.navParams.get('action') == 'undercover') {
      this.navCtrl.setRoot(ChatPage, {
        action: 'undercover'
      });
    } else {
      this.skipNetworkFind = false;
    }
  }

}
