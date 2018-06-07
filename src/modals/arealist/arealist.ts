import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { Tools } from '../../providers/tools';
import { Api } from '../../providers/api';
import { Chat } from '../../providers/chat';

import { ProfilePage } from '../../pages/profile/profile';
@Component({
  selector: 'modal-arealist',
  templateUrl: 'arealist.html',
})
export class ArealistModal {
  private arealist:Array<any> = [];

  constructor(
    private viewCtrl: ViewController,
    private tools: Tools,
    private api: Api,
    private chatPrvd: Chat
  ) {}

  ionViewDidEnter() {
    this.tools.showLoader();
    this.getAreaList().subscribe(res => {
      console.log('Area list:', res);
      this.arealist = res;
      this.tools.hideLoader();
    }, err => {
      console.error(err);
      this.tools.hideLoader();
    });
  }

  private getAreaList():any {
    let mess = this.api.get('networks/list').share();
    let messMap = mess.map(res => res.json());
    return messMap;
  }

  private areaToggle(networkId:number):any {
    let mess = this.api.post('networks_users', {
      network_id: networkId
    }).share();
    let messMap = mess.map(res => res.json());
    return messMap;
  }

  public toggleAreaConnect(area:any):any {
    this.tools.showLoader();
    this.areaToggle(<number>area.id).subscribe(res => {
      console.log('network connect toggle:', res);
      if (res.message == 'connected') {
        area['disconnected'] = false;
        this.tools.showToast('Connected to ' + area.post_code);
      } else if (res.message == 'disconnected') {
        area['disconnected'] = true;
        this.tools.showToast('Disconected from ' + area.post_code);
      }
      this.tools.hideLoader();
    }, err => {
      console.error('network connect toggle:', err);
      this.tools.hideLoader();
    });
  }

  public closeModal():void {
    this.viewCtrl.dismiss();
  }
}
