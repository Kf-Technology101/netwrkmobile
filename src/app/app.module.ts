import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

// Pages
import { MyApp } from './app.component';

import { HomePage } from '../pages/home/home';

import { LogInPage } from '../pages/log-in/log-in';
import { SignUpPage } from '../pages/sign-up/sign-up';
import { SignUpConfirmPage } from '../pages/sign-up-confirm/sign-up-confirm';
import { SignUpAfterFbPage } from '../pages/sign-up-after-fb/sign-up-after-fb';

import { ProfilePage } from '../pages/profile/profile';
import { ProfileSettingPage } from '../pages/profile-setting/profile-setting';

import { NetworkFindPage } from '../pages/network-find/network-find';
import { NetworkNoPage } from '../pages/network-no/network-no';
import { NetworkFaqPage } from '../pages/network-faq/network-faq';
import { NetworkCreatePage } from '../pages/network-create/network-create';
import { NetworkContactListPage } from '../pages/network-contact-list/network-contact-list';

import { UndercoverPage } from '../pages/undercover/undercover';

import { CameraPage } from '../pages/camera/camera';

// Services
import { User } from '../providers/user';
import { Api } from '../providers/api';
import { LocalStorage } from '../providers/local-storage';
import { Tools } from '../providers/tools';
import { ContactsProvider } from '../providers/contacts';
import { Social } from '../providers/social';
import { Gps } from '../providers/gps';

// Native services
import { Facebook } from 'ionic-native';
import { Geolocation } from '@ionic-native/geolocation';
import { CameraPreview } from '@ionic-native/camera-preview';
import { Camera } from '@ionic-native/camera';

let pages = [
  MyApp,

  HomePage,

  LogInPage,
  SignUpPage,
  SignUpConfirmPage,
  SignUpAfterFbPage,

  ProfilePage,
  ProfileSettingPage,

  NetworkFindPage,
  NetworkNoPage,
  NetworkFaqPage,
  NetworkCreatePage,
  NetworkContactListPage,

  UndercoverPage,

  CameraPage
];

export function declarations() {
  return pages;
}

export function entryComponents() {
  return pages;
}

export function providers() {
  return [
    Storage,

    User,
    Api,
    LocalStorage,
    Tools,
    ContactsProvider,
    Social,
    Gps,

    Facebook,
    Geolocation,
    CameraPreview,
    Camera,

    // Keep this to enable Ionic's runtime error handling during development
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ];
}

@NgModule({
  declarations: declarations(),
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: entryComponents(),
  providers: providers()
})
export class AppModule {}
