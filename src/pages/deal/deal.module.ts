import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DealPage } from './deal';

@NgModule({
  declarations: [
    DealPage,
  ],
  imports: [
    IonicPageModule.forChild(DealPage),
  ],
})
export class DealPageModule {}
