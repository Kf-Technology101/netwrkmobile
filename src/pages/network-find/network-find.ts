import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

// Page
import { NetworkNoPage } from '../network-no/network-no';
import { NetworkPage } from '../network/network';

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
          let params: any = {
            zipCode: res.post_code,
            action: null
          };

          if (res.message == 'Network not found') {
            params.action = 'create';
            this.tools.pushPage(NetworkNoPage, params);
          } else {
            if (this.chatPrvd.chatZipCode() == res.network.post_code) {
              this.chatPrvd.setZipCode(res.post_code);
              params.action = this.chatPrvd.getState();
              this.tools.pushPage(NetworkPage, params);
            } else {
              params.action = 'join';
              this.chatPrvd.setZipCode(res.post_code);
              this.tools.pushPage(NetworkPage, params);
            }
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
