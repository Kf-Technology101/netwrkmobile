import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// Pages
import { ProfilePage } from '../profile/profile';

@Component({
  selector: 'page-network-create',
  templateUrl: 'network-create.html'
})
export class NetworkCreatePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad NetworkCreatePage');
  }

  goToProfile() {
    this.navCtrl.push(ProfilePage);
  }

  goBack() { this.navCtrl.pop(); }

}
