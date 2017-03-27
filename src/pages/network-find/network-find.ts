import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// Page
import { NetworkNoPage } from '../network-no/network-no';

// Providers
import { Tools } from '../../providers/tools';
import { Gps } from '../../providers/gps';

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
    public tools: Tools
  ) {}

  ionViewDidLoad() {
    this.hideSearch = false;
    this.gps.getMyZipCode().then( (res: GeolocationInterface) => {
      console.log(res);
      this.gps.getNetwrk(res.zip_code).map(res => res.json()).subscribe(res => {
        console.log(res);
        if (res.message == 'Network not found') {
          this.navCtrl.push(NetworkNoPage);
        }
      }, err => console.log(err) );
    }, err => console.log(err) );
  }

  go() {
    // this.navCtrl.push(NetworkNoPage);
    this.tools.showToast('Please wait...', null, 'bottom')
  }

}
