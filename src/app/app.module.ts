import { NgModule, ErrorHandler, Renderer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { Sim } from '@ionic-native/sim';
import { Diagnostic } from '@ionic-native/diagnostic';
import { AndroidPermissions } from '@ionic-native/android-permissions';

// Pages
import { MyApp } from './app.component';

import { HomePage } from '../pages/home/home';

import { LogInPage } from '../pages/log-in/log-in';
import { SignUpPage } from '../pages/sign-up/sign-up';
import { SignUpConfirmPage } from '../pages/sign-up-confirm/sign-up-confirm';
import { SignUpAfterFbPage } from '../pages/sign-up-after-fb/sign-up-after-fb';
import { SignUpFacebookPage } from '../pages/sign-up-facebook/sign-up-facebook';

import { ProfilePage } from '../pages/profile/profile';
import { ProfileSettingPage } from '../pages/profile-setting/profile-setting';

import { NetworkPage } from '../pages/network/network';
import { NetworkFindPage } from '../pages/network-find/network-find';
import { NetworkNoPage } from '../pages/network-no/network-no';
import { NetworkFaqPage } from '../pages/network-faq/network-faq';
import { NetworkContactListPage } from '../pages/network-contact-list/network-contact-list';
import { ChatPage } from '../pages/chat/chat';
import { UndercoverCharacterPage } from '../pages/undercover-character/undercover-character';

import { CameraPage } from '../pages/camera/camera';

// Modals
import { LegendaryModal } from '../modals/legendaryhistory/legendaryhistory';
import { ShareListModal } from '../modals/sharelist/sharelist';
import { FeedbackShareModal } from '../modals/feedbackshare/feedbackshare';
import { FeedbackModal } from '../modals/feedback/feedback';

// Services
import { Api } from '../providers/api';
import { Auth } from '../providers/auth';
import { User } from '../providers/user';
import { LocalStorage } from '../providers/local-storage';
import { Tools } from '../providers/tools';
import { ContactsProvider } from '../providers/contacts';
import { Social } from '../providers/social';
import { Gps } from '../providers/gps';
import { Profile } from '../providers/profile';
import { PermissionsService } from '../providers/permissionservice';
import { UndercoverProvider } from '../providers/undercover';
import { SlideAvatar } from '../providers/slide-avatar';
import { Share } from '../providers/share';
import { NetworkProvider } from '../providers/network';
import { Camera } from '../providers/camera';
import { Chat } from '../providers/chat';
import { LocationChange } from '../providers/locationchange';
import { Settings } from '../providers/settings';

// Native services
import { Geolocation } from '@ionic-native/geolocation';
import { CameraPreview } from '@ionic-native/camera-preview';
import { SocialSharing } from '@ionic-native/social-sharing';
import { File } from '@ionic-native/file';
import { Transfer } from '@ionic-native/transfer';
import { Facebook } from '@ionic-native/facebook';
import { Keyboard } from '@ionic-native/keyboard';
import { Network } from '@ionic-native/network';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { TwitterConnect } from '@ionic-native/twitter-connect';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Crop } from '@ionic-native/crop';

// sockets
import { Ng2Cable, Broadcaster } from 'ng2-cable/js/index';

// enableProdMode();

let pages = [
  MyApp,

  HomePage,

  LogInPage,
  SignUpPage,
  SignUpConfirmPage,
  SignUpAfterFbPage,
  SignUpFacebookPage,

  ProfilePage,
  ProfileSettingPage,

  NetworkPage,
  NetworkFindPage,
  NetworkNoPage,
  NetworkFaqPage,
  NetworkContactListPage,
  LegendaryModal,
  ShareListModal,
  FeedbackShareModal,
  FeedbackModal,
  ChatPage,
  UndercoverCharacterPage,

  CameraPage,
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
    Auth,
    Api,
    LocalStorage,
    Tools,
    ContactsProvider,
    Social,
    Gps,
    PermissionsService,
    AndroidPermissions,
    UndercoverProvider,
    SlideAvatar,
    Share,
    NetworkProvider,
    Camera,
    Chat,
    Facebook,
    Geolocation,
    CameraPreview,
    SocialSharing,
    File,
    Transfer,
    Keyboard,
    Network,
    TwitterConnect,

    SplashScreen,
    StatusBar,
    Sim,
    InAppBrowser,
    BackgroundMode,
    Profile,
    Ng2Cable,
    Broadcaster,
    LocationChange,
    Settings,
    Crop,
    Diagnostic,
    // Keep this to enable Ionic's runtime error handling during development
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ];
}

@NgModule({
  declarations: declarations(),
  imports: [
    BrowserModule,
    HttpModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: entryComponents(),
  providers: providers()
})
export class AppModule {}
