import {
  Component,
  ElementRef,
  ViewChild,
  Renderer,
  NgZone } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// Pages
import { LogInPage } from '../log-in/log-in';

// Providers
import { Auth } from '../../providers/auth';
import { Tools } from '../../providers/tools';
import { SlideAvatar } from '../../providers/slide-avatar';
import { User } from '../../providers/user';
import { UndercoverProvider } from '../../providers/undercover';

import { Keyboard } from '@ionic-native/keyboard';

@Component({
  selector: 'page-profile-setting',
  templateUrl: 'profile-setting.html',
  providers: [
    Keyboard
  ]
})
export class ProfileSettingPage {
  @ViewChild('input') nativeInputBtn: ElementRef

  userName: string;
  public user: any;
  public profileTypePublic: boolean;
  private imageLoading: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private renderer: Renderer,
    private keyboard: Keyboard,
    public tools: Tools,
    public slideAvatarPrvd: SlideAvatar,
    public auth: Auth,
    public userPrvd: User,
    public undercoverPrvd: UndercoverProvider,
    public zone: NgZone
  ) {
    this.profileTypePublic = this.navParams.get('public');
    this.user = this.auth.getAuthData();
    if (!this.user) this.user = {
      avatar_content_type: null,
      avatar_file_name: null,
      avatar_file_size: null,
      avatar_updated_at: null,
      avatar_url: 'assets/images/incognito.png',
      created_at: '2017-04-22T14:59:29.921Z',
      date_of_birthday: '2004-01-01',
      email: 'olbachinskiy2@gmail.com',
      name: 'Oleksandr Bachynskyi',
      id: 55,
      invitation_sent: false,
      phone: '1492873128682',
      provider_id: null,
      provider_name: null,
      role_description: null,
      role_image_url: 'assets/images/incognito.png',
      role_name: null,
      updated_at: '2017-04-22T14:59:29.921Z',
    }
    this.user.avatar_url = this.auth.hostUrl + this.user.avatar_url;

    this.keyboard.onKeyboardHide().subscribe(keyboard => {
      let params = { user: { name: this.userName } }

      this.userPrvd.update(this.user.id, params)
      .map(res => res.json()).subscribe(res => {
        console.log(res);
        this.user = res;
        this.user.avatar_url = this.auth.hostUrl + this.user.avatar_url;
      }, err => {
        console.log(err);
      });
    }, err => {
      console.log(err);
    });
  }

  public callback(event: Event): void {
    this.imageLoading = true;
    console.log('upload-button callback executed');

    // trigger click event of hidden input
    let clickEvent: MouseEvent = new MouseEvent('click', {bubbles: true});
    this.renderer.invokeElementMethod(
        this.nativeInputBtn.nativeElement, 'dispatchEvent', [clickEvent]);
  }

  public filesAdded(event: Event): void {
    let files: FileList = this.nativeInputBtn.nativeElement.files;
    let userId = this.auth.getAuthData().id;

    let tempFiles = [];

    for (let i = 0; i < files.length; i++) {
      tempFiles.push(files.item(i));
    }

    this.userPrvd.updateAvatar(userId, tempFiles).then(res => {
      console.log(res);
      this.imageLoading = false;
      this.user = res;
      this.user.avatar_url = this.auth.hostUrl + this.user.avatar_url;
    }, err => {
      console.error('ERROR', err);
      this.imageLoading = false;
    });
  }

  changeCallback(positionLeft?: boolean) {
    this.zone.run(() => {
      if (positionLeft) {
        this.undercoverPrvd.profileType = 'public';
        this.profileTypePublic = true;
      } else {
        this.undercoverPrvd.profileType = 'undercover';
        this.profileTypePublic = false;
      }
      this.userName = this.slideAvatarPrvd.sliderPosition == 'left'
        ? this.user.name
        : this.user.role_name;
    });
  }

  goBack() { this.tools.popPage(); }

  ionViewDidLoad() {
    // this.slideAvatar.startSliderEvents();
  }

  ionViewWillLeave() {
    // this.slideAvatar.stopSliderEvents();
  }

  ionViewDidEnter() {
    let dragList = document.getElementsByClassName('draggable-element');
    this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
    this.slideAvatarPrvd.sliderInit();
    this.userName = this.user.name;
  }

  logOut() {
    this.auth.logout();
    this.tools.pushPage(LogInPage);
  }

}
