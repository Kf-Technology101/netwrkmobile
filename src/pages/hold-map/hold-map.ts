import {
  Component,
  ViewChild,
  NgZone,
  HostBinding,
  ElementRef,
  Renderer, 
  Input,
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
import { Geolocation } from '@ionic-native/geolocation';
import { Keyboard } from '@ionic-native/keyboard';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder';
import { InAppBrowser } from '@ionic-native/in-app-browser'; 

// Pages
import { NetwrklistPage } from '../netwrklist/netwrklist';

// Custom libs
import { Toggleable } from '../../includes/toggleable';

// Providers
import { Tools } from '../../providers/tools';
import { Gps } from '../../providers/gps';
import { Places } from '../../providers/places';
import { LocationChange } from '../../providers/locationchange';
import { LocalStorage } from '../../providers/local-storage';
import { Chat } from '../../providers/chat';

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
  selector: 'page-hold-map',
  templateUrl: 'hold-map.html',
})

export class HoldMapPage {
  @HostBinding('class') colorClass = 'transparent-background';

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
  
  @ViewChild(Content) content: Content;
  @ViewChild('textInput') txtIn;
  @ViewChild('mapElement') mapElement: ElementRef;
  @ViewChild('searchbar', { read: ElementRef }) searchbar: ElementRef;  

  shareContainer = new Toggleable('off', true);
  emojiContainer = new Toggleable('off', true);
  toggContainers: any = [
    this.emojiContainer,
    this.shareContainer
  ];
  emoticX = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C'];
  emoticY = ['1F60', '1F61', '1F62', '1F63', '1F64'];
  emojis = [];
  
  public searchModel: any;
  public mapMarkers: any = [];
  public placedMarkersArr: any = [];
  public markerLatLng: any = [];
  public geocoded : boolean;
  private global:any = null;
  private nearestPlace:any = null;
  private addressElement:any;
  public flgEditPost : boolean;
  public search : boolean;
  public locDetails : any;
  public mapStyle = [
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



  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public zone: NgZone,
    public storage: LocalStorage,
    public toolsPrvd: Tools,
    public geolocation: Geolocation,
    public gapi: GoogleMapsService,
    public gpsPrvd: Gps,
    public plt: Platform,
    public elRef: ElementRef,
    public modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private keyboard: Keyboard,
    private renderer: Renderer,
    public locationchange: LocationChange,
    public config: Config,
    public events: Events,
    public places: Places,
    public app: App,
    public nativeGeocoder   : NativeGeocoder,
    public iab: InAppBrowser,
	private chatPrvd: Chat,
  ){
	plt.ready().then(() => {
		this.initMap(); 
		this.initAutocomplete();
			
		/* this.gpsPrvd.getMyZipCode().then(zip => {
			this.initMap();  
		},err=>{
			if(err.PERMISSION_DENIED == 1 || err.PositionError.code == 1){
				// this.goToHoldPage(false);
				this.gpsPrvd.locationAccessPermission = false;
				// this.toolsPrvd.showToast('We require your current location. Please share your location.');
			}else{
				this.toolsPrvd.showToast('Something went wrong. Please try later.');
			}
			this.initMap(); 
			this.initAutocomplete();			
		}); */
	});  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HoldMapPage');
  }


  private initMap():void {
	this.gapi.init.then((google_maps: any) => {
		let loc: any = {
			lat: parseFloat(this.gpsPrvd.coords.lat),
			lng: parseFloat(this.gpsPrvd.coords.lng)
		};
		this.coords = loc;
		this.map = new google_maps.Map(this.mapElement.nativeElement, {
			zoom: 15,
			center: loc,
			styles:this.mapStyle,
			disableDefaultUI: true,
			fullscreenControl: false
		});
		
		if(this.storage.get('last_hold_location_details') && this.storage.get('last_hold_location_details') != '' && this.storage.get('last_hold_location_details') != 'undefined'){
			let place_name = this.storage.get('last_hold_location_details');
			let data = {
				lat: parseFloat(place_name.loc.lat),
				lng: parseFloat(place_name.loc.lng)
			};
			this.map.setCenter(new google.maps.LatLng(data.lat, data.lng));
		}else{
			if(this.gpsPrvd.coords.lat!=null && this.gpsPrvd.coords.lng!=null){
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

				this.map.setCenter(new google.maps.LatLng(loc.lat, loc.lng));
			}else{
				this.getAndUpdateUndercoverMessages();
			}
		}
		this.initAutocomplete();
		
	});
	setTimeout(function() { google.maps.event.trigger(this.map, 'resize') }, 600);	
  }
  
  private getAndUpdateUndercoverMessages() {
		this.chatPrvd.postMessages = [];
	    this.chatPrvd.getMessages(false, this.chatPrvd.postMessages).subscribe(res => {
			if (res) {
				if (res.messages && res.messages.length > 0) {
					if(this.chatPrvd.postMessages.length > 1){
						for (let i in this.chatPrvd.postMessages) {
							for (let j in res.messages) {
							  if (this.chatPrvd.postMessages[i].id == res.messages[j].id) {
								this.chatPrvd.postMessages.splice(i, 1);
							  }
							}
						}
					}
					this.chatPrvd.postMessages = this.chatPrvd.postMessages.concat(res.messages);
				}				
				for (var i = 0; i < this.chatPrvd.postMessages.length; i++) {
					let markerIcon = {
						 url: '',
						 scaledSize: new google.maps.Size(35, 40),
						 origin: new google.maps.Point(0, 0),
						 anchor: new google.maps.Point(0, 0)
					};
					let marker = {
						map: this.map,
						position: new google.maps.LatLng(this.chatPrvd.postMessages[i].lat, this.chatPrvd.postMessages[i].lng),
						icon: markerIcon,								
						id: i,
						message: this.chatPrvd.postMessages[i],
						title: ''
					}; 
					
					if(this.chatPrvd.postMessages[i].messageable_type == "Network"){
						this.mapMarkers.push(marker);
					}
					
				}
			this.addMarker();
            }              
		}, err => {
			this.toolsPrvd.hideLoader();
		});
     
  }
  
  private initAutocomplete(): void {
	this.addressElement = this.searchbar.nativeElement.querySelector('.searchbar-input');
	this.searchModel = "";
    this.createAutocomplete(this.addressElement).subscribe((place) => {
	  this.search = false;
	  let data = {
		  lat: place.geometry.location.lat(),
		  lng: place.geometry.location.lng()
	  }
	  this.storage.set('custom_coordinates', data);
	  this.gpsPrvd.customAddress = true;

	  this.gpsPrvd.coords = data;
	  this.gpsPrvd.getZipCode().then(zip => {
		this.gpsPrvd.customAddress = false;
		let zipcode = zip;
		let loc = {
		  lat: place.geometry.location.lat(),
		  lng: place.geometry.location.lng(),
		  place_name: place.name,
		  zipcode: zipcode
		}
		
		this.gapi.init.then((google_maps: any) => {
			this.map = new google.maps.Map(this.mapElement.nativeElement, {
			   zoom : 15,
			   center: data,
			   styles:this.mapStyle,
			   disableDefaultUI: true,
			   fullscreenControl: false			   
			});		
		});

		this.setCustomAddressOnMap(loc);
	  });	
		
	  
	  /*this.gpsPrvd.getZipCode().then(zip => {
		this.gpsPrvd.customAddress = false;
		let zipcode = zip;
		let loc = {
		  lat: place.geometry.location.lat(),
		  lng: place.geometry.location.lng(),
		  place_name: place.name,
		  zipcode: zipcode
		}
		
		this.gapi.init.then((google_maps: any) => {
			this.map = new google.maps.Map(this.mapElement.nativeElement, {
			   zoom : 15,
			   center: data,
			   styles:this.mapStyle,
			   disableDefaultUI: true,
			   fullscreenControl: false			   
			});		
		});

		this.setCustomAddressOnMap(loc);			
	  },err => {
		console.log('err::: ',err);  
	  });
	  */
	  
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
  console.log('addressDetails:::',addressDetails);
    let addressLat = addressDetails.lat;
	let addressLng = addressDetails.lng;
	let data:any = {
		lat: parseFloat(addressLat),
		lng: parseFloat(addressLng) 
	};	
	try {	
		this.clearMarkers();
		this.mapMarkers = [];
		this.gpsPrvd.coords = data;
		this.gpsPrvd.place_name = addressDetails.place_name;
		this.storage.set('custom_coordinates', data);
		this.storage.set('chat_zip_code', addressDetails.zipcode);
		this.storage.set('place_name', addressDetails.place_name);
		this.locDetails = {
			loc: data,
			zipcode: addressDetails.zipcode,
			place_name: addressDetails.place_name
		};
		this.nearbyPlace(addressDetails);	
		this.toolsPrvd.hideLoader();
		this.map.setCenter(new google.maps.LatLng(data.lat, data.lng));
		//this.map.zoom = 15;		
	}catch (err) {		
		this.toolsPrvd.hideLoader();
	}	  
  }
  
  
  public addMarker():void {
	 this.markerLatLng = [];	
	 for (var j = 0; j < this.mapMarkers.length; j++) {
		let loc = this.mapMarkers[j].position;
		let data = {
					'id':j,
					'lat':loc.lat(),
					'lng':loc.lng(),
					'points':(this.mapMarkers[j].message)?this.mapMarkers[j].message.points:0, // To show line with maximum points only
					'lineCount': 1 // No of lines created or pushed for same location i.e lat lng
				   };
	
		if(this.markerLatLng.length > 0){
			let place: any;
			let placedLoc = this.markerLatLng.some(function(func,index){
				place = index; 
				return (func.lat == data.lat && func.lng == data.lng);
			});
			if(placedLoc){
				let noOfLineOnLoc = parseInt(this.markerLatLng[place].lineCount)+1;
				data.lineCount = noOfLineOnLoc;
				this.markerLatLng[place].lineCount = noOfLineOnLoc;	
				if(parseInt(this.markerLatLng[place].points) < parseInt(data.points)){
					this.markerLatLng.splice(place, 1);
					this.markerLatLng.push(data);			
				}
			}else{
				this.markerLatLng.push(data);
			}
		}else{
			this.markerLatLng.push(data);	
		}
		
	 } 
	 let bounds  = new google.maps.LatLngBounds();
	 for(var j = 0; j < this.markerLatLng.length; j++) {
		if(!this.mapMarkers[this.markerLatLng[j].id].placedMarker || this.mapMarkers[this.markerLatLng[j].id].placedMarker == undefined){
			 let newMarker = new google.maps.Marker(this.mapMarkers[this.markerLatLng[j].id]);
			 let infoWindow = new google.maps.InfoWindow({
				  content:this.mapMarkers[this.markerLatLng[j].id].title,
				  disableAutoPan: true,
				  pixelOffset: new google.maps.Size(10, 65)
				});
			 infoWindow.open(this.map, newMarker);

			 newMarker.infoWindow = infoWindow;
			 this.placedMarkersArr.push(newMarker);
			 this.mapMarkers[this.markerLatLng[j].id].placedMarker = true;
			 newMarker.setMap(this.map);
		}		
		let position = this.mapMarkers[this.markerLatLng[j].id].position;
		bounds.extend(new google.maps.LatLng(position.lat(), position.lng()));
	 }
	 
	 let self = this;
	 new google.maps.event.addListener(self.map, 'zoom_changed', function() {
		let zoomLevel = self.map.getZoom();
		for(var j = 0; j < self.placedMarkersArr.length; j++) {
			let marker = self.placedMarkersArr[j];
			if(zoomLevel <= 12){
				marker.infoWindow.close(self.map, marker);
			}else{
				marker.infoWindow.open(self.map, marker);
			} 
		}				
	 });
	this.map.fitBounds(bounds);       // auto-zoom
	this.map.panToBounds(bounds);     // auto-center
  }
  
  public clearMarkers():void {
	  console.log('clearMarkers');
	  for (var i = 0; i < this.placedMarkersArr.length; i++ ) {
          this.placedMarkersArr[i].setMap(null);
      }
      this.placedMarkersArr.length = 0;
	  this.placedMarkersArr = [];
	  this.mapMarkers = [];
  }
  
  public nearbyPlace(addressDetails:any){
	let addressLat = addressDetails.lat;
	let addressLng = addressDetails.lng;
	let loc:any = {
		lat: parseFloat(addressLat),
		lng: parseFloat(addressLng) 
	};
					
	let service = new google.maps.places.PlacesService(this.map);
	service.nearbySearch({ 
		location: loc,
		radius: 1000, // 1KM
		// types: [this.isType] 
	}, (results, status) => {
		this.callback(loc,results, status);
		this.setCustomLocation(addressDetails);
		this.addMarker();
	});  
  }
  
  callback(customLoc,results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
	  for (var i = 0; i < results.length; i++) {
		let resLat = parseFloat(results[i].geometry.location.lat());
		let resLng = parseFloat(results[i].geometry.location.lng());
		if(resLat != customLoc.lat && resLng != customLoc.lng){
			this.createMarker(results[i]);
		}
      }	 
    }
  }
  
  public setCustomLocation(addressDetails){
	let addressLat = addressDetails.lat;
	let addressLng = addressDetails.lng;
	let data:any = {
		lat: parseFloat(addressLat),
		lng: parseFloat(addressLng) 
	};
	  // Custom location ----------------------------
		let icon :any;					
		let marker:any = [];
		icon = {
			url:'assets/icon/marker.png',
			scaledSize: new google.maps.Size(35, 40)
		};
		let customPosition = new google.maps.LatLng(data);
		marker = {							
		   map: this.map,
		   title:addressDetails.place_name,
		   position: customPosition,
		   icon: icon
		};
		let self = this;
		google.maps.event.addListener(marker, 'click', () => {
			self.setCustomAddressOnMap(data);
		}); 
		this.mapMarkers.push(marker); 
	  // End - Custom location --------------------------	  
  }
  
  createMarker(place){
	let icon =  {
	   url:'assets/icon/wi-fi.png'
	};
	let marker = {								
			   map: this.map,
			   position: place.geometry.location,
			   icon: icon
			};
			
	let self = this;
	let zipcode = this.gpsPrvd.parseGoogleAddress(place);	
	google.maps.event.addListener(marker, 'click', () => {
		let placeName = place.name;
		placeName = (placeName.length > 50)?placeName.substr(0,50)+'...':placeName;
		let loc:any = {
			lat: place.geometry.location.lat(),
			lng: place.geometry.location.lng(),
			place_name: placeName,
			zipcode: zipcode
		};	 
		self.setCustomAddressOnMap(loc);
	}); 
	this.mapMarkers.push(marker);			
  }
  
  
  public goToHoldPage(setLoc:boolean = false){
	  if(setLoc){
		this.storage.set('last_hold_location_details',this.locDetails );
	  }
	  this.toolsPrvd.popPage();
  }
  
}
