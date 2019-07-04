import { Component, HostBinding } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { CameraPreviewOptions, CameraPreview } from '@ionic-native/camera-preview';
import { File } from '@ionic-native/file';
import { Tools } from '../../providers/tools';
import { Camera } from '../../providers/camera';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery';
import { LocalStorage } from '../../providers/local-storage';
// Animations
import {
  animSpeed,
  toggleInputsFade,
  rotateChatPlus,
  toggleChatOptionsBg,
  scaleMainBtn,
  toggleGallery,
  toggleFade,
  cameraUIanimation
} from '../../includes/animations';

@Component({
  selector: 'page-camera',
  templateUrl: 'camera.html',
  animations: [
    toggleInputsFade,
    rotateChatPlus,
    toggleChatOptionsBg,
    scaleMainBtn,
    toggleGallery,
    toggleFade,
    cameraUIanimation
  ],
  providers: [
    Base64ToGallery
  ]
})

export class CameraPage {
  @HostBinding('class') colorClass = 'transparent-background';

  cameraUI: any = {
    tooltip: 'tooltipFadeIn',
    button:  {
      state: 'photoButtonFadeIn',
      hidden: false
    }
  };

  imgBg: string;
  imgUrl: string;

  mainBtn = {
    state: 'minimisedForCamera',
    hidden: false
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private cameraPreview: CameraPreview,
    public cameraPrvd: Camera,
    public tools: Tools,
    private base64ToGallery: Base64ToGallery,
    private storage: LocalStorage,
	private file: File
  ) {}

  takePhoto() {
    this.tools.showLoader();

    const pictureOpts = {
      width: 1280,
      height: 1280,
      quality: 95
    }

    // take a picture
    this.cameraUI.button.hidden = true;
    this.cameraPreview.takePicture(pictureOpts).then(imageData => {

      this.cameraUI.button.state = 'photoButtonFadeOut';
      this.cameraUI.tooltip = 'tooltipFadeOut';
      if (this.storage.get('first_time_camera') === null) {
        this.storage.set('first_time_camera', true);
      }
      setTimeout(() => {
        this.mainBtn.state = 'normal';
      }, animSpeed.fadeIn/2);

      this.imgBg = `url(data:image/jpeg;base64,${imageData[0]})`;
	  
      this.base64ToGallery.base64ToGallery(imageData[0], { prefix: 'netwrk_',mediaScanner:true }).then(
        res => {
          this.tools.hideLoader();
		  this.imgUrl = res;
        },
        err => {
          this.tools.hideLoader();
		  this.tools.showToast('Error saving image');
          console.log('Error saving image to gallery ', err);
        }
      );

      // this.goBack();
    }, err => {
      console.log(err);
      this.mainBtn.state = 'normal';
      // this.goBack();
    });
  }

  switchCamera() {
    this.cameraPreview.switchCamera().then(res => {
      console.log('camera switched');
    })
    .catch(err => {
      console.error('switch camera error:', err);
    });
  }

  goBack() {
    this.tools.popPage();
  }

  saveImage() {
    if (this.cameraPrvd.takenPictures.length < 3) {
		let fileUrl = this.imgUrl;
		let filename = fileUrl.substring(fileUrl.lastIndexOf('/')+1);
		let path =  fileUrl.substring(0,fileUrl.lastIndexOf('/')+1);
		this.file.readAsDataURL("file://" + path, filename).then(
			res => {
				if (this.cameraPrvd.takenPictures.length < 3) {
					this.cameraPrvd.pushPhoto(res);
				}
			}, err => {
				this.tools.showToast(JSON.stringify(err));
			}
		);
		// this.cameraPrvd.pushPhoto(this.imgUrl);
      this.goBack();
    } else {
      this.tools.showToast('You can\'t append more pictures');
    }
  }

  cancelSave() {
    this.imgBg = undefined;
    this.cameraUI.button.hidden = false;
    this.cameraUI.button.state = 'photoButtonFadeIn';
  }

  ionViewDidEnter() {
    this.cameraPrvd.toggleCameraBg({
       isCamera: true
    });

    setTimeout(() => {
      this.cameraUI.tooltip = 'tooltipFadeIn';
    }, animSpeed.fadeIn/2);

    console.log('ionViewDidLoad CameraPage');
  }
}
