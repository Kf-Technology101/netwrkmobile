import { Injectable } from '@angular/core';
import { App } from 'ionic-angular';

@Injectable()
export class SlideAvatar {

  constructor(public app: App) {
    this.app.viewDidEnter.subscribe((view) => {
      console.log('viewDidEnter', view);
    });
    this.app.viewWillLeave.subscribe((view) => {
      console.log('viewWillLeave', view);
    });
    this.app.viewDidLoad.subscribe((view) => {
      console.log('viewDidLoad', view);
    });
  }

}
