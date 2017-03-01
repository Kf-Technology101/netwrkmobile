import { Injectable } from '@angular/core';
import { NavController, Platform, ToastController } from 'ionic-angular';

@Injectable()
export class Functions {
  backButtonPressedOnceToExit: boolean;

  constructor(
    public platform: Platform,
    public toastCtrl: ToastController,
    public navCtrl: NavController
  ) {
    console.log('Hello Functions Provider');
    console.log(this.navCtrl.viewDidLoad);
    console.log(this.navCtrl.viewWillEnter);
    console.log(this.navCtrl.viewDidEnter);
    console.log(this.navCtrl.viewWillLeave);
    console.log(this.navCtrl.viewDidLeave);
    console.log(this.navCtrl.viewWillUnload);
  }

  // backButtonAction($ionicHistory) {
  //   switch ($ionicHistory.currentView().stateName) {
  //     case 'login':
  //     case 'home':
  //       if (this.backButtonPressedOnceToExit) {
  //         // ionic.Platform.exitApp();
  //       } else {
  //         this.backButtonPressedOnceToExit = true;
  //         let toast = this.toastCtrl.create({
  //           message: 'Press again to exit',
  //           duration: 2000,
  //           position: 'bottom'
  //         });
  //         setTimeout(function () {
  //           this.backButtonPressedOnceToExit = false;
  //         }, 4000);
  //       }
  //
  //       break;
  //     default:
  //       this.navCtrl.pop();
  //   }
  //
  // };

}
