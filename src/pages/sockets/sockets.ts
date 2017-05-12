import { Component } from '@angular/core';
import { Ng2Cable, Broadcaster } from 'ng2-cable/js/index';
import 'rxjs';

@Component({
    selector: 'page-sockets',
    templateUrl: 'sockets.html',
    providers:
    [
      Ng2Cable,
      Broadcaster
    ]
})

export class Sockets {
  private chatBox: any = '';
  private messages:any = [];
  constructor(
    private ng2cable: Ng2Cable,
    private broadcaster: Broadcaster
  ) {
    
  }
}
