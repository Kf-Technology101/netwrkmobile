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

@Component({
  selector: 'page-profile-setting',
  templateUrl: 'profile-setting.html'
})
export class ProfileSettingPage {
  @ViewChild('input')

  userName: string;
  public user: any;
  public profileTypePublic: boolean;
  private nativeInputBtn: ElementRef;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private renderer: Renderer,
    public tools: Tools,
    public slideAvatarPrvd: SlideAvatar,
    public auth: Auth,
    public userPrvd: User,
    public undercoverPrvd: UndercoverProvider,
    public zone: NgZone
  ) {
    this.profileTypePublic = this.navParams.get('public');
    this.user = this.auth.getAuthData();
    this.user.avatar_url = this.auth.hostUrl + this.user.avatar_url;
    this.userName = this.user.name;
    console.log(this.user);
    console.log(this.undercoverPrvd.profileType);
  }

  public callback(event: Event): void {
    console.log('upload-button callback executed');

    // trigger click event of hidden input
    let clickEvent: MouseEvent = new MouseEvent('click', {bubbles: true});
    this.renderer.invokeElementMethod(
        this.nativeInputBtn.nativeElement, 'dispatchEvent', [clickEvent]);
  }

  public filesAdded(event: Event): void {
    let files: FileList = this.nativeInputBtn.nativeElement.files;
    let userId = this.auth.getAuthData().id;
    let params = { user: { name: this.userName } }

    let tempFiles = [];

    for (let i = 0; i < files.length; i++) {
      tempFiles.push(files.item(i));
    }

    this.userPrvd.updateAvatar(userId, tempFiles, params).then(res => {
      console.log(res);
      this.user = res;
      this.user.avatar_url = this.auth.hostUrl + this.user.avatar_url;
    }, err => console.error('ERROR', err));
  }

  changeCallback(positionLeft?: boolean) {
    this.zone.run(() => {
      this.undercoverPrvd.profileType = positionLeft ? 'public' : 'undercover';
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
    this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
    let position = this.undercoverPrvd.profileType == 'undercover' ? true : false
    this.slideAvatarPrvd.sliderInit();
    this.slideAvatarPrvd.setSliderPosition(position);
  }

  logOut() {
    this.auth.logout();
    this.tools.pushPage(LogInPage);
  }

}
