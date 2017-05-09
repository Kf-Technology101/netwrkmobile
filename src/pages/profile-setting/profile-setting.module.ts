import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileSettingPage } from './profile-setting';

import { Autosize } from 'angular2-autosize';

@NgModule({
  declarations: [
    ProfileSettingPage,
    Autosize
  ],
  imports: [
    IonicPageModule.forChild(ProfileSettingPage),
  ],
  exports: [
    ProfileSettingPage
  ]
})
export class ProfileSettingModule {}
