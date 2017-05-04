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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public gps: Gps,
    public tools: Tools,
    private platform: Platform,
    public chatPrvd: Chat
    // public permission: Permission
  ) {
    // platform.resume.subscribe(() => {
    //   console.log('resume')
    //   if (this.platform.is('cordova')) {
    //     this.getZipCode();
    //   }
    // });
  }

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
    // alert('ionViewDidLoad');
    this.getZipCode();
  }

  private getZipCode() {
    this.gps.getMyZipCode().then(zipRes => {
      // alert(JSON.stringify(zipRes));
      this.gps.getNetwrk(zipRes.zip_code).map(res => res.json()).subscribe(res => {
        // alert(JSON.stringify(res));
        // console.log(res);
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
          console.log(this.chatPrvd.chatZipCode(), post_code)
          if (this.chatPrvd.chatZipCode() == post_code &&
            this.chatPrvd.getCountUser() && this.chatPrvd.getCountUser() > 10
          ) {
            params.action = this.chatPrvd.getState();
            console.log(params.action);
            this.tools.pushPage(ChatPage, params);
          } else {
            params.action = 'join';
            this.tools.pushPage(NetworkPage, params);
          }
          this.chatPrvd.setZipCode(post_code);
          this.chatPrvd.saveNetwork(res.network);
        }
      }, err => this.tools.errorHandler(err));
    }, err => {
      console.log(err);
      if (err.code && err.code == 1) {
        this.tools.showToast(err.message, null, 'bottom');
        // this.permission.geolocationPermission();
      }
    });
  }

}
