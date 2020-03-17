import { NgModule, ErrorHandler, Renderer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Push } from '@ionic-native/push';
import { ImagePicker } from '@ionic-native/image-picker';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http'; 

import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { Sim } from '@ionic-native/sim';
import { Diagnostic } from '@ionic-native/diagnostic';
import { AndroidPermissions } from '@ionic-native/android-permissions';
// import { Autosize } from 'ng-autosize';
import { Deeplinks } from '@ionic-native/deeplinks';

// Pages
import { MyApp } from './app.component';

import { LogInPage } from '../pages/log-in/log-in';
import { SignUpPage } from '../pages/sign-up/sign-up';
import { SignUpConfirmPage } from '../pages/sign-up-confirm/sign-up-confirm';
import { SignUpAfterFbPage } from '../pages/sign-up-after-fb/sign-up-after-fb';
import { SignUpFacebookPage } from '../pages/sign-up-facebook/sign-up-facebook';
import { HoldScreenPage } from '../pages/hold-screen/hold-screen';
import { HoldMapPage } from '../pages/hold-map/hold-map';
import { ProfilePage } from '../pages/profile/profile';
import { ProfileSettingPage } from '../pages/profile-setting/profile-setting';
import { LinePage } from '../pages/linelist/linelist';
import { NetwrklistPage } from '../pages/netwrklist/netwrklist';
import { NetworkContactListPage } from '../pages/network-contact-list/network-contact-list';
import { ChatPage } from '../pages/chat/chat';
import { UndercoverCharacterPage } from '../pages/undercover-character/undercover-character';
import { CameraPage } from '../pages/camera/camera';
import { ProfileNameImgPage } from '../pages/profile-name-img/profile-name-img';
import { DealPage } from '../pages/deal/deal';

// Modals
import { LegendaryModal } from '../modals/legendaryhistory/legendaryhistory';
import { FeedbackShareModal } from '../modals/feedbackshare/feedbackshare';
import { FeedbackModal } from '../modals/feedback/feedback';
import { BlacklistModal } from '../modals/blacklist/blacklist';
import { ArealistModal } from '../modals/arealist/arealist';
import { MapsModal } from '../modals/maps/maps';
import { CustomModal } from '../modals/custom/custom';

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
import { SnapProvider } from '../providers/snap';

//Pipes
import { ContactListPipe } from '../pipes/contact-list';
import { EmojiFilter } from '../pipes/emoji-filter.pipe';
import { SortPipe } from '../pipes/sort/sort';

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
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { NativeGeocoder } from '@ionic-native/native-geocoder';
// import { SMS } from '@ionic-native/sms/ngx';
 
// sockets
import { Ng2CableModule } from 'ng2-cable';

// Google Maps
import { GoogleMapsModule } from 'google-maps-angular2';

let declarations_pages = [
  // Autosize,
  MyApp,
  LogInPage,
  SignUpPage,
  SignUpConfirmPage,
  SignUpAfterFbPage,
  SignUpFacebookPage,
  HoldScreenPage,
  ProfilePage,
  HoldMapPage,
  ProfileSettingPage,  
  LinePage,
  NetwrklistPage,
  NetworkContactListPage,
  LegendaryModal,
  FeedbackShareModal,
  FeedbackModal,
  MapsModal,
  CustomModal,
  BlacklistModal,
  ArealistModal,
  ChatPage,
  UndercoverCharacterPage,
  CameraPage,
  ProfileNameImgPage, 
  DealPage,  
  ContactListPipe,
  EmojiFilter,
  SortPipe
];

let pages = [
  // Autosize,
  MyApp,
  LogInPage,
  SignUpPage,
  SignUpConfirmPage,
  SignUpAfterFbPage,
  SignUpFacebookPage,
  HoldScreenPage,
  ProfilePage,
  HoldMapPage,
  ProfileSettingPage,  
  LinePage,
  NetwrklistPage,
  NetworkContactListPage,
  LegendaryModal,
  FeedbackShareModal,
  FeedbackModal,
  MapsModal,
  CustomModal,
  BlacklistModal,
  ArealistModal,
  ChatPage,
  UndercoverCharacterPage,
  CameraPage,
  ProfileNameImgPage,
  DealPage
  
];
export function declarations() {
  return declarations_pages;
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
    Camera,
    SocialSharing,
    PhotoViewer,
    File,
    Transfer,
    Keyboard,
    Network,
    TwitterConnect,
    NativeGeocoder,
    SplashScreen,
    Push,
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
	ImagePicker,
	WebView,
    Places,
	SnapProvider
	//SMS,
    // Keep this to enable Ionic's runtime error handling during development
  ];
};

@NgModule({
  declarations: declarations(),
  imports: [
    BrowserModule,
    HttpModule,
	HttpClientModule,
    BrowserAnimationsModule,
    Ng2CableModule,
    IonicModule.forRoot(MyApp, { scrollAssist: false } ),
    GoogleMapsModule.forRoot({
      // url: 'https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyBjoCQlLGverzDsYq0bpYpxXO9E20FT3yI'
      url: 'https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyBtEx1yF-VizBprDZDN3v_z3cv7bA_CLFs' 
    })
  ], 
 /*  exports: [
    ContactListPipe,
	EmojiFilter
  ], */
  bootstrap: [IonicApp],
  entryComponents: entryComponents(),
  providers: providers(),
 
})
export class AppModule {}
