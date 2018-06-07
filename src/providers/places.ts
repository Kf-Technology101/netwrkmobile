import { Injectable } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';
// Maps
import { GoogleMapsService } from 'google-maps-angular2';

@Injectable()
export class Places {
  public google_maps:any;
  public places:any;
  public currentLoc:any;

  public directionsService:any;
  public directionsDisplay:any;

  public nearest:any = {
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

  public displayRoutes:boolean = false;

  constructor(
    private gapi: GoogleMapsService
  ){}

  public initMapsService():Promise<any> {
    return new Promise (resolve => {
      this.gapi.init.then((google_maps: any) => {
        this.google_maps = google_maps;
        this.directionsService = new google_maps.DirectionsService;
        this.directionsDisplay = new google_maps.DirectionsRenderer;
        this.getCurrentLocation().then(res => {
          if (res.lat && res.lng) {
            this.currentLoc = res;
            resolve('ok');
          }
        }, err => console.error('Can\'t init MapsService. err:', err));
      });
    });
  }

  public getCurrentLocation():Promise<any> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        });
      } else reject();
    });
  }

  private calculateAndDisplayRoute(origin:any, destination:any):void {
    this.directionsService.route({
      origin: origin,
      destination: destination,
      optimizeWaypoints: true,
      travelMode: 'WALKING'
    }, (response, status) => {
      if (status === 'OK')
        this.directionsDisplay.setDirections(response);
    });
  }

  private getDistanceFromLatLng(l1:any, l2:any):any {
    let R = 6371; // Radius of the earth in km
    let dLat = this.deg2rad(l2.lat- l1.lat);  // deg2rad below
    let dLng = this.deg2rad(l2.lng - l1.lng);
    let a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(l1.lat)) * Math.cos(this.deg2rad(l2.lat)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    let dKm = R * c; // Distance in km
    let dM = dKm*1000; // Distance in m
    return dM;
  }

  private deg2rad(deg:any):any {
    return deg * (Math.PI/180);
  }

  public getNearestInstitution(elemNode:HTMLElement, typesArray:Array<string>):Promise<any> {
    return new Promise((resolve, reject) => {
      for (let ti = 0; ti < typesArray.length; ti++) {
        this.places = new this.google_maps.places.PlacesService(elemNode);
        console.log(' ');
        console.log('[PLACES] Start looking for ' + typesArray[ti] + '...');
        this.places.nearbySearch({
          location: this.currentLoc,
          radius: 100,
          type: [typesArray[ti]]
        }, (results, status) => {
          if (status === this.google_maps.places.PlacesServiceStatus.OK) {
            let plsRes = results;
            for (var i = 0; i < plsRes.length; i++) {
              plsRes[i]['distance_to_user'] = {};
              let placeLoc:any = {
                lat: results[i].geometry.location.lat(),
                lng: results[i].geometry.location.lng()
              };
              plsRes[i].distance_to_user =
              this.getDistanceFromLatLng(this.currentLoc, placeLoc);
              if (this.nearest.dist == 0 || plsRes[i].distance_to_user < this.nearest.dist) {
                this.nearest.dist = plsRes[i].distance_to_user;
                this.nearest.index = i;
                this.nearest.location  = placeLoc;
                this.nearest.type = typesArray[ti];
                this.nearest.name = plsRes[i].name;
                this.nearest.address_string = plsRes[i].vicinity;
              }
            }
            console.log('places near:', this.nearest);
            if (this.nearest) {
              console.warn('[PLACES] Found nearby place with type ' + typesArray[ti]);
              if (this.displayRoutes)
                this.calculateAndDisplayRoute(this.currentLoc, this.nearest.location);
              resolve(this.nearest);
            }
            else if (ti == typesArray.length - 1 &&
                    !this.nearest) {
              console.warn('[PLACES] Couldn\'t find places with type ' + typesArray[ti] + ' nearby');
              reject('no places found');
            }
          } else console.warn('[PLACES] [', status, ']');
        });
      }
    });
  }
}
