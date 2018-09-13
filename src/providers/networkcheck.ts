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
          alert('inside Disconnect')
        this.tools.showLoader('Internet is needed to connect to the world around you');
      });
    }

   onDisconnect();

   this.network.onConnect().subscribe(() => {
      setTimeout(() => {
        if (this.network.type !== 'none') {
          this.tools.hideLoader();
          onDisconnect();
        }
      }, 3000);
    });
  }
}
