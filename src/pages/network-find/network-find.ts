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

// Interfaces
import { GeolocationInterface } from '../../interfaces/gps';

@Component({
  selector: 'page-network-find',
  templateUrl: 'network-find.html'
})
export class NetworkFindPage {
  public hideSearch: boolean = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public gps: Gps,
    public tools: Tools,
    private platform: Platform,
    public chatPrvd: Chat
    // public permission: Permission
  ) {}

  go() {
    if (this.platform.is('cordova')) {
      this.tools.showToast('Please wait...', null, 'bottom');
    } else {
      this.tools.pushPage(NetworkNoPage);
    }
  }

  ionViewDidLoad() {
    this.hideSearch = false;
    this.gps.getMyZipCode().then( (zipRes: GeolocationInterface) => {
      console.log(zipRes);
      this.gps.getNetwrk(zipRes.zip_code).map(res => res.json()).subscribe(
        res => {
          console.log(res);
          let post_code: number = res.network ? res.network.post_code : null;
          let params: any = {
            zipCode: post_code,
            action: null
          };

          if (res.message == 'Network not found') {
            params.action = 'create';
            this.tools.pushPage(NetworkNoPage, params);
          } else {
            if (this.chatPrvd.chatZipCode() == post_code) {
              params.action = this.chatPrvd.getState();
              this.tools.pushPage(ChatPage, params);
            } else {
              params.action = 'join';
              this.tools.pushPage(NetworkPage, params);
            }
            this.chatPrvd.setZipCode(post_code);
            this.chatPrvd.saveNetwork(res.network);
          }
        }, err => console.log(err)
      );
    }, err => {
      console.log(err);
      if (err.code && err.code == 1) {
        this.tools.showToast(err.message, null, 'bottom');
        // this.permission.geolocationPermission();
      }
    });
  }

}
