import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {
  CameraPreview,
  // PictureOptions,
  CameraPreviewOptions,
  CameraPreviewDimensions
} from '@ionic-native/camera-preview';

@Component({
  selector: 'page-camera',
  templateUrl: 'camera.html'
})
export class CameraPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private cameraPreview: CameraPreview,
  ) {
    const cameraPreviewOpts: CameraPreviewOptions = {
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height,
      camera: 'rear',
      tapPhoto: true,
      previewDrag: true,
      toBack: true,
      alpha: 1
    };

    this.cameraPreview.startCamera(cameraPreviewOpts).then(res => {
      console.log(res);
      this.cameraPreview.show();
    }, err => {
      console.log(err);
    });
  }

  takePhoto() {
    // picture options
    const pictureOpts = {
      width: 1280,
      height: 1280,
      quality: 85
    }

    // take a picture
    this.cameraPreview.takePicture(pictureOpts).then((imageData) => {
      console.log(imageData);
      this.goBack({
        image: imageData[0],
      });
    }, (err) => {
      console.log(err);
    });
  }

  switchCamera() {
    this.cameraPreview.switchCamera();
  }

  goBack(params?: any) { this.navCtrl.pop(params); }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CameraPage');
  }

}
