import { Component, ElementRef, ViewChild, Renderer } from '@angular/core';
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
  userName: string;

  /**
   * Native upload button (hidden)
   */
  @ViewChild('input')
  private nativeInputBtn: ElementRef;
  public user: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private renderer: Renderer,
    public tools: Tools,
    public slideAvatar: SlideAvatar,
    public auth: Auth,
    public userPrvd: User,
    public undercoverPrvd: UndercoverProvider
  ) {
    this.user = this.auth.getAuthData();
  }

  /**
   * Callback executed when the visible button is pressed
   * @param  {Event}  event should be a mouse click event
   */
  public callback(event: Event): void {
    console.log('upload-button callback executed');

    // trigger click event of hidden input
    let clickEvent: MouseEvent = new MouseEvent('click', {bubbles: true});
    this.renderer.invokeElementMethod(
        this.nativeInputBtn.nativeElement, 'dispatchEvent', [clickEvent]);
  }

  /**
   * Callback which is executed after files from native popup are selected.
   * @param  {Event}    event change event containing selected files
   */
  public filesAdded(event: Event): void {
    let files: FileList = this.nativeInputBtn.nativeElement.files;
    let userId = this.auth.getAuthData().id;
    let params = {
      user: {
        first_name: 'a',
        last_name: 'b',
      }
    }

    let tempFiles = [];

    for (let i = 0; i < files.length; i++) {
      tempFiles.push(files.item(i));
    }

    this.userPrvd.updateAvatar(userId, tempFiles, params).then(res => {
        console.log(res);
      }, err => console.error('ERROR', err)
    );
    console.log('Added files', files);
  }

  goBack() { this.tools.popPage(); }

  ionViewDidLoad() {
    // this.slideAvatar.startSliderEvents();
  }

  ionViewWillLeave() {
    // this.slideAvatar.stopSliderEvents();
  }

  ionViewDidEnter() {
    // this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
    // let position = this.undercoverPrvd.profileType == 'undercover' ? true : false
    // this.slideAvatarPrvd.sliderInit();
    // this.slideAvatarPrvd.setSliderPosition(position);
  }

  logOut() {
    this.auth.logout();
    this.tools.pushPage(LogInPage);
  }

}
