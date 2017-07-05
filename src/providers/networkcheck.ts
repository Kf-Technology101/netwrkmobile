import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { Tools } from './tools';

@Injectable()
export class NetworkCheck{

  constructor(
    public network: Network,
    public tools: Tools
  ) {}

  public networkStatus():void {
    console.log('networkStatus() in');
    let onDisconnect = () => {
      let onDisconnect = this.network.onDisconnect().subscribe(() => {
        console.warn('NO INTERNET CONNECTION');
        this.tools.showLoader('No internet connection');
        // onDisconnect.unsubscribe();
      });
    }

   onDisconnect();

   this.network.onConnect().subscribe(() => {
     console.log('NETWORK CONNECTED');
      setTimeout(() => {
        if (this.network.type !== 'none') {
          this.tools.hideLoader();
          onDisconnect();
        }
      }, 3000);
    });
  }
}
