import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

// Page
import { NetworkNoPage } from '../network-no/network-no';
import { NetworkPage } from '../network/network';

// Providers
import { Tools } from '../../providers/tools';
import { Gps } from '../../providers/gps';
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
    this.gps.getMyZipCode().then( (res: GeolocationInterface) => {
      console.log(res);
      this.gps.getNetwrk(res.zip_code).map(res => res.json()).subscribe(
        res => {
          console.log(res);
          if (res.message == 'Network not found') {
            this.tools.pushPage(NetworkNoPage);
          } else {
            this.tools.pushPage(NetworkPage, { zipCode: res.post_code });
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
