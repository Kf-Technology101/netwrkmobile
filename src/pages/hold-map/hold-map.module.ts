import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HoldMapPage } from './hold-map';

@NgModule({
  declarations: [
    HoldMapPage,
  ],
  imports: [
    IonicPageModule.forChild(HoldMapPage),
  ],
})
export class HoldMapPageModule {}
