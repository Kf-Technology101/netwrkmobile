import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { toggleFade } from '../../includes/animations';
import { Chat } from '../../providers/chat';

@Component({
  selector: 'modal-legendarylist',
  templateUrl: 'legendarylist.html',
  animations: [
    toggleFade
  ]
})
export class LegendaryListModal {

  private mainBtn: any = {
    state: 'fadeOut',
    hidden: false
  }

  private users:any = [
    {
      name: 'Vasya Pupkin'
    },
    {
      name: 'Elon Musk'
    }
  ]

  constructor(
    private params: NavParams,
    private viewCtrl: ViewController,
    public chatPrvd: Chat
  ) {
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

  ionViewDidEnter() {
    this.mainBtn.state = 'fadeInfast';
  }
}
