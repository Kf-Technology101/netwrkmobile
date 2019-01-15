import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavParams, ViewController, NavController} from 'ionic-angular';
import { GoogleMapsService } from 'google-maps-angular2';

//Providers...
import { Places } from '../../providers/places';
import { Gps } from '../../providers/gps';

@Component({
  selector: 'modal-maps',
  templateUrl: 'maps.html'
})
export class MapsModal {
  private map:any;
  private place:any;

  public directionsService:any;
  public directionsDisplay:any;

  @ViewChild('mapElement') mapElement: ElementRef;
  @ViewChild('inputElement') inputElement: ElementRef;

  constructor(
    public viewCtrl: ViewController,
    private gapi: GoogleMapsService,
    private params: NavParams,
    private places: Places,
    private gpsPrvd: Gps,
    private navCtrl: NavController
  ) {
    this.place = params.get('place');
  }

  private closeModal():any {
    this.navCtrl.pop();
    this.places.displayNearRoutes=true;
  }

  ngAfterViewInit() {
    this.gapi.init.then((google_maps: any) => {

        let loc = new google_maps.LatLng(20.0074, 73.7674);

        this.directionsService = new google_maps.DirectionsService;
        this.directionsDisplay = new google_maps.DirectionsRenderer;

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
            zoom: 16,
            center: loc,
            styles:mapStyle,
            disableDefaultUI: true,
            fullscreenControl: false
        });

        this.directionsDisplay.setMap(this.map);

        let infowindow = new google_maps.InfoWindow();

        this.directionsService.route({
            origin: loc,
            destination: this.place.location,
            optimizeWaypoints: true,
            travelMode: 'WALKING'
        }, (response, status) => {
            if (status === 'OK')
                this.directionsDisplay.setDirections(response);
        });


      let icon = {
          url: 'assets/icon/wi-fi.png'
      };

      let marker = new google_maps.Marker({
        map: this.map,
        position: loc,
        icon: icon
      });

      google_maps.event.addListener(marker, 'click', () => {
        infowindow.setContent(this.place.name);
        infowindow.open(this.map, this);
      });

      this.map.setCenter(loc);
    });
  }
}
