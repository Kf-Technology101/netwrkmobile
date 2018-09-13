import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavParams, ViewController, NavController} from 'ionic-angular';
import { GoogleMapsService } from 'google-maps-angular2';

@Component({
  selector: 'modal-maps',
  templateUrl: 'maps.html'
})
export class MapsModal {
  private map:any;
  private place:any;

  @ViewChild('mapElement') mapElement: ElementRef;
  @ViewChild('inputElement') inputElement: ElementRef;

  constructor(
    public viewCtrl: ViewController,
    private gapi: GoogleMapsService,
    private params: NavParams,
    private navCtrl: NavController
  ) {
    this.place = params.get('place');
  }

  private closeModal():any {
    this.navCtrl.pop();
  }

  ngAfterViewInit() {
    this.gapi.init.then((google_maps: any) => {
      let loc = new google_maps.LatLng(20.0074, 73.7674);
      // let _this = this;
      this.map = new google_maps.Map(this.mapElement.nativeElement, {
        zoom: 16,
        center: loc,
        scrollwheel: false,
        panControl: false,
        mapTypeControl: false,
        zoomControl: true,
        streetViewControl: true,
        scaleControl: true,
        zoomControlOptions: {
          style: google_maps.ZoomControlStyle.LARGE,
          position: google_maps.ControlPosition.RIGHT_BOTTOM
        }
      });

      console.log('maps:', google_maps);
      let infowindow = new google_maps.InfoWindow();

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          let marker = new google_maps.Marker({
            map: this.map,
            position: loc,
            icon: 'assets/icon/user_marker.png'
          });
        });
      }



      let icon = {
          url: 'assets/icon/wi-fi.png'
      };

      let marker = new google_maps.Marker({
        map: this.map,
        position: this.place.location,
        icon: icon
      });

      google_maps.event.addListener(marker, 'click', () => {
        infowindow.setContent(this.place.name);
        infowindow.open(this.map, this);
      });

      this.map.setCenter(this.place.location);

    });
  }

}
