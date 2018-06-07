import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { Tools } from './tools';

@Injectable()
export class NetworkCheck {

  constructor(
    public network: Network,
    public tools: Tools
  ) {}

  public networkStatus():void {
    console.log('networkStatus() in');
    let onDisconnect = () => {
      this.network.onDisconnect().subscribe(() => {
        console.warn('NO INTERNET CONNECTION');
        this.tools.showLoader('Internet is needed to connect to the world around you');
        // this.tools.showSplashScreen();
        // onDisconnect.unsubscribe();
      });
    }

   onDisconnect();

   this.network.onConnect().subscribe(() => {
     console.log('NETWORK CONNECTED');
      setTimeout(() => {
        if (this.network.type !== 'none') {
          this.tools.hideLoader();
          // this.tools.hideSplashScreen();
          onDisconnect();
        }
      }, 3000);
    });
  }
}
