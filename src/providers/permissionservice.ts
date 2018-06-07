import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Diagnostic } from '@ionic-native/diagnostic';
import { AndroidPermissions } from '@ionic-native/android-permissions';

@Injectable()
export class PermissionsService {
  public permissionList:Array<string> = [
    'ACCESS_LOCATION_EXTRA_COMMANDS',
    'ACCESS_FINE_LOCATION',
    'READ_CONTACTS',
    'READ_EXTERNAL_STORAGE',
    'WRITE_EXTERNAL_STORAGE',
    'LOCATION_HARDWARE',
    'ACCESS_WIFI_STATE'
  ];

  constructor (
  public _platform: Platform,
  public _Diagnostic: Diagnostic,
  public _androidPermission: AndroidPermissions
  ) {}

  isAndroid() {
    return this._platform.is('android')
  }

  isiOS() {
    return this._platform.is('ios');
  }

  isUndefined(type) {
    return typeof type === "undefined";
  }

  pluginsAreAvailable() {
    return !this.isUndefined(document.plugins);
  }

  public checkCameraPermissions(): Promise<boolean> {
    return new Promise(resolve => {
      if (!this.pluginsAreAvailable()) {
        console.warn('Dev: Camera plugin unavailable.');
        resolve(false);
      } else if (this.isiOS()) {
        this._Diagnostic.getCameraAuthorizationStatus().then(status => {
        if (status == this._Diagnostic.permissionStatus.GRANTED) {
          resolve(true);
        }
        else if (status == this._Diagnostic.permissionStatus.DENIED) {
          resolve(false);
        }
        else if (status == this._Diagnostic.permissionStatus.NOT_REQUESTED || status.toLowerCase() == 'not_determined') {
          this._Diagnostic.requestCameraAuthorization().then(authorisation => {
            resolve(authorisation == this._Diagnostic.permissionStatus.GRANTED);
          });
        }
        });
      } else if (this.isAndroid()) {
        this._Diagnostic.isCameraAuthorized().then(authorised => {
        if (authorised) resolve(true);
        else
          this._Diagnostic.requestCameraAuthorization().then(authorisation => {
            resolve(authorisation == this._Diagnostic.permissionStatus.GRANTED);
          });
        });
      }
    });
  }

  public checkAndroidPermission(permission:any): Promise<any> {
    return new Promise(resolve => {
      this._androidPermission.checkPermission(this._androidPermission.PERMISSION[permission]).then(
        success => {
          console.log('Permission ' + permission + ' granted');
          resolve();
        },
        err => {
        let requestPermission = () => this._androidPermission
        .requestPermissions(this._androidPermission.PERMISSION[permission]).then(
          success => resolve(), err => requestPermission())
        requestPermission();
      });
    });
  }

  public checkAll():Promise<any> {
    return new Promise((resolve, reject) => {
      let pIndex = 0;
      let permCheck = (permList) => {
        this.checkAndroidPermission(permList[pIndex]).then(() => {
          pIndex++;
          if (pIndex < permList.length) permCheck(permList[pIndex]);
          else resolve();
        }, err => reject());
      }
      permCheck(this.permissionList);
    })
  }
}
