import {
  Component,
  ViewChild,
  NgZone,
  HostBinding,
  ElementRef,
  Renderer, 
  DoCheck  } from '@angular/core';
import {
  NavController,
  NavParams,
  Content,
  Platform,
  ModalController,
  AlertController,
  Config,
  Events,
  App
} from 'ionic-angular';

import {Observable} from 'rxjs/Observable';
import { GoogleMapsService } from 'google-maps-angular2';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery';

import { CameraPreview } from '@ionic-native/camera-preview';
import { Geolocation } from '@ionic-native/geolocation';
import { Keyboard } from '@ionic-native/keyboard';
import { SocialSharing } from '@ionic-native/social-sharing';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder';
// import {googlemaps} from 'googlemaps';

// Pages
import { CameraPage } from '../camera/camera';
import { ProfilePage } from '../profile/profile';
import { LogInPage } from '../log-in/log-in';
import { NetworkContactListPage } from '../network-contact-list/network-contact-list';
import { HoldScreenPage } from '../hold-screen/hold-screen';
import { NetwrklistPage } from '../netwrklist/netwrklist';
import { UndercoverCharacterPage } from '../undercover-character/undercover-character';
import { LinePage } from '../linelist/linelist';

// Custom libs
import { Toggleable } from '../../includes/toggleable';

// Modals
import { LegendaryModal } from '../../modals/legendaryhistory/legendaryhistory';
import { FeedbackModal } from '../../modals/feedback/feedback';
import { MapsModal } from '../../modals/maps/maps';

// Providers
import { Tools } from '../../providers/tools';
import { UndercoverProvider } from '../../providers/undercover';
import { SlideAvatar } from '../../providers/slide-avatar';
import { Auth } from '../../providers/auth';
import { Camera } from '../../providers/camera';
import { Settings } from '../../providers/settings';
import { Chat } from '../../providers/chat';
import { NetworkProvider } from '../../providers/networkservice';
import { Gps } from '../../providers/gps';
import { Social } from '../../providers/social';
import { Places } from '../../providers/places';
import { User } from '../../providers/user';

//import { GeocoderProvider } from '../../providers/geocoder';

import { LocationChange } from '../../providers/locationchange';

import { VideoService } from '../../providers/videoservice';
import { FeedbackService } from '../../providers/feedback.service';
import { LocalStorage } from '../../providers/local-storage';

import * as moment from 'moment';
// Sockets
import 'rxjs';

// Animations
import {
  animSpeed,
  chatAnim,
  toggleInputsFade,
  rotateChatPlus,
  toggleChatOptionsBg,
  scaleMainBtn,
  toggleGallery,
  toggleFade,
  slideToggle,
  toggleUcSlider,
  lobbyAnimation
} from '../../includes/animations';
import { ModalRTLEnterAnimation } from '../../includes/rtl-enter.transition';
import { ModalRTLLeaveAnimation } from '../../includes/rtl-leave.transition';

declare var google;

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
  animations: [
    toggleInputsFade,
    rotateChatPlus,
    toggleChatOptionsBg,
    scaleMainBtn,
    toggleGallery,
    toggleFade,
    slideToggle,
    toggleUcSlider,
    lobbyAnimation
  ],
  providers: [
     Base64ToGallery
  ]
})

export class ChatPage implements DoCheck {

  private componentLoaded:boolean = false;

  @HostBinding('class') colorClass = 'transparent-background';

  public isUndercover: boolean;

  public insideRadius: boolean;
  public pageNav: boolean;
  public pageNavLobby: boolean;

  public google;
  public map: any;
  public coords:any = {
     lat: null,
     lng: null
  }
  public autocompleteItems: any = [] ;
 
  public nearestNetwork:any = {
     dist: 0,
     index: 0,
     location: {
        lat: null,
        lng: null
     },
     address_string: null,
     type: null,
     name: null
  };

  //public map: any;

  @ViewChild(Content) content: Content;
  @ViewChild('galleryCont') gCont;
  @ViewChild('textInput') txtIn;
  @ViewChild('directions') directionCont;
  @ViewChild('mapElement') mapElement: ElementRef;
  @ViewChild('searchbar', { read: ElementRef }) searchbar: ElementRef;
  
  shareContainer = new Toggleable('off', true);
  emojiContainer = new Toggleable('off', true);
  mainInput = new Toggleable('fadeIn', false);
  postTimer = new Toggleable('slideUp', false);
  postLock = new Toggleable('slideUp', true);
  postCustAddress = new Toggleable('slideUp', true);
  topSlider = new Toggleable('slideDown', false);
  postUnlock  = new Toggleable('slideUp', true);

  public action:any;
  public messageParam:any;
  public postGeocodeData:any;

  flipHover: boolean;

  toggContainers: any = [
    this.emojiContainer,
    this.shareContainer
  ];
  private messagesInterval:boolean;
  private messIntObject:any;

  public isSocialPostsLoaded:boolean = false;

  emoticX = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C'];
  emoticY = ['1F60', '1F61', '1F62', '1F63', '1F64'];
  emojis = [];

  caretPos: number = 0;

  contentBlock: any = undefined;

  public chatUsers: any = [];
  public networkUsers: any = [];
  public mapMarkers: any = [];

  public user: any;

  public shareCheckbox: any = {
    facebook: true,
    twitter: true,
    linkedin: true,
    instagram: true
  };

  private postLoaded:boolean = false;
  private postLoading:boolean = false;

  public sendError: string;
  private networkParams: any = {};
  private textStrings: any = {};

  public hostUrl: string;
  public placeholderText: string;

  public geocoded : boolean;

  public results  : string;

  private debug: any = {
    postHangTime: 0
  };

  private postLockData: any = {
    password: null,
    hint: null
  };

  private contentPadding: string;
  private contentMargin: string;

  private canRefresh: boolean = true;
  private idList: any = [];
  private messageRefreshInterval: any;
  private socialPosts: Array<any> = [];
  private pageTag: string;

  private authData: any;
  private isFeedbackClickable: boolean = true;

  private postTimerObj:any = {
    expireDate: null,
    time: null
  };

  private socialLoaderHidden:boolean = false;

  private postUnlockData:any = {
    id: null,
    password: null
  }

  public postCustAddressData:any = {
      custumAddress: null
  }

  private currentHint:any;

  private activeTopForm:any;

  private global:any = null;

  private nearestPlace:any = null;

  private dirVisible:boolean = true;

  public network:any = {};

  public uniqueUsers:number = 0;
 
  public request_type: any;
  public requestMessage: any;

  public search: boolean = true;
  public addressElement:any;
  public searchModel:any;
  
  public coachMarkText = "Start your network here?";
  
  public scrollTop:number = 0;
  public hideTextContainer:boolean = false;
  
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public zone: NgZone,
    public undercoverPrvd: UndercoverProvider,
    public slideAvatarPrvd: SlideAvatar,
    public storage: LocalStorage,
    public toolsPrvd: Tools,
    public authPrvd: Auth,
    public cameraPrvd: Camera,
    public geolocation: Geolocation,
    public gapi: GoogleMapsService,
    public chatPrvd: Chat,
    public networkPrvd: NetworkProvider,
    private base64ToGallery: Base64ToGallery,
    public gpsPrvd: Gps,
    public plt: Platform,
    public sharing: SocialSharing,
    public socialPrvd: Social,
    public elRef: ElementRef,
    public modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private cameraPreview: CameraPreview,
    private keyboard: Keyboard,
    public settings: Settings,
    private renderer: Renderer,
    public locationchange: LocationChange,
    public config: Config,
    public events: Events,
    public places: Places,
    public userPrvd: User,
    private photoViewer: PhotoViewer,
    public app: App,
    public videoservice: VideoService,
    public nativeGeocoder   : NativeGeocoder,
    public feedbackService: FeedbackService
  ) {
	  console.log('[Chat Page]');
      this.user = this.authPrvd.getAuthData();
      this.chatPrvd.isLandingPage = true;
      this.undercoverPrvd.setUndercover(true);
      this.isUndercover=true;
      this.pageNav=true;
      this.pageNavLobby=true;
      plt.ready().then(() => {
          this.registerDevice();
      });
	  this.initMap();
  }

  public registerDevice() {
    let params: any;
    params = {
        user: {
            registration_id: this.authPrvd.getDeviceRegistration()
        }
    };

    if (params)
        this.userPrvd.update(this.user.id, params, this.authPrvd.getAuthType(), 'update')
            .map(res => res.json()).subscribe(res => {
            }, err => {
                console.error(err);
            });
  }

  public resetFilter():void {
	  this.chatPrvd.postMessages = [];
      this.settings.isNewlineScope=false;
      this.settings.isCreateLine=false;
      this.chatPrvd.isCleared = true;
      if(this.chatPrvd.areaFilter){
          this.chatPrvd.areaFilter=false;
          this.refreshChat();
      }else{
          this.chatPrvd.areaFilter=true;
          this.refreshChat();
      }
  }

  public shareMessageToFacebook(message):void {
    let alert = this.alertCtrl.create({
      subTitle: 'Are you sure you want to share this message to Facebook?',
      buttons: [{
        text: 'Cancel',
        role: 'cancel'
      }, {
        cssClass: 'active',
        text: 'Share',
        handler: () => {
          alert.dismiss();
          this.feedbackService.autoPostToFacebook({
            message: message.user.name + ' casted via Netwrk: ' + (message.text_with_links ? message.text_with_links : ''),
            url:'http://netwrkapp.com'
          }).then(res => {
            this.toolsPrvd.showToast('Message successfully shared');
          }, err => {
            this.toolsPrvd.showToast('Unable to share message');
          });
          return false;
        }
      }]
    });
    alert.present();
  }


  public imageViewer(imgUrl):void {
      var photoViewerOptions = {
          share: true,
          closeButton: true,
          copyToReference: true
      };

      this.photoViewer.show(imgUrl, 'Netwrk', photoViewerOptions);
  }

  public shareLineJoinFlow(message):void {
    let alert = this.alertCtrl.create({
      subTitle: 'Share the line with your friends?',
      buttons: [{
        text: 'No',
        role: 'cancel',
          handler:()=>{
              alert.dismiss();
			  this.chatPrvd.connectUserToChat(this.chatPrvd.currentLobby.id).subscribe(res => {
                  this.chatPrvd.getLocationLobbyUsers(message.id).subscribe(res => {
                      console.log('getLocationLobbyUsers:', res);
                      this.feedbackService.pointsOnJoinLine(message.id, this.user.id);
                      if (res && res.users && res.host_id) {
                          console.log('lobby users:', res.users);
                          this.chatPrvd.currentLobby.users = res.users;
                          this.chatPrvd.currentLobby.hostId = res.host_id;
                          this.chatPrvd.currentLobby.isAddButtonAvailable = !this.chatPrvd.isCurrentUserBelongsToChat(this.chatPrvd.currentLobby.users);
                          this.chatPrvd.sortLobbyUsersByHostId(this.chatPrvd.currentLobby.hostId);
                      }
                  }, err => {
                      console.error(err);
                  });
              }, err => {}); 
          }
      }, {
        cssClass: 'active',
        text: 'Yes',
        handler: () => {
            alert.dismiss();
            let subject = message.text_with_links ? message.text_with_links : '';
            let file = message.image_urls.length > 1 ? message.image_urls[0] : null;
            if (this.plt.is('ios')){
                this.sharing.share(subject, 'Netwrk', file, 'netwrkapp://landing').then(res => {
                        this.toolsPrvd.showToast('line shared successfully ');
                        this.chatPrvd.connectUserToChat(this.chatPrvd.currentLobby.id).subscribe(res => {
                            this.chatPrvd.getLocationLobbyUsers(message.id).subscribe(res => {
                                console.log('getLocationLobbyUsers:', res);
                                this.feedbackService.pointsOnJoinLine(message.id, this.user.id);
                                if (res && res.users && res.host_id) {
                                    console.log('lobby users:', res.users);
                                    this.chatPrvd.currentLobby.users = res.users;
                                    this.chatPrvd.currentLobby.hostId = res.host_id;
                                    this.chatPrvd.currentLobby.isAddButtonAvailable = !this.chatPrvd.isCurrentUserBelongsToChat(this.chatPrvd.currentLobby.users);
                                    this.chatPrvd.sortLobbyUsersByHostId(this.chatPrvd.currentLobby.hostId);
                                }
                            }, err => {
                                console.error(err);
                            });
                        }, err => {});
                    }, err =>{
                        this.toolsPrvd.showToast('Unable to share message');
                    }
                );
            }else{
                this.sharing.share(subject, 'Netwrk', file, 'https://netwrkapp.com/landing').then(res => {
                        this.toolsPrvd.showToast('line shared successfully');
                        this.chatPrvd.connectUserToChat(this.chatPrvd.currentLobby.id).subscribe(res => {
                            this.chatPrvd.getLocationLobbyUsers(message.id).subscribe(res => {
                                console.log('getLocationLobbyUsers:', res);
                                this.feedbackService.pointsOnJoinLine(message.id, this.user.id);
                                if (res && res.users && res.host_id) {
                                    console.log('lobby users:', res.users);
                                    this.chatPrvd.currentLobby.users = res.users;
                                    this.chatPrvd.currentLobby.hostId = res.host_id;
                                    this.chatPrvd.currentLobby.isAddButtonAvailable = !this.chatPrvd.isCurrentUserBelongsToChat(this.chatPrvd.currentLobby.users);
                                    this.chatPrvd.sortLobbyUsersByHostId(this.chatPrvd.currentLobby.hostId);
                                }
                            }, err => {
                                console.error(err);
                            });
                        }, err => {});
                    }, err =>{
                        this.toolsPrvd.showToast('Unable to share message');
                    }
                );
            }

          return false;
        }
      }]
    });
    alert.present();
  }

  private initMap():void {
	this.gapi.init.then((google_maps: any) => {
      let loc: any = {
         lat: this.gpsPrvd.coords.lat,
         lng: this.gpsPrvd.coords.lng
      };
	  this.coords = loc;
      var mapStyle = [
          {
              "featureType": "all",
              "stylers": [
                  {
                      "saturation": 0
                  },
                  {
                      "hue": "#e7ecf0"
                  }
              ]
          },
          {
              "featureType": "road",
              "stylers": [
                  {
                      "saturation": -70
                  }
              ]
          },
          {
              "featureType": "transit",
              "stylers": [
                  {
                      "visibility": "off"
                  }
              ]
          },
          {
              "featureType": "poi",
              "stylers": [
                  {
                      "visibility": "off"
                  }
              ]
          },
          {
              "featureType": "water",
              "stylers": [
                  {
                      "visibility": "simplified"
                  },
                  {
                      "saturation": -60
                  }
              ]
          }
      ];

    this.map = new google_maps.Map(this.mapElement.nativeElement, {
        zoom: 13,
        center: loc,
        styles:mapStyle,
        disableDefaultUI: true,
        fullscreenControl: false
    });

    this.gpsPrvd.getGoogleAdress(this.gpsPrvd.coords.lat, this.gpsPrvd.coords.lng)
        .map(res => res.json()).subscribe(res => {
			let icon = {
                url:'assets/icon/blue_dot.png'
            };

            let marker = new google_maps.Marker({
                map: this.map,
                position: res.results[0].geometry.location,
                icon: icon
            });
        }, err => {
            console.log('[google address] error:', err);
        });

        this.map.setCenter(loc);
		
		
    });
	
	
	
  }

  private initLpMap():void {
	  console.log('initLpMap');
	 this.clearMarkers();
     this.gapi.init.then((google_maps: any) => {
         let zoomScale:number;
         let loc: any = {
             lat: this.gpsPrvd.coords.lat,
             lng: this.gpsPrvd.coords.lng
         };

         let iconUrl='assets/icon/marker.png';
         let iconSize=new google_maps.Size(35, 40);

         let markerIcon = {
             url: iconUrl,
             scaledSize: iconSize,
             origin: new google_maps.Point(0, 0),
             anchor: new google_maps.Point(0, 0)
         };

         if(this.chatPrvd.getState() == 'undercover' && !this.chatPrvd.isLobbyChat){
             this.map.zoom=13;
         }else if(this.chatPrvd.getState() == 'area' && !this.chatPrvd.isLobbyChat){
             this.map.zoom=14;
         }else if(this.chatPrvd.isLobbyChat){
             this.map.zoom=15;
         }

         this.gpsPrvd.getGoogleAdress(this.gpsPrvd.coords.lat, this.gpsPrvd.coords.lng)
            .map(res => res.json()).subscribe(res => {		
                if(this.chatPrvd.isLobbyChat && !this.chatPrvd.areaLobby){
					
                    let marker = new google_maps.Marker({
                        map: this.map,
                        position: new google_maps.LatLng(this.chatPrvd.postLineMessages[0].lat, this.chatPrvd.postLineMessages[0].lng),
                        icon: markerIcon
                    });

                    this.mapMarkers.push(marker);
                }else {
					
                    if(this.chatPrvd.areaLobby){
						let marker = new google_maps.Marker({
                            map: this.map,
                            position: new google_maps.LatLng(this.chatPrvd.postAreaMessages[0].lat, this.chatPrvd.postAreaMessages[0].lng),
                            icon: markerIcon
                        });

                        this.mapMarkers.push(marker);
                    }else {
						for (var i = 0; i < this.chatPrvd.postMessages.length; i++) {
							if(this.chatPrvd.postMessages[i].locked && this.chatPrvd.postMessages[i].locked_by_user && this.user.id != this.chatPrvd.postMessages[i].user_id){
								markerIcon.url = 'assets/icon/lock-marker.png'; 	
							}else{
								markerIcon.url = 'assets/icon/marker.png'; 
							}
							
							let marker = new google_maps.Marker({
								map: this.map,
								position: new google_maps.LatLng(this.chatPrvd.postMessages[i].lat, this.chatPrvd.postMessages[i].lng),
								icon: markerIcon,								
								id: i,
								message: this.chatPrvd.postMessages[i]
							});
							
							
							if(this.chatPrvd.postMessages[i].locked && this.chatPrvd.postMessages[i].locked_by_user && this.user.id != this.chatPrvd.postMessages[i].user_id){
								
							}else{
								let infoWindow = new google.maps.InfoWindow({
								  content:this.chatPrvd.postMessages[i].place_name
								})
								infoWindow.open(this.map, marker);
								
							}
							
							
                            this.mapMarkers.push(marker);
                            google_maps.event.addListener(marker, 'click', () => {
                                if(marker.message.undercover){
                                    this.openLobbyForPinned(marker.message);
                                }else{
                                    this.openConversationLobbyForPinned(marker.message)
                                }
                            });
                        }
                    }
                }
                this.addMarker();
            }, err => {
                console.log('[google address] error:', err);
         });


         this.map.setCenter(loc);
     });
	 
	 
  }

  public clearMarkers():void {
	  console.log('clearMarkers');
      for (var i = 0; i < this.mapMarkers.length; i++ ) {
          this.mapMarkers[i].setMap(null);
      }
      this.mapMarkers.length = 0;
  }

  public addMarker():void {
     for (var j = 0; j < this.mapMarkers.length; j++) {
        this.mapMarkers[j].setMap(this.map);
     }
  }

  private viewLineLocation(message:any):void {
    this.messagesInterval = false;
    clearTimeout(this.messIntObject);
    this.chatPrvd.postMessages = [];
    this.chatPrvd.isCleared = true;

    this.gapi.init.then((google_maps: any) => {
        let loc: any = {
            lat: parseFloat(message.lat),
            lng: parseFloat(message.lng)
        };

        let iconUrl='assets/icon/marker.png';
        let iconSize=new google_maps.Size(35, 40);

        this.map.zoom = 14;

        this.gpsPrvd.getGoogleAdress(parseFloat(message.lat), parseFloat(message.lng)).map(res => res.json()).subscribe(res => {
            let chatRoom = {
                url: iconUrl,
                scaledSize: iconSize,
                origin: new google_maps.Point(0, 0),
                anchor: new google_maps.Point(0, 0)
            };

            let marker = new google_maps.Marker({
                map: this.map,
                position: new google_maps.LatLng(parseFloat(message.lat), parseFloat(message.lng)),
                icon: chatRoom
            });

            this.mapMarkers.push(marker);
            this.addMarker();
        });

        this.map.setCenter(loc);
    });
  }

  public lineJoinRequest():void {
        let alert = this.alertCtrl.create({
            subTitle: 'Become a part of the local broadcast?',
            buttons: [{
                text: 'Not now',
                role: 'cancel'
            }, {
                cssClass: 'active',
                text: 'Sure',
                handler: () => {
                    console.log('joinNetwork handler');
                    alert.dismiss();
                    this.toolsPrvd.pushPage(NetworkContactListPage, {
                        type: 'emails',
                        show_share_dialog: true
                    });
                    return false;
                }
            }]
        });
        alert.present();
  }

  private setCustomTransitions():void {
    this.config.setTransition('modal-slide-left', ModalRTLEnterAnimation);
    this.config.setTransition('modal-slide-right', ModalRTLLeaveAnimation);
  }

  private setDefaultTimer(forced?:boolean):void {
    if (this.chatPrvd.getState() == 'undercover' &&
        !this.postTimerObj.time) {
      this.setPostTimer(1);
    }
  }

  private toggleChatOptions():void {
    this.chatPrvd.plusBtn.setState((this.chatPrvd.plusBtn.getState() == 'spined') ? 'default' : 'spined');
    this.chatPrvd.bgState.setState((this.chatPrvd.bgState.getState() == 'stretched') ? 'compressed' : 'stretched');

    if (this.chatPrvd.bgState.getState() == 'stretched') {
      this.chatPrvd.postBtn.setState(false);
      for (let i = 0; i < this.chatPrvd.chatBtns.state.length; i++) {
        setTimeout(() => {
          this.chatPrvd.chatBtns.state[i] = 'btnShown';
        }, chatAnim/3 + (i*50));
      }
    } else { 
	  if (this.cameraPrvd.takenPictures.length > 0) {
        this.chatPrvd.postBtn.setState(true);
      }else if(this.txtIn!= undefined){
		  if(this.txtIn.value.trim() != ''){
			this.chatPrvd.postBtn.setState(true); 
		  }
	  }
      for (let i = 0; i < this.chatPrvd.chatBtns.state.length; i++) {
        this.chatPrvd.chatBtns.state[i] = 'btnHidden';
      }
    }
  }

  private changePlaceholderText():void {
      this.placeholderText = 'What do you want to talk about?';
  }

  private generateEmoticons():void {
    for (let i = 0; i < this.emoticX.length; i++) {
      for (let j = 0; j < this.emoticY.length; j++) {
        this.emojis.push('0x' + this.emoticY[j].concat(this.emoticX[i]));
      }
    }
  }

  private openCamera():void {
    this.toggleContainer(this.emojiContainer, 'hide');
    this.toggleContainer(this.shareContainer, 'hide');
    this.mainInput.setState('fadeOutfast');
    setTimeout(() => {
      this.mainInput.hide();
      this.chatPrvd.mainBtn.setState('minimisedForCamera');
      setTimeout(() => {
        this.chatPrvd.mainBtn.hide();
        this.toolsPrvd.pushPage(CameraPage);
      }, chatAnim/2);
    }, animSpeed.fadeIn/2);
  }

  private setContentPadding(status):void {
    try {
      this.contentPadding = status ? document.documentElement.clientHeight / 2 + 76 + 'px' : '180px';
    } catch (e) {
      console.log(e);
    }
  }

  public showMyReply(message:any){	  
	console.log(message);	
	console.log('[isLobbyChat] '+this.chatPrvd.isLobbyChat);
	console.log('[areaLobby] '+this.chatPrvd.areaLobby);		
	
  }
  
  private sendLineAccessRequest(messageId:any){
	this.requestMessage = this.user.name+' would like to hang out!';
	this.request_type = 'ACCESS_REQUEST';
	this.toolsPrvd.showLoader();
	this.chatPrvd.getLocationLobby(messageId).subscribe(res => {
		if (res && res.messages && res.room_id) {
			this.chatPrvd.currentLobby.id = res.room_id;
			// this.chatPrvd.startLobbySocket(res.room_id);
			this.chatPrvd.getLocationLobbyUsers(messageId).subscribe(res => {
				if (res && res.users && res.host_id) {
					this.chatPrvd.currentLobby.users = res.users;
					this.chatPrvd.currentLobby.hostId = res.host_id;
					this.postMessage();
					this.toolsPrvd.showToast('Request sent.');
				} 
			}, err => {
				console.error(err);
			});
			
		} 
	}, err => {
		console.error(err);		
	});
  }

  
  public changeRequestStatus(message:any,resStatus:string){
	  let parentMessageId = '';
	  this.toolsPrvd.showLoader();
	  this.chatPrvd.getParentLobby(message).subscribe(res => {
		parentMessageId = res.messages.id;
		console.log(message.id);	
		let data = {
		  id: parentMessageId,
		  message: message,
		  status: resStatus
		}
		
		this.chatPrvd.unlockRequest(data).subscribe(res => {
			for (let m in this.chatPrvd.postMessages) {
			  if(this.chatPrvd.postMessages[m].id == message.id) {
				this.chatPrvd.postMessages	
				this.chatPrvd.postMessages.splice(m, 1);
				break;
			  }
			}
			this.toolsPrvd.hideLoader();
			this.hideTopSlider('unlock');
			let showToast = "Process was successfully completed.";
			switch(resStatus){
				case "ACCEPT":
					showToast ="Request has been accepted successfully.";
					break;
				case "REJECT":
					showToast ="Request has been rejected successfully.";
					break;
					
			}
			this.toolsPrvd.showToast(showToast);
		}, err => {		
			console.error(err);
			this.hideTopSlider('unlock');
			let showToast ="Something went wrong. Please try later.";
			this.toolsPrvd.showToast(showToast);
		});

	  });
	  
  }
  
  private updateContainer(container:any) {
    if (this.chatPrvd.appendContainer.hidden)
      this.chatPrvd.mainBtn.setState('normal');
    else this.chatPrvd.mainBtn.setState('above_append');

    container.setState('off');
    this.setContentPadding(false);
    setTimeout(() => {
      container.hide();
      this.socialPosts = [];
    }, chatAnim / 2);
  }

  private toggleContainer(container, visibility?: string, name?: string):void {
    if (visibility && visibility == 'hide') {
      this.updateContainer(container);
        if(this.chatPrvd.plusBtn.getState() == 'spined'){
            this.chatPrvd.mainBtn.setState('back-to-hold');
        }
    }

    if (!visibility) {
      if (container.hidden) {
        this.chatPrvd.mainBtn.setState('moved-n-scaled');

        container.show();
        container.setState('on');
        this.setContentPadding(true);

        if (container == this.emojiContainer) {
          this.setDefaultTimer();
        }

        for (let i = 0; i < this.toggContainers.length; i++) {
          if (!this.toggContainers[i].hidden &&
            container != this.toggContainers[i]) {
              this.toggContainers[i].setState('off');
            setTimeout(() => {
              this.toggContainers[i].hide();
            }, chatAnim / 2);
          }
        }
        if (name && name == 'shareContainer') this.getSocialPosts();
      } else {
        this.updateContainer(container);
      }
    }

  }

  private insertEmoji(emoji):void {
    let emojiDecoded = String.fromCodePoint(emoji);
    this.postMessage(emojiDecoded);
  }

  private convertEmoji(unicode):any {
    return String.fromCodePoint(unicode);
  }

  private sendLockInfo(event:any, form: any):void {
    event.stopPropagation();
    event.preventDefault();
    if (form.invalid) {
      this.toolsPrvd.showToast(this.textStrings.require);
    } else {
      this.hideTopSlider('lock');
      this.postLockData = {
        hint: form.value.hint,
        password: form.value.password
      }
    }
  }

  private sendCustAddressInfo(event:any, form: any):void {
    event.stopPropagation();
    event.preventDefault();
    if (form.invalid) {
	  this.toolsPrvd.showToast(this.textStrings.require);
    } else {
		this.postCustAddressData = {
            custumAddress: form.value.custumAddress
        };

        let keyword : string = form.value.custumAddress;

        let options: NativeGeocoderOptions = {
            useLocale: true,
            maxResults: 1
        };

        this.nativeGeocoder.forwardGeocode(keyword, options).then((data: NativeGeocoderForwardResult[]) =>  {
            this.geocoded = true;
            if (data) {
				console.log(data);
                if (data[0].latitude && data[0].longitude) {
                    this.insideRadius = this.gpsPrvd
                        .calculateDistanceInMiles({
                            lat: <number> parseFloat(data[0].latitude),
                            lng: <number> parseFloat(data[0].longitude)
                        },this.gpsPrvd.coords);

                    if(this.insideRadius){
                        this.gpsPrvd.coords = this.locationchange.parseCoordinates(data[0]);
                        try {
                            this.storage.set('custom_coordinates', this.gpsPrvd.coords);
                            let cont0 = this.getTopSlider('address');
                            cont0.setState('slideUp');
                            cont0.hide();

                            this.gpsPrvd.getCustomZipCode().then(res => {
                               if(res){
                                   this.gapi.init.then((google_maps:any) => {
                                       let loc:any = {
                                           lat: this.gpsPrvd.coords.lat,
                                           lng: this.gpsPrvd.coords.lng
                                       };

                                       this.map = new google_maps.Map(this.mapElement.nativeElement, {
                                           zoom: 16,
                                           center: loc,
                                           disableDefaultUI: true,
                                           fullscreenControl: false
                                       });

                                       this.gpsPrvd.getGoogleAdress(this.gpsPrvd.coords.lat, this.gpsPrvd.coords.lng).map(res => res.json()).subscribe(res => {
                                           let icon = {
                                               url:'assets/icon/wi-fi.png'
                                           };

                                           let marker = new google_maps.Marker({
                                               map: this.map,
                                               animation: google_maps.Animation.DROP,
                                               position: res.results[0].geometry.location,
                                               icon: icon
                                           });
                                       });

                                       this.map.setCenter(loc);
                                   });
                                   this.postCustAddressData = {
                                       custumAddress: null
                                   };
                               }else{
                                   this.customAddressReset()
                               }
                            }).catch(err => {
                                this.customAddressReset()
                            });
                        } catch (err) {
                            this.customAddressReset()
                        }
                    } else {
                        this.postCustAddressData = {
                            custumAddress: null
                        };

                        let alert = this.alertCtrl.create({
                            subTitle: 'The location has to be within 10 miles of you. Sorry! House rules.',
                            buttons: [{
                                text: 'Ok',
                                role: 'cancel'
                            }]
                        });
                        alert.present();
                    }
                }
            }else{
                this.customAddressReset()
            }
        }).catch((error : any)=>{
            this.customAddressReset()
        });
    }
  }

  public showUnlockPostForm(messageId:any, hint:any){
    this.postUnlockData.id = messageId;
    this.currentHint = hint;
    this.toggleTopSlider('unlock');
  }

  public customAddressReset(){
      this.toolsPrvd.showToast('Check it again, something is wrong');
      this.storage.rm('custom_coordinates');
      this.postCustAddressData = {
          custumAddress: null
      };
      let cont0 = this.getTopSlider('address');
      cont0.setState('slideDown');
      cont0.show();
      this.chatPrvd.postMessages = [];
      this.settings.isNewlineScope=true;
      this.gpsPrvd.getMyZipCode();
  }

  private unlockPost(event:any, form: any):void {
    event.stopPropagation();
    event.preventDefault();
    this.toolsPrvd.showLoader();
    if (form.invalid) {
      this.toolsPrvd.hideLoader();
      this.toolsPrvd.showToast(this.textStrings.require);
    } else {
      this.postUnlockData.password = form.value.password;
      console.log('postUnlockData:', this.postUnlockData);
      this.chatPrvd.unlockPost(this.postUnlockData).subscribe(res => {
        console.log('unlock post:', res);
        for (let m in this.chatPrvd.postMessages) {
          if(this.chatPrvd.postMessages[m].id == this.postUnlockData.id) {
            this.chatPrvd.postMessages[m].locked_by_user = false;
            this.openLobbyForLockedChecked(this.chatPrvd.postMessages[m]);
            break;
          }
        }
        this.postUnlockData.id = null;
        this.postUnlockData.password = null;
        this.toolsPrvd.hideLoader();
        this.hideTopSlider('unlock');
      }, err => {
        this.toolsPrvd.hideLoader();
        this.toolsPrvd.showToast('Wrong password');
        console.error(err);
        this.postUnlockData.id = null;
        this.postUnlockData.password = null;
        this.hideTopSlider('unlock');
        this.setMainBtnStateRelativeToEvents();
      });
    }
  }

  private postMessageFromSocial(post:any):void {
    console.log('post:', post);
    let params: any = {
      text: post.text_with_links || '',
      text_with_links: post.text_with_links || '',
      social_urls: post.image_urls ? post.image_urls : [],
      social: post.social,
      post_url: post.post_url,
      video_urls: post.video_urls ? post.video_urls : [],
      social_post: true
    }
    this.postMessage(null, params);
  }

  private updatePost(data: any, message?:any, emoji?:any):void {
    // this.toolsPrvd.hideLoader();
    if (!emoji) {
      this.txtIn.value = '';
      this.setMainBtnStateRelativeToEvents();
      this.chatPrvd.postBtn.setState(false);

      if (this.postTimer.isVisible()) {
        setTimeout(() => {
          this.postTimer.hide();
        }, chatAnim/2);
        this.postTimer.setState('slideUp');
      }
      if (this.debug.postHangTime != 0) {
        this.debug.postHangTime = 0;
      }
    }
  }

  public inputOnFocus():void {
    if (!this.chatPrvd.isLobbyChat) this.setDefaultTimer();
  }

  private postMessage(emoji?: string, params?: any):void {
	try {
      let publicUser: boolean;
      let images = [];
      let messageParams: any = {};
      let message: any = {};

        if(this.slideAvatarPrvd.sliderPosition == 'left' && this.storage.get('slider_position')=='left'){
            publicUser=true;
        }else{
            publicUser=false;
        }

        if(this.chatPrvd.getState() == 'area'){
            this.toggleContainer(this.emojiContainer, 'hide');
            this.toggleContainer(this.shareContainer, 'hide');
            if (this.chatPrvd.bgState.getState() == 'stretched') {
                this.toggleChatOptions();
            }
        }


      if (this.cameraPrvd.takenPictures) images = this.cameraPrvd.takenPictures;


      if (params && params.social && !this.chatPrvd.isLobbyChat)
        this.setDefaultTimer();
	
	  let msgrequest_type = this.request_type?this.request_type:null;
	  
	  
	  let textInput = '';
	   if(this.txtIn != undefined) {	
			 textInput = this.txtIn.value;
	   }
	  let messageTxt = this.requestMessage?this.requestMessage:textInput;
	  
      messageParams = {
        text: emoji ?  emoji : messageTxt,
        text_with_links: emoji ?  emoji : messageTxt,
        user_id: this.user ? this.user.id : 0,
        role_name: this.user.role_name,
        place_name: this.gpsPrvd.place_name,
        images: emoji ? [] : images,
        messageable_type: 'Network',
        video_urls: params && params.video_urls ? params.video_urls : [],
        undercover: (this.chatPrvd.getState() == 'area') ? false : this.isUndercover,
        public: publicUser,
        is_emoji: emoji ? true : false,
        locked: (this.postLockData.hint && this.postLockData.password) ? true : false,
        password: this.postLockData.password ? this.postLockData.password : null,
        hint: this.postLockData.hint ? this.postLockData.hint : null,
        expire_date: this.postTimerObj.expireDate ? this.postTimerObj.expireDate : null,
        timestamp: Math.floor(new Date().getTime()/1000),
		message_type: msgrequest_type
      };

      if (params) Object.assign(messageParams, params);

      message = Object.assign(message, messageParams);

      let imageUrls = emoji ? [] : images;

      message.image_urls = messageParams.social_urls
        ? messageParams.social_urls : imageUrls;
      message.isTemporary = false;
      message.temporaryFor = 0;

      console.log('[POST MESSAGE] messageParams:', messageParams);
	  
      if ((message.text && message.text.trim() != '') ||
          (message.images && message.images.length > 0) ||
          (message.social_urls && message.social_urls.length > 0)) {

        if (!message.social) {
          console.log('this user:', this.user);
          message.user_id = this.user.id;
          message.user = this.user;
          message.image_urls = message.images;
          message.is_synced = false;
          if (this.chatPrvd.isLobbyChat) message.expire_date = null;

          console.log('message before unshift:', message);
		  
		if(this.request_type != "ACCESS_REQUEST"){
			this.chatPrvd.postMessages.unshift(message);
		}
          this.hideTopSlider(this.activeTopForm);	
		  if(this.txtIn != undefined) {	
			this.txtIn.value = '';
		  }
          this.setMainBtnStateRelativeToEvents();
        }

        this.toolsPrvd.showLoader();
        this.chatPrvd.sendMessage(messageParams).then(res => {
          this.hideTopSlider(this.activeTopForm);
          message.id=res.id;

          if(this.chatPrvd.isLobbyChat || this.chatPrvd.areaLobby){
              res.notification_type="new_message";
              this.chatPrvd.sendNotification(res).subscribe(notificationRes => {
                  console.log('Notification Res', notificationRes);
              }, err => console.error(err));
          }
		  
          if (!this.chatPrvd.areaLobby && !this.chatPrvd.isLobbyChat && this.request_type != "ACCESS_REQUEST" || !this.chatPrvd.areaLobby && this.chatPrvd.getState() == 'area' && this.request_type != "ACCESS_REQUEST") {
              let alert = this.alertCtrl.create({
                  subTitle: 'Share the conversation with your friends?',
                  buttons: [{
                      text: 'No',
                      role: 'cancel',
                      handler: () => {
                          this.openConversationLobbyForPinnedFormMessage(message);
                      }
                  }, {
                      cssClass: 'active',
                      text: 'Yes',
                      handler: () => {
                          alert.dismiss();
                          let subject = message.text_with_links ? message.text_with_links : '';
                          let file = message.image_urls.length > 1 ? message.image_urls[0] : null;
                          if (this.plt.is('ios')){
                              this.sharing.share(subject, 'Netwrk', file, 'netwrkapp://landing').then(res => {
                                      this.toolsPrvd.showToast('Message successfully shared');
                                      this.openConversationLobbyForPinnedFormMessage(message);
                                  }, err =>{
                                      this.toolsPrvd.showToast('Unable to share message');
                                  }
                              );
                          }else{
                              this.sharing.share(subject, 'Netwrk', file, 'https://netwrkapp.com/landing').then(res => {
                                      this.toolsPrvd.showToast('Message successfully shared');
                                      this.openConversationLobbyForPinnedFormMessage(message);
                                  }, err =>{
                                      this.toolsPrvd.showToast('Unable to share message');
                                  }
                              );
                          }

                          return false;
                      }
                  }]
              });

              alert.present();
          }
          console.log('[sendMessage] res:', res);
		  
		  this.request_type = null;
          this.postLockData.hint = null;
          this.postLockData.password = null;
          this.postTimerObj.expireDate = null;
          this.postTimerObj.label = null;
          this.updatePost(res, message, emoji);
          this.postTimerObj.time = null;
          this.chatPrvd.scrollToTop();
          this.toolsPrvd.hideLoader();
        }).catch(err => {
          this.toolsPrvd.hideLoader();
          console.error('sendMessage:', err);
          this.updatePost(err, message);
        });
        if (!emoji) {
          this.chatPrvd.appendContainer.setState('off');
          this.chatPrvd.mainBtn.setState('hidden');
          setTimeout(() => {
            this.chatPrvd.appendContainer.hide();
          }, chatAnim/2);
          this.cameraPrvd.takenPictures = [];
        }
      }
    } catch (e) {
      this.toolsPrvd.hideLoader();
      console.error('Error in postMessage:', e);
    }
  }

  private calculateInputChar(inputEl:any):void {
    let btnState:boolean = (inputEl.value.trim().length > 0 ||
    this.cameraPrvd.takenPictures.length > 0);
    this.chatPrvd.postBtn.setState(btnState);
    if (!this.chatPrvd.postBtn.getState()) {
      this.hideTopSlider(this.activeTopForm);
    }
  }

  private getCaretPos(oField):void {
    if (oField.selectionStart || oField.selectionStart == '0')
      this.caretPos = oField.selectionStart;
  }

  private updateMessages(scroll?:boolean):Promise<any> {
    return new Promise((resolve, reject) => {
      console.log('(updateMessages) isUndercover:', this.isUndercover);
      this.chatPrvd.showMessages(this.chatPrvd.postMessages, 'chat', this.isUndercover).then(res => {
        console.log('[SHOW MESSAGES] res:', res);
        this.chatPrvd.postMessages = this.chatPrvd.organizeMessages(res.messages);
        res.callback(this.chatPrvd.postMessages);
        this.toolsPrvd.hideLoader();
        resolve();
      }, err => {
        console.error('SHOW MESSAGES ERROR:', err);
        this.toolsPrvd.hideLoader();
        reject();
      });
    })
  }

  private openFeedbackModal(messageData: any, mIndex: number):void {
	  
    this.toolsPrvd.showLoader();
	
    console.log('(openFeedbackModal) messageData:', messageData);
    this.chatPrvd.sendFeedback(messageData, mIndex).then(res => {
      console.log('sendFeedback:', res);
      res['isUndercover'] = this.isUndercover;
      res['message'] = messageData;
      let feedbackModal = this.modalCtrl.create(FeedbackModal,res);
      setTimeout(() => {
        feedbackModal.present();
		
      }, chatAnim/2);
      feedbackModal.onDidDismiss(data => {
        this.setMainBtnStateRelativeToEvents();
        if (data) {
          if (data.like) {
            this.chatPrvd.postMessages[mIndex].likes_count = data.like.total;
            this.chatPrvd.postMessages[mIndex].like_by_user = data.like.isActive;
          }
          if (data.legendary) {
            this.chatPrvd.postMessages[mIndex].legendary_count = data.legendary.total;
            this.chatPrvd.postMessages[mIndex].legendary_by_user = data.legendary.isActive;
          }
          if (data.isBlocked) {
            for (let i = 0; i < this.chatPrvd.postMessages.length; i++) {
              if (this.chatPrvd.postMessages[i].id == messageData.id) {
                this.chatPrvd.postMessages = this.chatPrvd.postMessages.splice(i, 1);
                break;
              }
            }
            switch(this.chatPrvd.getState()) {
              case 'undercover':
                this.messagesInterval = true;
                clearTimeout(this.messIntObject);
                this.startMessageUpdateTimer();
                break;
              case 'area':
                this.updateMessages(false);
                break;
            }
          }
        } else console.warn('[likeClose] Error, no data returned');
      });
    })
  }

  private goToLegendaryList():void {
    let netwrkId = this.networkPrvd.getNetworkId();
    console.log('this.user:', this.user);
    let legModal = this.modalCtrl.create(LegendaryModal,
    {
      netwrk_id: netwrkId,
      user_id: this.user.id
    }, {
      showBackdrop: false,
      enableBackdropDismiss: false,
      enterAnimation: 'modal-slide-left',
      leaveAnimation: 'modal-slide-right'
    });

    legModal.onDidDismiss(data => {
      if (data && data.joinNetwork) {
        this.joinNetwork();
      }
    });
    legModal.present();
  }

    public goBack():void {		
		this.app.getRootNav().setRoot(ChatPage);
        this.storage.rm('custom_coordinates');
        this.gpsPrvd.getMyZipCode().then(res => {
			this.initLpMap();
			let cont0 = this.getTopSlider('address');
            cont0.setState('slideUp');
            cont0.hide();			
        });
        this.chatPrvd.postMessages = [];
        this.settings.isNewlineScope=false;
        this.settings.isCreateLine=false;
        this.chatPrvd.isCleared = true;		
        this.refreshChat();		
    }

    public openLinePage():void {
        let cont0 = this.getTopSlider('address');
        cont0.setState('slideUp');
        cont0.hide();
        this.settings.isNewlineScope=false;
        this.settings.isCreateLine=true;
        this.toolsPrvd.pushPage(UndercoverCharacterPage);
    }

    public eventClickTrigger():void {
        this.messagesInterval = false;
        clearTimeout(this.messIntObject);
        this.chatPrvd.postMessages = [];
        //this.chatPrvd.isCleared = true;
        this.settings.isNewlineScope=true;
    }

  private goArea():void {
    this.messagesInterval = false;
    clearTimeout(this.messIntObject);
    this.setPostTimer(3);
    this.hideTopSlider(this.activeTopForm);
    this.chatPrvd.setState('area');
    this.placeholderText = 'Start a local conversation...';
    this.getAndUpdateUndercoverMessages();
    this.initLpMap();
    this.chatPrvd.isMainBtnDisabled = false;
    this.getUsers().then(res => {});
    this.toolsPrvd.hideLoader();
  }

  private getNetworkUsers():void {
    let netPar:any = {
        post_code: this.chatPrvd.localStorage.get('chat_zip_code')
    };
    this.networkPrvd.getUsers(netPar).subscribe(res => {
        if (res) {
            this.networkUsers = res.users;
            this.uniqueUsers = res.unique_users;
        }
    }, err => console.error(err));
  }

  private goUndercover(event?:any):any {
    console.log('============= goUndercover =============');
    this.messagesInterval = false;
    clearTimeout(this.messIntObject);
    this.chatPrvd.isMainBtnDisabled = true;
    this.toolsPrvd.showLoader();

    if (event) {
      console.log('_event:', event);
      event.stopPropagation();
      if (this.chatPrvd.mainBtn.getState() == 'minimised') {
        if (this.activeTopForm) {
          console.log('txtIn:', this.txtIn);
          this.txtIn.value = '';
          this.hideTopSlider(this.activeTopForm);
          this.chatPrvd.postBtn.setState(false);
        }
        this.keyboard.close();
        setTimeout(() => {
          this.setMainBtnStateRelativeToEvents();
        }, 300);
      } else if (this.chatPrvd.mainBtn.getState() == 'moved-n-scaled') {
        this.toggleContainer(this.emojiContainer, 'hide');
        this.toggleContainer(this.shareContainer, 'hide');
        this.keyboard.close();
      }else if(this.chatPrvd.mainBtn.getState() == 'back-to-hold'){
          this.toggleContainer(this.emojiContainer, 'hide');
          this.toggleContainer(this.shareContainer, 'hide');
          this.keyboard.close();
      }
      this.chatPrvd.isMessagesVisible = false;
      this.chatPrvd.postMessages = [];
    }

    if (this.chatPrvd.getState() == 'undercover') {		
		this.getGoodStuff('goodStuff');		
		this.chatPrvd.setState('area');

        this.chatPrvd.detectNetwork().then(res => {
            console.log('[goUndercover] detectNetwork res:', res);
            if (res.network)
              this.chatPrvd.saveNetwork(res.network);

            if (res.message == 'Network not found') {
               this.gpsPrvd.createNetwrk(this.chatPrvd.localStorage.get('chat_zip_code')).subscribe(res => {
                    if(res){
                        this.networkParams = {
                            post_code: this.chatPrvd.localStorage.get('chat_zip_code')
                        };
                        this.networkPrvd.join(this.networkParams).subscribe(res => {
                            this.getNetworkUsers();
                            this.undercoverPrvd.setUndercover(false);
                            this.isUndercover=false;
                            this.flipInput();
                            this.changePlaceholderText();
                            this.goArea();
                            this.content.resize();
                            this.chatPrvd.isMainBtnDisabled = true;
                        }, err => {
                            this.toolsPrvd.hideLoader();
                            console.log(err);
                        });
                    }else{
                        this.toolsPrvd.hideLoader();
                    }
                }, err => {
                   this.toolsPrvd.hideLoader();
                    console.log(err);
                });
            } else {
              this.undercoverPrvd.setUndercover(false);
              this.isUndercover=false;
              this.flipInput();
              this.changePlaceholderText();
              this.goArea();
              this.content.resize();
            }

        }, err => console.error(err));

    } else if (this.chatPrvd.getState() == 'area') {		
      this.chatPrvd.setState('undercover');
      this.setPostTimer(0);
      this.undercoverPrvd.setUndercover(true);
      this.isUndercover=true;
      this.chatPrvd.alreadyScolledToBottom = false;
      this.runUndecoverSlider(this.pageTag);
      this.startMessageUpdateTimer();
      this.flipInput();
      this.changePlaceholderText();
      this.messagesInterval = true;
      setTimeout(() => {
        this.content.resize();
      }, 1);
      setTimeout(() => {
        this.toolsPrvd.hideLoader();
      }, 1000);
    }

    setTimeout(() => {
      //this.chatPrvd.isMainBtnDisabled = false;
      this.toolsPrvd.hideLoader();
      console.log('========= end of goUndercover =========');
    }, 2);
  }

  private toggleShareSlider(social_network):void {
    this.shareCheckbox[social_network] = !this.shareCheckbox[social_network];
    this.getSocialPosts();
  }

  private goToHoldScreen():void {
      this.chatPrvd.postMessages=[];
      this.chatPrvd.isCleared = true;
      this.toolsPrvd.pushPage(NetwrklistPage);
  }

  private getSocialPosts():void {
    this.socialPosts = [];
    let socials = [];
    this.socialLoaderHidden = false;
    console.log('this.shareCheckbox:', this.shareCheckbox);
    for (let i in this.shareCheckbox) if (this.shareCheckbox[i]) socials.push(i);
    console.log('socials:', socials);
    if (socials.length > 0) {
      this.socialPrvd.getSocialPosts(socials).subscribe(res => {
        this.socialLoaderHidden = true;
        console.log('[getSocialPosts] res:', res);
        this.socialPosts = res.messages;
      }, err => {
        this.socialLoaderHidden = true;
        console.error('[getSocialPosts] err:', err);
      });
    } else {
      this.socialLoaderHidden = true;
    }
  }

  private changeCallback(positionLeft?: boolean):void {
    this.zone.run(() => {
      this.undercoverPrvd.profileType = positionLeft ? 'public' : 'undercover';
    });
  }

  private removeAppendedImage(ind:number):void {
    this.cameraPrvd.takenPictures.splice(ind, 1);
    if (this.cameraPrvd.takenPictures.length == 0) {
      this.chatPrvd.mainBtn.setState('normal');
      this.chatPrvd.appendContainer.setState('off');
      if (this.txtIn.value.trim().length == 0)
      this.chatPrvd.postBtn.setState(false);
      setTimeout(() => {
        this.chatPrvd.appendContainer.hide();
      }, chatAnim/2);
    }
  }

  private getTopSlider(container:string):any {
    const a = {
      timer: this.postTimer,
      lock: this.postLock,
      address: this.postCustAddress,
      unlock: this.postUnlock	  
    }
    return a[container];
  }

  private hideTopSlider(container:string):void {
    let cont = this.getTopSlider(container);
    if (cont && cont.isVisible()) {
      cont.setState('slideUp');
      this.activeTopForm = null;
      setTimeout(() => {
        cont.hide();
      }, chatAnim/2);
    } else {
      console.warn('[hideTopSlider] container is not valid');
    }
  }

  public validateLockSpaces(event, type:string):any {
    this.postLockData[type] = event.target.value.trim();
  }

  private toggleTopSlider(container:string):void {
    if (this.plt.is('ios'))
      this.keyboard.show();

    let cont = this.getTopSlider(container);
    if (this.activeTopForm)
      this.hideTopSlider(this.activeTopForm);

    if (cont.isVisible()) {
      cont.setState('slideUp');
      this.activeTopForm = null;
      setTimeout(() => {
        cont.hide();
      }, 400);
    } else {
      this.activeTopForm = container;
      cont.show();
      cont.setState('slideDown');
      setTimeout(() => {
        this.setMainBtnStateRelativeToEvents();
      }, 400);
    }
  }

    private getMiddleSlider(container:string,id:number):any {
        const a = {
            timer: this.postTimer,
            lock: this.postLock,
            address: this.postCustAddress,
            unlock: this.postUnlock
        }
        return a[container];
    }

  private toggleBarSlider(container:string,id:number):void {
    if (this.plt.is('ios'))
      this.keyboard.show();

    let cont = this.getMiddleSlider(container,id);
    if (this.activeTopForm)
      this.hideTopSlider(this.activeTopForm);

    if (cont.isVisible()) {
      cont.setState('slideUp');
      this.activeTopForm = null;
      setTimeout(() => {
        cont.hide();
      }, 400);
    } else {
      this.activeTopForm = container;
      cont.show();
      cont.setState('slideDown');
      setTimeout(() => {
        this.setMainBtnStateRelativeToEvents();
      }, 400);
    }
  }

  private setPostTimer(timeId:number):any {
    let currentDate = moment(new Date());
    switch (timeId) {
      case 0:
        this.hideTopSlider('timer');
        this.postTimerObj.time = null;
        this.postTimerObj.expireDate = null;
        break;
      case 1:
        // 1 hour
        this.postTimerObj.expireDate = currentDate.add(1, 'hours');
        this.postTimerObj.time = '1h';
        this.postTimerObj.label = 'hours';
        break;
      case 2:
        // 1 day
        this.postTimerObj.expireDate = currentDate.add(24, 'hours');
        this.postTimerObj.time = '1d';
        this.postTimerObj.label = 'days';
        break;
      case 3:
        // 1 week (168h)
        this.postTimerObj.expireDate = currentDate.add(168, 'hours');
        this.postTimerObj.time = '1w';
        this.postTimerObj.label = 'weeks';
        break;
      case 4:
        // 1 month
        this.postTimerObj.expireDate = currentDate.add(1, 'months');
        this.postTimerObj.time = '1m';
        this.postTimerObj.label = 'months';
        break;
      case 5:
        // 1 year
        this.postTimerObj.expireDate = currentDate.add(1, 'years');
        this.postTimerObj.time = '1y';
        this.postTimerObj.label = 'years';
        break;
      default:
        this.postTimerObj.time = null;
        return;
    }
    this.hideTopSlider('timer');
  }


    public joinNetwork():void {
        let alert = this.alertCtrl.create({
            subTitle: 'Become a part of the local broadcast?',
            buttons: [{
                text: 'Not now',
                role: 'cancel'
            }, {
                cssClass: 'active',
                text: 'Sure',
                handler: () => {
                    console.log('joinNetwork handler');
                    alert.dismiss();
                    this.toolsPrvd.pushPage(NetworkContactListPage, {
                        type: 'emails',
                        show_share_dialog: true
                    });

                    this.networkParams = {
                        post_code: this.chatPrvd.localStorage.get('chat_zip_code')
                    };
                    this.networkPrvd.join(this.networkParams).subscribe(res => {

                    }, err => {
                        console.log(err);
                    });

                    return false;
                }
            }]
        });
        alert.present();
    }

  private getUsers():Promise<any> {
    return new Promise((resolve, reject) => {
      this.networkPrvd.getUsers(this.networkParams).subscribe(res => {
        console.log('res:', res);
        if (res) {
          this.chatPrvd.setStorageUsers(res.users);
          this.chatUsers = res.users;
          this.uniqueUsers = res.unique_users;
        } else {
          this.chatUsers.push(this.user);
        }
        resolve();
      }, err => {
        console.error('[GET USERS]', err);
        if (err.status == 401) {
          this.authPrvd.logout().then(res => {
            console.log('logout res:', res);
            this.app.getRootNav().setRoot(LogInPage);
            reject(err);
          }).catch(err => {
            console.error('logout error: ', err);
            reject(err);
          });
        } else {
          reject(err);
        }
      });
    });
  }

  private doInfinite(ev):void {
    if (!this.chatPrvd.isLobbyChat && !this.chatPrvd.areaLobby) {
      setTimeout(() => {
        this.refreshChat(ev).then(succ => ev.complete(), err => ev.complete());
      }, 500);
    }
  }

  private refreshChat(refresher?:any, forced?:boolean):Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.chatPrvd.isLobbyChat && !this.chatPrvd.areaLobby || forced && !this.chatPrvd.areaLobby ) {
        this.chatPrvd.getMessages(this.isUndercover, this.chatPrvd.postMessages, null, true)
        .subscribe(res => {
          res = this.chatPrvd.organizeMessages(res.messages);
          let iconUrl='assets/icon/marker.png';
		  let iconSize=new google.maps.Size(35, 40);
		  let markerIcon = {
			url: iconUrl,
			scaledSize: iconSize,
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(0, 0)
		  };
		  
		  for (let i in res) {
			this.chatPrvd.postMessages.push(res[i]);
			  
			if(res[i].locked && res[i].locked_by_user && this.user.id != res[i].user_id){
				markerIcon.url = 'assets/icon/lock-marker.png'; 								
			}else{
				markerIcon.url = 'assets/icon/marker.png'; 
			}
			let marker = new google.maps.Marker({
				map: this.map,
				position: new google.maps.LatLng(res[i].lat, res[i].lng),
				icon: markerIcon,								
				id: i,
				message: res[i]
			});
			
			if(res[i].locked && res[i].locked_by_user && this.user.id != res[i].user_id){
								
			}else{
				let infoWindow = new google.maps.InfoWindow({
				  content:this.chatPrvd.postMessages[i].place_name
				})
				infoWindow.open(this.map, marker);
				
			}
			
			
			this.mapMarkers.push(marker);			
		  }
	
		  this.addMarker();
		  this.chatPrvd.messageDateTimer.start(this.chatPrvd.postMessages);
          this.chatPrvd.isCleared = false;
          if (refresher) refresher.complete();
		  resolve();
        }, err => {
          console.error(err);
          if (refresher) refresher.complete();
		  reject();
        });
      } else { if (refresher) refresher.complete(); reject(); }
	  
	 
	  
    });
  }

  private sortById_asc(messageA, messageB):any {
    return messageA.id - messageB.id;
  }
  private sortById_desc(messageA, messageB):any {
    return messageB.id - messageA.id;
  }

  private checkUCInterval():void {
    if (this.messagesInterval) {
      clearTimeout(this.messIntObject);
      this.messIntObject = setTimeout(() => {
        this.getAndUpdateUndercoverMessages();
      }, 10000);
    }
  }

  private getAndUpdateUndercoverMessages() {
      if (!this.chatPrvd.areaLobby && !this.chatPrvd.isLobbyChat) {
          this.chatPrvd.getMessages(this.isUndercover, this.chatPrvd.postMessages) .subscribe(res => {
              if (res) {
                  if (res.messages && res.messages.length > 0) {
                      for (let i in this.chatPrvd.postMessages) {
                          for (let j in res.messages) {
                              if (this.chatPrvd.postMessages[i].id == res.messages[j].id) {
                                  this.chatPrvd.postMessages.splice(i, 1);
                              }
                          }
                      }
                      this.chatPrvd.postMessages = this.chatPrvd.postMessages.concat(res.messages);
                      this.chatPrvd.postMessages = this.chatPrvd.organizeMessages(this.chatPrvd.postMessages);
                      this.chatPrvd.messageDateTimer.start(this.chatPrvd.postMessages);
                  }
                  this.initLpMap();
              }
              this.toolsPrvd.hideLoader();
              this.chatPrvd.isMainBtnDisabled = false;
          }, err => {
              this.toolsPrvd.hideLoader();
          });
      }
  }

  private startMessageUpdateTimer() {
    if (this.chatPrvd.getState() == 'undercover' &&  !this.chatPrvd.areaLobby && !this.chatPrvd.isLobbyChat) {
      this.getAndUpdateUndercoverMessages();
    }
  }

  private changeZipCallback(params?: any) {
    if (params) {
      this.isUndercover = this.undercoverPrvd.setUndercover(params.undercover);
      if (this.isUndercover) {
          this.goUndercover();
      }
    }
  }

  private getMessagesIds(messageArray: any):Array<number> {
    let idList:Array<number> = [];
    for (let m in messageArray) {
      idList.push(messageArray[m].id);
    }
    return idList;
  }


  private sendDeletedMessages() {
    this.chatPrvd.deleteMessages(this.idList).subscribe( res => {
      this.canRefresh = true;
    }, err => {
      this.canRefresh = true;
    });
  }

  private clearMessages(postMessage):void {
    this.messagesInterval = false;
    clearTimeout(this.messIntObject);
    this.chatPrvd.postMessages = [];
    this.chatPrvd.isCleared = true;
    //let messageArray=this.getMessagesIds(postMessage);
    //this.chatPrvd.deleteMessages(messageArray).subscribe( res => {
    //      this.canRefresh = true;
    //  }, err => {
    //      this.canRefresh = true;
    //  });
  }

  private flipInput():void {
    this.flipHover = !this.flipHover;
  }

  private runUndecoverSlider(pageTag):void {
    if (this.chatPrvd.getState() == 'undercover') {
      this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
      this.slideAvatarPrvd.sliderInit(pageTag);
      this.content.resize();
    }
  }

  private goToProfile(profileId?: number, profileTypePublic?: boolean,userRoleName?: any):void {
    this.chatPrvd.goToProfile(profileId, profileTypePublic).then(res => {
      this.chatPrvd.isLobbyChat = false;
        if(this.user.id==profileId){
            if(userRoleName){
                this.toolsPrvd.pushPage(ProfilePage, res);
            }else{
                this.toolsPrvd.pushPage(UndercoverCharacterPage, res);
            }
        }else{
            this.toolsPrvd.pushPage(ProfilePage, res);
        }
    }, err => {
      console.error('goToProfile err:', err);
    });
  }

  private updateIconBgRelativeToCamera():boolean {
    let camOpt = this.chatPrvd.localStorage.get('enable_uc_camera');
    return (camOpt === null || !camOpt);
  }

  private setMainBtnStateRelativeToEvents():void {
    if (this.shareContainer.getState() == 'on' || this.emojiContainer.getState() == 'on') {
      this.chatPrvd.mainBtn.setState('moved-n-scaled');
    } else if (this.chatPrvd.appendContainer.getState() == 'on'){
      this.chatPrvd.mainBtn.setState('above_append');
    } else {
      this.chatPrvd.mainBtn.setState('normal');
    }
  }

  public openNotificationMessage(message:any):void {
      if (!this.chatPrvd.isLobbyChat && !this.chatPrvd.areaLobby) {
          this.chatPrvd.getParentLobby(message).subscribe(res => {
              if(message.undercover){
                  this.openLobbyForPinned(message);
              }else{
                  this.openConversationMessage(message)
              }
          });
      }
  }

  private constructorLoad():Promise<any> {
    return new Promise(resolve => {
      console.log('%c [CHAT] constructorLoad ', 'background: #1287a8;color: #ffffff');
      this.keyboard.disableScroll(true);

      this.setCustomTransitions();
      this.keyboard.onKeyboardShow().subscribe(res => {
        //this.topSlider.setState('slideUp');
        this.chatPrvd.postBtn.setState(true);
        if (this.plt.is('ios')) {
          try {
            let footerEl = <HTMLElement>document.querySelector(this.pageTag + ' .chatChatFooter');
            let scrollEl = <HTMLElement>document.querySelector(this.pageTag + ' .scroll-content');
            if (footerEl)
              footerEl.style.bottom = res.keyboardHeight + 'px';
            if (scrollEl)
              scrollEl.style.bottom = res.keyboardHeight + 'px';
            this.isFeedbackClickable = false;
          } catch (e) {
            console.error('on-keyboard-show error:', e);
          }
        }
        this.chatPrvd.mainBtn.setState('minimised');
        if (!this.chatPrvd.appendContainer.hidden) {
          this.chatPrvd.mainBtn.setState('above_append');
        }
      }, err => console.error(err));

      this.keyboard.onKeyboardHide().subscribe(res => {
		  
        this.topSlider.setState('slideDown');
        if (this.plt.is('ios')) {
			
          try {
			let footerEl = <HTMLElement>document.querySelector(this.pageTag + ' .chatChatFooter');
            let scrollEl = <HTMLElement>document.querySelector(this.pageTag + ' .scroll-content');
            /* if (footerEl)
              footerEl.style.bottom = 0 + 'px';*/
		  
		    if (footerEl){
				footerEl.style.removeProperty('bottom');	
			}
            
			if (scrollEl)
              scrollEl.style.bottom = 0 + 'px';

            this.contentMargin = null;
            this.isFeedbackClickable = true;
          } catch (e) {
            console.error('on-keyboard-hide error:', e);
          }
        }

        if (!this.chatPrvd.appendContainer.hidden) {
          this.chatPrvd.mainBtn.setState('above_append');
        }
        if (this.chatPrvd.appendContainer.hidden) {
		  this.chatPrvd.mainBtn.setState('normal');
        }
		if(this.txtIn != undefined){
			if (this.txtIn.value.trim() == '' && !this.chatPrvd.appendContainer.isVisible() && !this.activeTopForm) {
			  this.chatPrvd.postBtn.setState(false);
			} else if (this.txtIn.value.trim() == '' && this.activeTopForm) {
			  this.chatPrvd.mainBtn.setState('minimised');
			}	
		}else{
			this.chatPrvd.mainBtn.setState('normal');
		}
       
      }, err =>  console.error(err));

      this.user = this.authPrvd.getAuthData();
      if (!this.user)
        this.user = {
          avatar_content_type: null,
          avatar_file_name: null,
          avatar_file_size: null,
          avatar_updated_at: null,
          avatar_url: null,
          created_at: '2017-04-22T14:59:29.921Z',
          date_of_birthday: '2004-01-01',
          email: 'olbachinskiy2@gmail.com',
          name: 'Sachin bonzer',
          id: 55,
          invitation_sent: false,
          phone: '1492873128682',
          provider_id: null,
          provider_name: null,
          role_description: null,
          role_image_url: null,
          role_name: null,
          hero_avatar_url: null,
          updated_at: '2017-04-22T14:59:29.921Z'
        }

      if (!this.user.role_image_url)
        this.user.role_image_url = this.toolsPrvd.defaultAvatar;

      this.textStrings.sendError = 'Error sending message';
      this.textStrings.noNetwork = 'Netwrk not found';
      this.textStrings.require = 'Please fill all fields';

      this.action = this.navParams.get('action');
      this.messageParam = this.navParams.get('message');
      // console.log('navParams:', this.navParams);
      // console.log('chat action:', this.action);
      if (this.action) {
        this.chatPrvd.setState(this.action);
        this.isUndercover = this.undercoverPrvd
        .setUndercover(this.chatPrvd.getState() == 'undercover');
      } else {
          this.isUndercover = true;
          this.chatPrvd.setState('undercover');
      }

      if (this.messageParam) {
        this.openNotificationMessage(this.messageParam);
      }

      if (this.chatPrvd.bgState.getState() == 'stretched') {
        this.toggleChatOptions();
      }

      this.flipHover = this.isUndercover ? true : false;

      this.changePlaceholderText();

      this.networkParams = {
        post_code: this.chatPrvd.localStorage.get('chat_zip_code')
      };
      this.hostUrl = this.chatPrvd.hostUrl;

      this.gpsPrvd.changeZipCallback = this.changeZipCallback.bind(this);
      if (this.chatPrvd.getState() == 'undercover') {
          this.chatPrvd.detectNetwork().then(res => {
            this.network = res;
            console.log('DETECT NETWORK [constructorLoad]');
          let firstTimeInChat:any = this.chatPrvd.localStorage.get('first_time_undercover');
          if (res.network) {
            if (firstTimeInChat) {
              this.chatPrvd.networkAvailable = true;
              this.runClickListener();
            } else {
              this.chatPrvd.networkAvailable = null;
            }
          } else {
            if (firstTimeInChat) {
              this.chatPrvd.networkAvailable = false;
              this.runClickListener();
            } else {
              this.chatPrvd.networkAvailable = null;
            }
          }
          resolve('ok');
        }, err => {
          console.error('[NETWORK DETECTION ERROR]:', err);
          resolve('err');
        });
      }
    });
  }

  private runClickListener():void {
    this.global = this.renderer.listen('document', 'touchstart', evt => {
      // console.log('Clicking the document:', evt);
      let destroyEvent:boolean = false;
      this.chatPrvd.localStorage.set('first_time_refresh', false);
      this.chatPrvd.networkAvailable = null;
      this.global();
    });
  }

  private directionSwipe(ev:any):void {
    this.directionCont.nativeElement.classList.remove('swipe-left');
    this.directionCont.nativeElement.classList.remove('swipe-right');
    if (ev.offsetDirection == 2)
      this.directionCont.nativeElement.classList.add('swipe-left');
    else if (ev.offsetDirection == 4)
      this.directionCont.nativeElement.classList.add('swipe-right');
    setTimeout(() => {
      this.dirVisible = false;
    }, 1500);
  }

  ngOnInit() {
    this.chatPrvd.getBlacklist().subscribe(res => {
      if (res && res.length > 0)
        this.chatPrvd.localStorage.set('blacklist', res);
    }, err => console.error(err));

    this.authPrvd.getSocialStatus().subscribe(res => {
      let socialArray = [ 'fb', 'twitter', 'instagram' ];
      for (let i = 0; i < socialArray.length; i++) {
        if (res[socialArray[i]]) {
          this.socialPrvd.connect[socialArray[i]] = res[socialArray[i]];
        }
      }
    }, err => console.error(err));


    if (this.chatPrvd.localStorage.get('last_zip_code') === null) {
      this.chatPrvd.localStorage.set('last_zip_code', this.chatPrvd.localStorage.get('chat_zip_code'));
    } else if (this.chatPrvd.localStorage.get('last_zip_code') != this.chatPrvd.localStorage.get('chat_zip_code')) {
      this.chatPrvd.localStorage.set('first_time_undercover', null);
      this.chatPrvd.localStorage.set('last_zip_code', this.chatPrvd.localStorage.get('chat_zip_code'));
    }
    if (this.chatPrvd.localStorage.get('first_time_undercover') === null)
      this.chatPrvd.localStorage.set('first_time_undercover', true);
    else if (this.chatPrvd.localStorage.get('first_time_undercover')) {
      this.chatPrvd.localStorage.set('first_time_undercover', false);
    }
    this.constructorLoad().then(res => {
      this.componentLoaded = true;
    });
  }

  private initResponseFromGPS():Promise<any> {
    return new Promise ((resolve, reject) => {
      console.log('[response from gps]');
      let providedStateFromGps = this.navParams.get('action_from_gps');
      let areaChanged:boolean = (this.chatPrvd.localStorage.get('areaChange_triggered') === true);
      let firstTimeUC:boolean = (this.chatPrvd.localStorage.get('first_time_undercover') === true);
      //if (areaChanged || firstTimeUC) {
        let placesToSearch:Array<string> = ['bar', 'cafe', 'park'];

        if (this.nearestPlace) this.nearestPlace = undefined;

        this.places.initMapsService().then(res => {
          if (res == 'ok') {
            this.places.getNearestInstitution(
              document.getElementById('places'),
              placesToSearch
            ).then(plcs => {
                if(this.places.displayNearRoutes && plcs){
                    this.nearestPlace = plcs;
                }else{
                    this.chatPrvd.getNearByMessages(null, false).subscribe(res => {
						if(res.messages.length){

                            let lat:number= parseFloat(res.messages[0].lat);
                            let lng:number= parseFloat(res.messages[0].lng);

                            let placeLoc:any = {
                                lat: lat,
                                lng :lng
                            };

                            this.nearestNetwork = {
                                dist: 0,
                                index: 0,
                                location:placeLoc,
                                address_string: res.messages[0].place_name,
                                type: 'network',
                                name: res.messages[0].text
                            };
                            this.nearestPlace = this.nearestNetwork;
                        }else{
                            this.nearestNetwork = {
                                dist: 0,
                                index: 0,
                                location: {
                                    lat:null,
                                    lng: null
                                },
                                address_string: this.gpsPrvd.place_name,
                                type: 'no-network',
                                name: 'Create the first network at a nearby place!'
                            };
                            this.nearestPlace = this.nearestNetwork;
                        }
                    }, err => {
                        this.nearestNetwork = {
                            dist: 0,
                            index: 0,
                            location: {
                                lat:null,
                                lng: null
                            },
                            address_string: this.gpsPrvd.place_name,
                            type: 'no-network',
                            name: 'Create the first network at a nearby place!'
                        };
                        this.nearestPlace = this.nearestNetwork;
                    });
                }
              this.dirVisible = true;
              reject();
              resolve();
            }, err => {
              console.error('getNearestInstitution:', err);
              resolve();
            });
          } else resolve();
        }, err => {
          console.error('initMapsService:', err)
          resolve();
        });
    });
  }

  public openLobbyForLockedChecked(message:any):void {
      if(!this.chatPrvd.isLobbyChat && !this.chatPrvd.areaLobby){
          if (this.chatPrvd.bgState.getState() == 'stretched') {
              this.toggleChatOptions();
          }
          this.toolsPrvd.showLoader();
          this.chatPrvd.isMainBtnDisabled = true;
          this.isUndercover=true;
          this.chatPrvd.postMessages = [];

          this.settings.isNewlineScope=false;
          this.chatPrvd.currentLobbyMessage=message;
          this.chatPrvd.appendContainer.hidden = true;
          this.cameraPrvd.takenPictures = [];
          this.setMainBtnStateRelativeToEvents();
          this.placeholderText = 'What would you like to say?';

          this.chatPrvd.openLobbyForPinned(message).then(() => {
              if(this.chatPrvd.currentLobby.isAddButtonAvailable){
                  this.placeholderText = 'What do you want to talk about?';
              }else{
                  this.placeholderText = 'What would you like to say?';
              }

              this.chatPrvd.allowUndercoverUpdate = false;
              clearTimeout(this.messIntObject);
              this.chatPrvd.toggleLobbyChatMode();
              this.chatPrvd.isMainBtnDisabled = false;
              this.initLpMap();
              this.toolsPrvd.hideLoader();

          }, err => {
              console.error(err);
              this.placeholderText = 'What do you want to talk about?';
              this.chatPrvd.isMainBtnDisabled = false;
              this.startMessageUpdateTimer();
              this.chatPrvd.allowUndercoverUpdate = true;
              this.toolsPrvd.hideLoader();
          });
     }
  }

  public openLobbyForPinned(message:any):void {
      let cont1 = this.getTopSlider('address');
      cont1.setState('slideUp');
      cont1.hide();
console.log('[this.chatPrvd.getState]'+this.chatPrvd.getState());
      if(!this.chatPrvd.isLobbyChat && !this.chatPrvd.areaLobby){
          if(this.chatPrvd.getState() == 'undercover'){
              this.pageNavLobby=true;
          }else  if(this.chatPrvd.getState() == 'area'){
              this.pageNavLobby=false;
          }
          if(this.user.id != message.user_id && message.locked_by_user){
              this.showUnlockPostForm(message.id, message.hint)
          }else{
              this.openLobbyForLockedChecked(message);
          }
      }
  }

  public openLobbyForLineMessage(message:any):void {
      let cont3 = this.getTopSlider('address');
      cont3.setState('slideUp');
      cont3.hide();

      if(!this.chatPrvd.isLobbyChat && !this.chatPrvd.areaLobby){
          if (this.chatPrvd.bgState.getState() == 'stretched') {
              this.toggleChatOptions();
          }
          this.chatPrvd.getParentLobby(message).subscribe(res => {
              this.toolsPrvd.showLoader();
              this.isUndercover=true;

              this.settings.isNewlineScope=false;
              this.chatPrvd.currentLobbyMessage=res.messages;
              this.chatPrvd.appendContainer.hidden = true;
              this.cameraPrvd.takenPictures = [];
              this.setMainBtnStateRelativeToEvents();
              this.placeholderText = 'What would you like to say?';

              this.chatPrvd.openLobbyForPinned(res.messages).then(() => {
                  if(this.chatPrvd.currentLobby.isAddButtonAvailable){
                      this.placeholderText = 'What do you want to talk about?';
                  }else{
                      this.placeholderText = 'What would you like to say?';
                  }

                  this.chatPrvd.toggleLobbyChatMode();
                  this.chatPrvd.isMainBtnDisabled = false;
                  this.chatPrvd.isLobbyChat=true;
                  this.chatPrvd.areaLobby=false;
                  this.initLpMap();
                  this.chatPrvd.setState('undercover');
                  this.undercoverPrvd.setUndercover(true);
                  this.toolsPrvd.hideLoader();
              }, err => {
                  console.error(err);
                  this.placeholderText = 'What do you want to talk about?';
                  this.chatPrvd.isMainBtnDisabled = false;
                  this.startMessageUpdateTimer();
                  this.chatPrvd.allowUndercoverUpdate = true;
                  this.toolsPrvd.hideLoader();
              });
          }, err => {
              console.error(err);
              this.toolsPrvd.hideLoader();
          });
      }
  }

    public openConversationMessage(message:any):void {
        if (!this.chatPrvd.isLobbyChat && !this.chatPrvd.areaLobby) {
            this.chatPrvd.getParentLobby(message).subscribe(res => {
                this.openConversationLobbyForPinned(res.messages);
            });
        }
    }

    public openConversationLobbyForPinned(message:any):void {
        let cont2 = this.getTopSlider('address');
        cont2.setState('slideUp');
        cont2.hide();

        if(!this.chatPrvd.isLobbyChat && !this.chatPrvd.areaLobby){
              this.toolsPrvd.showLoader();
              if(this.chatPrvd.getState() == 'undercover'){
                 this.pageNav=true;
              }else  if(this.chatPrvd.getState() == 'area'){
                 this.pageNav=false;
              }

              if(this.chatPrvd.bgState.getState() == 'stretched') {
                 this.toggleChatOptions();
              }

              this.chatPrvd.postMessages = [];

              this.chatPrvd.isMainBtnDisabled = true;
              this.chatPrvd.setState('area');
              this.isUndercover=true;
              this.chatPrvd.areaLobby=true;
              this.settings.isNewlineScope=false;
              this.chatPrvd.currentLobbyMessage=message;
              this.chatPrvd.appendContainer.hidden = true;
              this.cameraPrvd.takenPictures = [];
              this.setMainBtnStateRelativeToEvents();
              this.placeholderText = 'What would you like to say?';

              this.chatPrvd.openLobbyForPinned(message).then(() => {
                  if(this.chatPrvd.currentLobby.isAddButtonAvailable){
                      this.placeholderText = 'What do you want to talk about?';
                  }else{
                      this.placeholderText = 'What would you like to say?';
                  }

                  this.chatPrvd.toggleLobbyChatMode();
                  this.initLpMap();
                  this.chatPrvd.isMainBtnDisabled = false;
                  this.chatPrvd.areaLobby=true;
                  this.toolsPrvd.hideLoader();
              }, err => {
                  this.chatPrvd.areaLobby=true;
                  this.placeholderText = 'What do you want to talk about?';
                  this.chatPrvd.isMainBtnDisabled = false;
                  this.startMessageUpdateTimer();
                  this.chatPrvd.allowUndercoverUpdate = true;
                  this.toolsPrvd.hideLoader();
              });
        }
  }

    public openConversationLobbyForPinnedFormMessage(message:any):void {
        if(!this.chatPrvd.isLobbyChat && !this.chatPrvd.areaLobby){
              if(this.chatPrvd.getState() == 'undercover'){
                 this.pageNav=true;
              }else  if(this.chatPrvd.getState() == 'area'){
                 this.pageNav=false;
              }

              if(this.chatPrvd.bgState.getState() == 'stretched') {
                 this.toggleChatOptions();
              }

              this.chatPrvd.postMessages = [];

              this.chatPrvd.isMainBtnDisabled = true;
              this.chatPrvd.setState('area');
              this.isUndercover=true;
              this.chatPrvd.areaLobby=true;
              this.settings.isNewlineScope=false;
              this.chatPrvd.currentLobbyMessage=message;
              this.chatPrvd.appendContainer.hidden = true;
              this.cameraPrvd.takenPictures = [];
              this.setMainBtnStateRelativeToEvents();
              this.placeholderText = 'What would you like to say?';

              this.chatPrvd.openLobbyForPinned(message).then(() => {
                  if(this.chatPrvd.currentLobby.isAddButtonAvailable){
                      this.placeholderText = 'What do you want to talk about?';
                  }else{
                      this.placeholderText = 'What would you like to say?';
                  }
                  this.chatPrvd.toggleLobbyChatMode();
                  this.initLpMap();
                  this.chatPrvd.isMainBtnDisabled = false;
                  this.chatPrvd.areaLobby=true;
                  this.toolsPrvd.hideLoader();
              }, err => {
                  this.chatPrvd.areaLobby=true;
                  this.placeholderText = 'What do you want to talk about?';
                  this.chatPrvd.isMainBtnDisabled = false;
                  this.startMessageUpdateTimer();
                  this.chatPrvd.allowUndercoverUpdate = true;
                  this.toolsPrvd.hideLoader();
              });
        }
  }

  public handleMainBtnClick(event:any):void {
      this.chatPrvd.isMainBtnDisabled = true;
      if (this.chatPrvd.bgState.getState() == 'stretched') {
          this.toggleChatOptions();
      }
      let cont = this.getTopSlider('unlock');
      cont.setState('slideUp');
      cont.hide();

      let cont0 = this.getTopSlider('address');
      cont0.setState('slideUp');
      cont0.hide();
		// console.log('[isLobbyChat] '+this.chatPrvd.isLobbyChat);
		// console.log('[areaLobby] '+this.chatPrvd.areaLobby);
      if (this.chatPrvd.isLobbyChat && !this.chatPrvd.areaLobby) {
          this.chatPrvd.areaLobby=false;
          this.chatPrvd.isCleared = true;
          this.canRefresh = true;
          this.toolsPrvd.showLoader();
		  if(this.txtIn != undefined){ 
			this.txtIn.value = '';
		  }
          this.chatPrvd.appendContainer.hidden = true;
          this.cameraPrvd.takenPictures = [];
          this.chatPrvd.postMessages = [];
          this.placeholderText = 'What do you want to talk about?';
          this.setMainBtnStateRelativeToEvents();

          if(this.pageNavLobby){
              this.chatPrvd.setState('undercover');
              this.undercoverPrvd.setUndercover(true);
              this.isUndercover=true;
          }else{
              this.chatPrvd.setState('area');
              this.undercoverPrvd.setUndercover(false);
              this.isUndercover=false;
          }
          this.refreshChat(false, true).then(res => {
              this.chatPrvd.allowUndercoverUpdate = true;
              this.startMessageUpdateTimer();
              this.chatPrvd.toggleLobbyChatMode();
              this.chatPrvd.isMainBtnDisabled = false;
              this.initLpMap();
              this.toolsPrvd.hideLoader();
          }, err => {
              this.chatPrvd.isMainBtnDisabled = false;
              this.toolsPrvd.hideLoader();
              console.error(err);
          });
      } else {
          if(this.chatPrvd.areaLobby){
              this.chatPrvd.areaLobby=false;
              this.chatPrvd.toggleLobbyChatMode();
              if(this.pageNav){
                  this.setPostTimer(0);
                  this.chatPrvd.postMessages=[];
                  this.chatPrvd.setState('undercover');
                  this.undercoverPrvd.setUndercover(true);
                  this.isUndercover=true;
                  this.chatPrvd.alreadyScolledToBottom = false;
                  this.runUndecoverSlider(this.pageTag);
                  this.startMessageUpdateTimer();
                  this.flipInput();
                  this.changePlaceholderText();

                  this.messagesInterval = true;
                  setTimeout(() => {
                      this.content.resize();
                  }, 1);
                  setTimeout(() => {
                      this.toolsPrvd.hideLoader();
                  }, 1000);
              }else{
                  this.chatPrvd.setState('area');
                  this.undercoverPrvd.setUndercover(false);
                  this.isUndercover=false;
                  this.setPostTimer(3);
                  this.placeholderText = 'Start a local conversation...';
                  this.chatPrvd.postMessages=[];
                  this.getAndUpdateUndercoverMessages();
                  this.getUsers().then(res => {});
              }
          }else{
			  this.chatPrvd.areaLobby=false;
              this.goUndercover(event);
          }
      }
  }

  private onEnter():void {
    console.log('%c [CHAT] ionViewDidEnter ', 'background: #1287a8;color: #ffffff');

    this.toolsPrvd.showLoader();

    if(!this.chatPrvd.isLobbyChat){
        this.chatPrvd.isMainBtnDisabled=true;
    }

    this.chatPrvd.isMessagesVisible = false;
    this.chatPrvd.loadedImages = 0;
    this.chatPrvd.imagesToLoad = 0;

    this.mainInput.setState('fadeIn');
    this.mainInput.show();
    this.chatPrvd.mainBtn.setState('normal');
    this.chatPrvd.mainBtn.show();

    this.pageTag = this.elRef.nativeElement.tagName.toLowerCase();

    this.runUndecoverSlider(this.pageTag);

    this.events.subscribe('image:pushed', res => {
      this.setDefaultTimer();
    });

    this.events.subscribe('message:received', res => {
      console.log('message:received res:', res);
      if (res.messageReceived && this.chatPrvd.isCleared) {
        this.chatPrvd.postMessages = [];
        this.refreshChat();
      }
      if (res.runVideoService) {
        this.videoservice.posterAllVideos(<HTMLElement>document.querySelector(this.pageTag));
      }
    }, err => console.error(err));

    // init sockets
    this.chatPrvd.socketsInit();
    this.initResponseFromGPS();
    this.setContentPadding(false);

    if (this.chatPrvd.getState() == 'area') {
      this.getUsers().then(res => {
        this.gpsPrvd.getNetwrk(this.chatPrvd.localStorage.get('chat_zip_code'))
        .subscribe(res => {
          console.log('getNetwork res:', res);
          if (res.network) {
            this.chatPrvd.saveNetwork(res.network);
            this.updateMessages();
          }
        }, err => console.error(err));
      }, err => console.error(err));
    } else if (this.chatPrvd.getState() == 'undercover'){
        this.initLpMap();
        this.messageParam = this.navParams.get('message');
        if (this.messageParam) {
            this.openLobbyForPinned(this.messageParam);
        }else{
            this.messagesInterval = true;
            this.startMessageUpdateTimer();
        }
    }

    this.zone.run(() => {
      this.undercoverPrvd.profileType = this.undercoverPrvd.profileType;
    });

    setTimeout(() => {
      this.chatPrvd.updateAppendContainer();
    }, 1);

    this.user = this.authPrvd.getAuthData();

  }

  public followNearByNetwork(message,index) {
	  message.is_followed=!message.is_followed;
	  this.chatPrvd.followUserToLine(message.id).subscribe(res => {}, err => {});
	  // this.chatPrvd.updateSyncMessage(message);
  }

  ionViewDidEnter() {
	this.onEnter();
    if (this.chatPrvd.bgState.getState() == 'stretched') {
       this.toggleChatOptions();
    }
    this.toolsPrvd.hideLoader();
	
  }

  public viewLocation(params?:any):void {
    console.log('view location...');
      this.toolsPrvd.pushPage(MapsModal, {
        place: this.nearestPlace,
        display_routes: (params && params.routes) ? params.routes : false
      });
  }


  public listenForScrollEnd(event):void {
    this.zone.run(() => {
      console.log('scroll end...');
      this.videoservice
      .toggleVideoPlay(<HTMLElement>document.querySelector(this.pageTag));
    });
  }

  ngDoCheck() {
    if (this.chatPrvd.postMessages != this.chatPrvd.oldMessages) {
      this.chatPrvd.oldMessages = this.chatPrvd.postMessages;
      setTimeout(() => {
        this.videoservice.posterAllVideos(
          <HTMLElement>document.querySelector(this.pageTag)
        );
      }, 1000);
    }
  }

  ionViewDidLoad() {
    console.log('%c [CHAT] ionViewDidLoad ', 'background: #1287a8;color: #ffffff');
    if (this.chatPrvd.localStorage.get('enable_uc_camera') === null) {
      this.chatPrvd.localStorage.set('enable_uc_camera', true);
    }
    this.chatPrvd.messageDateTimer.enableLogMessages = true;
    this.generateEmoticons();
    let socialArray = ['fb', 'twitter', 'instagram'];
    this.authPrvd.getSocialStatus().subscribe(res => {
      console.log('get social status:',res);
      // Go through all social networks and toggle their switch if active
      for (let i = 0; i < socialArray.length; i++) {
        if (res[socialArray[i]]) {
          this.socialPrvd.connect[socialArray[i]] = res[socialArray[i]];
        }
      }
    }, err => console.error(err));
	
  }

  ionViewWillLeave() {
    console.log('%c [CHAT] ionViewWillLeave ', 'background: #1287a8;color: #ffffff');
    this.navParams.data = {};
    this.componentLoaded = false;
    this.chatPrvd.closeSockets();                                               // unsubscribe from sockets events
    if (this.global) this.global();                                             // stop click event listener
    this.toggleContainer(this.emojiContainer, 'hide');                          // hide emojiContainer
    this.toggleContainer(this.shareContainer, 'hide');                          // hide shareContainer
    this.chatPrvd.messageDateTimer.stop();                                      // stop date timer for messages
    clearInterval(this.chatPrvd.scrollTimer.interval);                          // stop scroll to bottom interval
    this.messagesInterval = false;                                              // clear message update bool
    clearTimeout(this.messIntObject);                                           // clear message update interval
    this.slideAvatarPrvd.changeCallback = null;                                 // stop slider func.
  }
  
  public loadMaps() {
	  this.scrollTop = 0;
	  this.coachMarkText = "Start your network here?";
      this.search = true;
      this.initializeMap();
      this.initAutocomplete();    
  }

  private initializeMap() {
    this.zone.run(() => { 
		var mapStyle = [
		  {
			  "featureType": "all",
			  "stylers": [
				  {
					  "saturation": 0
				  },
				  {
					  "hue": "#e7ecf0"
				  }
			  ]
		  },
		  {
			  "featureType": "road",
			  "stylers": [
				  {
					  "saturation": -70
				  }
			  ]
		  },
		  {
			  "featureType": "transit",
			  "stylers": [
				  {
					  "visibility": "off"
				  }
			  ]
		  },
		  {
			  "featureType": "poi",
			  "stylers": [
				  {
					  "visibility": "off"
				  }
			  ]
		  },
		  {
			  "featureType": "water",
			  "stylers": [
				  {
					  "visibility": "simplified"
				  },
				  {
					  "saturation": -60
				  }
			  ]
		  }
		];
		this.gapi.init.then((google_maps:any) => {
			this.map = new google_maps.Map(this.mapElement.nativeElement, {
				zoom: 14,
				center: this.gpsPrvd.coords, 
				mapTypeId: google_maps.MapTypeId.ROADMAP,
				styles: mapStyle,
				disableDoubleClickZoom: false,
				disableDefaultUI: true,
				fullscreenControl: false				
			});
	  
		});

    });
  }
  
  private initAutocomplete(): void {	 
    this.addressElement = this.searchbar.nativeElement.querySelector('.searchbar-input');
	this.searchModel = "";
    
	this.createAutocomplete(this.addressElement).subscribe((place) => {
		
	let zipcode = this.gpsPrvd.parseGoogleAddress(place);
		
      let loc = {
		  lat: place.geometry.location.lat(),
		  lng: place.geometry.location.lng(),
		  place_name: place.vicinity,
		  zipcode: zipcode
	  }
	  
	  
	  let data = {
		  lat: place.geometry.location.lat(),
		  lng: place.geometry.location.lng()
	  }
	  
	  var mapStyle = [
					  {
						  "featureType": "all",
						  "stylers": [
							  {
								  "saturation": 0
							  },
							  {
								  "hue": "#e7ecf0"
							  }
						  ]
					  },
					  {
						  "featureType": "road",
						  "stylers": [
							  {
								  "saturation": -70
							  }
						  ]
					  },
					  {
						  "featureType": "transit",
						  "stylers": [
							  {
								  "visibility": "off"
							  }
						  ]
					  },
					  {
						  "featureType": "poi",
						  "stylers": [
							  {
								  "visibility": "off"
							  }
						  ]
					  },
					  {
						  "featureType": "water",
						  "stylers": [
							  {
								  "visibility": "simplified"
							  },
							  {
								  "saturation": -60
							  }
						  ]
					  }
					];
	  
	  this.gapi.init.then((google_maps: any) => {
		this.map = new google.maps.Map(this.mapElement.nativeElement, {
			   zoom : 20,
			   center: data,
			   styles:mapStyle,
			   disableDefaultUI: true,
			   fullscreenControl: false			   
			});		
	  });

      this.toggleTopSlider('address');	
  	  this.setCustomAddressOnMap(loc);	  
	  this.search = false;
    });
  }  
  
  private createAutocomplete(addressEl: HTMLInputElement): Observable<any> {
	const autocomplete = new google.maps.places.Autocomplete(addressEl);
    autocomplete.bindTo('bounds', this.map);
    return new Observable((sub: any) => {
      google.maps.event.addListener(autocomplete, 'place_changed', () => {
        const place = autocomplete.getPlace();
        sub.next(place);
      });
    });
  }
  
  private setCustomAddressOnMap(addressDetails:any){	 
    let addressLat = addressDetails.lat;
	let addressLng = addressDetails.lng;
	let data:any = {
		lat: addressLat,
		lng: addressLng
	};	
	try {	
		this.clearMarkers();
		this.toolsPrvd.showLoader();	
		
		this.gpsPrvd.coords = data;
		this.gpsPrvd.place_name = addressDetails.place_name;
		this.storage.set('custom_coordinates', data);
		this.storage.set('place_name', addressDetails.place_name);
	
		let service = new google.maps.places.PlacesService(this.map);
		
		let details:any = {
			lat: addressLat,
			lng: addressLng,
			zipCode: addressDetails.zipcode
		};	 
		
		this.chatPrvd.getCustomAreaNetworks(details).subscribe(res => {
			let icon :any;					
			let marker:any = [];
				
			if(res.messages.length){ 
				this.coachMarkText = res.messages.length + " networks are now visible.";
				let results = res.messages;
				
				for (var i = 0; i < results.length; i++) {
					let resLat = parseFloat(results[i].lat);
					let resLng = parseFloat(results[i].lng);
					let placeName = results[i].place_name;
					icon =  {
					   url:'assets/icon/wi-fi.png'
					};
					if(resLat == addressLat && resLng == addressLng){
						icon = {
							url:'assets/icon/marker.png',
							scaledSize: new google.maps.Size(35, 40)
						};
					}
					
					let networkData:any = {
						lat: resLat,
						lng: resLng
					};					
					let networkPosition = new google.maps.LatLng(networkData);
					marker = new google.maps.Marker({							
					   map: this.map,
					   position: networkPosition,
					   icon: icon
					});
					
					let self = this;
					let zipcode = results[i].post_code;
					marker.addListener('click', function(marker){
						let loc:any = {
							lat: resLat,
							lng: resLng,
							place_name: placeName,
							zipcode: zipcode
						};	
						self.setCustomAddressOnMap(loc);						
					});	
					
					this.mapMarkers.push(marker);						
				}
				
				icon = {
					url:'assets/icon/marker.png',
					scaledSize: new google.maps.Size(35, 40)
				};
				let customPosition = new google.maps.LatLng(data);
				marker = new google.maps.Marker({							
				   map: this.map,
				   title:addressDetails.place_name,
				   position: customPosition,
				   icon: icon
				});
				
				let infoWindow = new google.maps.InfoWindow({
				  content:addressDetails.place_name
				})
				infoWindow.open(this.map, marker);
				
				this.mapMarkers.push(marker); 
				
				this.addMarker();	
				this.map.setCenter(data);
				this.map.zoom = 12;
				this.toolsPrvd.hideLoader();
			}else{
				this.coachMarkText = "0 networks are now visible.";
				icon = {
					url:'assets/icon/marker.png',
					scaledSize: new google.maps.Size(35, 40)
				};
				let customPosition = new google.maps.LatLng(data);
				marker = new google.maps.Marker({							
				   map: this.map,
				   title:addressDetails.place_name,
				   position: customPosition,
				   icon: icon
				});
				
				let infoWindow = new google.maps.InfoWindow({
				  content:addressDetails.place_name
				})
				infoWindow.open(this.map, marker);
				
				this.mapMarkers.push(marker); 
				
				this.map.setCenter(data);
				this.map.zoom = 12;
				this.toolsPrvd.hideLoader();
			}			
		}, err => {			
			console.log('==========err========');
			console.error(err);
			this.toolsPrvd.hideLoader();
		});
		

	}catch (err) {		
		this.toolsPrvd.hideLoader();
		this.customAddressReset()
	}	  
  }
  
  public updateGoodStuff(flag:string){
	  switch(flag){
		case 'goodStuff':
			this.storage.set('show-good-stuff', false);
			break;		
		case 'pinnedStuff':
			this.storage.set('show-pinned-stuff', false);
			break;		
	  }
  }
  
  private getGoodStuff(flag:string){	
	  let popupDetails: any = [];
	  switch(flag){
		case 'goodStuff':
			let goodStuffFlag = this.storage.get('show-good-stuff');
			if(goodStuffFlag == true || goodStuffFlag == null){
				popupDetails.goodStuffPopupHtml = '<div class="center good-stuff-content">'+
					'<div class="label-18"><strong>Good stuff adds to your day.</strong></div>'+
					'<div class="label-16">It\'s what localnet is all about!</div>'+
					'<div class="label-18 normal-text">Tap <img class="ic popup-icon" src="assets/icon/lobby-icon.svg" > to try it</div>'+
					'</div>';
				popupDetails.cssClass = 'good-stuff';
				popupDetails.buttonText = 'Try it!';
				popupDetails.buttonCssClass = 'try-span';	
				popupDetails.buttonHandler = () => this.updateGoodStuff('goodStuff');
				this.showStuffPopup(popupDetails);				
			}
			break;		 
		case 'pinnedStuff':
			let pinnedStuffFlag = this.storage.get('show-pinned-stuff');
			if(pinnedStuffFlag == true || pinnedStuffFlag == null){
				popupDetails.goodStuffPopupHtml = '<div class="center good-stuff-content">'+					
					'<div class="label-18"><strong>The local media get to pin the best stuff.</strong></div>'+
					'<div class="label-18 normal-text">Hold <img class="ic popup-icon" src="assets/icon/lobby-icon.svg" > and select <img class="ic popup-icon" src="assets/images/sun_icon.png" > to try it</div>'+
					'</div>';
				popupDetails.cssClass = 'good-stuff';
				popupDetails.buttonText = 'Skip';
				popupDetails.buttonCssClass = 'try-span';	
				popupDetails.buttonHandler = () => {};
				this.updateGoodStuff('pinnedStuff');
				this.showStuffPopup(popupDetails);				
			}
			break;		
	  }
	  
	  
  }
  
  public showStuffPopup(popupDetails:any){	  
	  let alert = this.alertCtrl.create({
            subTitle: popupDetails.goodStuffPopupHtml,
			cssClass: popupDetails.cssClass,
            buttons: [ {
                cssClass: popupDetails.buttonCssClass ,
                text: popupDetails.buttonText,
                handler:() => {
                    alert.dismiss();
					popupDetails.buttonHandler();
                    return false; 
                }
            }]
        });
        alert.present();
  }
  
  public processOnScroll(event){	 
	// this.content.ionScroll.subscribe((event)=>{
		this.scrollTop = this.content.scrollTop;
		if(this.scrollTop == 0){
			this.normalizeMainBtn(event,null);
		}else{
			this.minimizeMainBtn(event);
		}	
	// });			
  }

  public normalizeMainBtn(event,callback:any){
	if(this.chatPrvd.mainBtn.getState() == 'minimised'){
		this.chatPrvd.mainBtn.setState('normal'); 	
		let netwrkBtnEle = <HTMLElement>document.querySelector(this.pageTag + ' .netwrk-button');
		if(netwrkBtnEle != null){
			netwrkBtnEle.style.removeProperty('bottom');	
		}
		this.hideTextContainer = false;		
	}else{
		if(this.scrollTop > 0){
			this.content.scrollTo(0,0);
		}
		if(callback){
			if(callback == "openLinePage"){
				this.openLinePage();
			}else if(callback == "handleMainBtnClick"){
				this.handleMainBtnClick(event)
			}			
		}
	}	
  }
  
  public minimizeMainBtn(event){
    this.chatPrvd.mainBtn.setState('minimised');
	let netwrkBtnEle = <HTMLElement>document.querySelector(this.pageTag + ' .netwrk-button');
	if(netwrkBtnEle != null){
		netwrkBtnEle.style.bottom = 80+'%';
	}
	this.hideTextContainer = true;
  }
	
}
