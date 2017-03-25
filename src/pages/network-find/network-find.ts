import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// Providers
import { Tools } from '../../providers/tools';

@Component({
  selector: 'page-network-find',
  templateUrl: 'network-find.html'
})
export class NetworkFindPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public tools: Tools
  ) {}

  ionViewDidLoad() {
    let zipCode: any;
    this.tools.showLoader();
    this.tools.getMyZipCode().then( res => {
      this.tools.hideLoader();
      zipCode = res;
      console.log(zipCode);
    });
  }

}
