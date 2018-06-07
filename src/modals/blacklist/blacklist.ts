import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { Tools } from '../../providers/tools';
import { Api } from '../../providers/api';
import { Chat } from '../../providers/chat';
import { ReportService } from '../../providers/reportservice';

import { ProfilePage } from '../../pages/profile/profile';
@Component({
  selector: 'modal-blacklist',
  templateUrl: 'blacklist.html',
})
export class BlacklistModal {
  private blacklist:Array<any> = [];

  constructor(
    private viewCtrl: ViewController,
    private tools: Tools,
    private api: Api,
    private chatPrvd: Chat,
    private report: ReportService
  ) {}

  ionViewDidEnter() {
    this.tools.showLoader();
    this.getBlacklist().subscribe(res => {
      console.log('blacklist:', res);
      this.blacklist = res;
      this.chatPrvd.localStorage.set('blacklist', res);
      this.tools.hideLoader();
    }, err => {
      console.error(err);
      this.tools.hideLoader();
    });
  }

  private getBlacklist():any {
    let mess = this.api.get('blacklist').share();
    let messMap = mess.map(res => res.json());
    return messMap;
  }

  public goToProfile(profileId: number):void {
    this.chatPrvd.goToProfile(profileId, true).then(res => {
      this.tools.pushPage(ProfilePage, res);
    }, err => {
      console.error('goToProfile err:', err);
    });
  }

  public toggleUserBlock(user:any):any {
    this.tools.showLoader();
    this.report.blockUser(user.id).subscribe(res => {
      console.log('blockUser success:', res);
      if (res.message == 'block_ok') {
        user.blocked = true;
        this.tools.showToast('User successfully blocked');
      } else if (res.message == 'unblock_ok') {
        user.blocked = false;
        this.tools.showToast('User successfully unblocked');
      }
      this.tools.hideLoader();
    }, err => {
      this.tools.hideLoader();
      this.tools.showToast('Error unblocking user');
      console.error('blockUser err:', err);
    });
  }

  public closeModal():void {
    this.getBlacklist().subscribe(res => {
      this.chatPrvd.localStorage.set('blacklist', res);
      this.viewCtrl.dismiss();
    }, err => {
      console.error(err);
      this.viewCtrl.dismiss();
    });
  }
}
