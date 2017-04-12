import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// Pages
import { UndercoverPage } from '../undercover/undercover';

// Providers
import { Tools } from '../../providers/tools';
import { UndercoverProvider } from '../../providers/undercover';
import { Network } from '../../providers/network';
import { Gps } from '../../providers/gps';

@Component({
  selector: 'page-network',
  templateUrl: 'network.html'
})
export class NetworkPage {
  public people: Array<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public tools: Tools,
    public undercover: UndercoverProvider,
    public gps: Gps,
    public network: Network
  ) {
    this.people = [
      {
        name: 'Bib Barker',
        imageUrl: 'assets/images/Layer0.png',
      },
      {
        name: 'John Barker',
        imageUrl: 'assets/images/Layer1.png',
      },
      {
        name: 'John Barker',
        imageUrl: 'assets/images/Layer2.png',
      },
      {
        name: 'Bib Barker',
        imageUrl: 'assets/images/Layer0.png',
      },
      {
        name: 'John Barker',
        imageUrl: 'assets/images/Layer1.png',
      },
      {
        name: 'John Barker',
        imageUrl: 'assets/images/Layer2.png',
      },
      {
        name: 'Bib Barker',
        imageUrl: 'assets/images/Layer0.png',
      },
      {
        name: 'John Barker',
        imageUrl: 'assets/images/Layer1.png',
      },
      {
        name: 'John Barker',
        imageUrl: 'assets/images/Layer2.png',
      },
      {
        name: 'Bib Barker',
        imageUrl: 'assets/images/Layer0.png',
      },
      {
        name: 'John Barker',
        imageUrl: 'assets/images/Layer1.png',
      },
    ];
  }

  goToProfile(data) {
    console.log(data);
  }

  goToNetwork() {
    let data = { post_code: this.gps.zipCode };
    this.network.join(data)
      .map(res => res.json())
      .subscribe(res => {
        console.log(res);
        // this.undercover.setActivePerson(false);
        // this.tools.pushPage(UndercoverPage);
      }, err => {
        console.log(err);
      });
    // this.undercover.setActivePerson(false);
    // this.tools.pushPage(UndercoverPage);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NetworkPage');
  }

}
