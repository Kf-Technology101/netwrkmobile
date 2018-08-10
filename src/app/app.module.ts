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
// import { Autosize } from 'ng-autosize';
import { Deeplinks } from '@ionic-native/deeplinks';
// Pages
import { MyApp } from './app.component';

import { HomePage } from '../pages/home/home';

import { LogInPage } from '../pages/log-in/log-in';
import { SignUpPage } from '../pages/sign-up/sign-up';
import { SignUpConfirmPage } from '../pages/sign-up-confirm/sign-up-confirm';
import { SignUpAfterFbPage } from '../pages/sign-up-after-fb/sign-up-after-fb';
import { SignUpFacebookPage } from '../pages/sign-up-facebook/sign-up-facebook';
import { HoldScreenPage } from '../pages/hold-screen/hold-screen';

import { ProfilePage } from '../pages/profile/profile';
import { ProfileSettingPage } from '../pages/profile-setting/profile-setting';

import { NetworkPage } from '../pages/network/network';
import { LinePage } from '../pages/linelist/linelist';
import { NetworkFindPage } from '../pages/network-find/network-find';
import { NetwrklistPage } from '../pages/netwrklist/netwrklist';
import { NetworkNoPage } from '../pages/network-no/network-no';
import { NetworkContactListPage } from '../pages/network-contact-list/network-contact-list';
import { ChatPage } from '../pages/chat/chat';
import { UndercoverCharacterPage } from '../pages/undercover-character/undercover-character';

import { CameraPage } from '../pages/camera/camera';

// Modals
import { LegendaryModal } from '../modals/legendaryhistory/legendaryhistory';
import { FeedbackShareModal } from '../modals/feedbackshare/feedbackshare';
import { FeedbackModal } from '../modals/feedback/feedback';
import { BlacklistModal } from '../modals/blacklist/blacklist';
import { ArealistModal } from '../modals/arealist/arealist';
import { MapsModal } from '../modals/maps/maps';

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
import { NetworkProvider } from '../providers/networkservice';
import { Camera } from '../providers/camera';
import { Chat } from '../providers/chat';
import { LocationChange } from '../providers/locationchange';
import { Settings } from '../providers/settings';
import { NetworkCheck } from '../providers/networkcheck';
import { Places } from '../providers/places';
import { ReportService } from '../providers/reportservice';
import { VideoService } from '../providers/videoservice';
import { FeedbackService } from '../providers/feedback.service';

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
import { AppAvailability } from '@ionic-native/app-availability';

// sockets
import { Ng2CableModule } from 'ng2-cable';
// Google Maps
import { GoogleMapsModule } from 'google-maps-angular2';

let pages = [
  // Autosize,
  MyApp,

  HomePage,

  LogInPage,
  SignUpPage,
  SignUpConfirmPage,
  SignUpAfterFbPage,
  SignUpFacebookPage,

  HoldScreenPage,

  ProfilePage,
  ProfileSettingPage,

  NetworkPage,
  LinePage,
  NetwrklistPage,
  NetworkFindPage,
  NetworkNoPage,
  NetworkContactListPage,
  LegendaryModal,
  FeedbackShareModal,
  FeedbackModal,
  MapsModal,
  BlacklistModal,
  ArealistModal,

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
    NetworkProvider,
    Camera,
    Chat,
    Facebook,
    Deeplinks,
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
    LocationChange,
    Settings,
    Crop,
    Diagnostic,
    NetworkCheck,
    ReportService,
    VideoService,
    FeedbackService,
    AppAvailability,

    Places,
    // Keep this to enable Ionic's runtime error handling during development
  ];
};

@NgModule({
  declarations: declarations(),
  imports: [
    BrowserModule,
    HttpModule,
    BrowserAnimationsModule,
    Ng2CableModule,
    IonicModule.forRoot(MyApp),
    GoogleMapsModule.forRoot({
      url: 'https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyBjoCQlLGverzDsYq0bpYpxXO9E20FT3yI'
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: entryComponents(),
  providers: providers()
})
export class AppModule {}
