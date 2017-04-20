import { Component, ElementRef, ViewChild, Renderer } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// Pages
import { LogInPage } from '../log-in/log-in';

// Providers
import { Auth } from '../../providers/auth';
import { Tools } from '../../providers/tools';
import { UndercoverProvider } from '../../providers/undercover';
import { SlideAvatar } from '../../providers/slide-avatar';
import { User } from '../../providers/user';

@Component({
  selector: 'page-profile-setting',
  templateUrl: 'profile-setting.html'
})
export class ProfileSettingPage {
  userName: string;

  /**
   * Native upload button (hidden)
   */
  @ViewChild("input")
  private nativeInputBtn: ElementRef;
  public user: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private renderer: Renderer,
    public tools: Tools,
    public undercoverPrvd: UndercoverProvider,
    public slideAvatar: SlideAvatar,
    public auth: Auth,
    public userPrvd: User
  ) {
    this.user = this.undercoverPrvd.getPerson();
  }

  /**
   * Callback executed when the visible button is pressed
   * @param  {Event}  event should be a mouse click event
   */
  public callback(event: Event): void {
    console.log("upload-button callback executed");

    // trigger click event of hidden input
    let clickEvent: MouseEvent = new MouseEvent("click", {bubbles: true});
    this.renderer.invokeElementMethod(
        this.nativeInputBtn.nativeElement, "dispatchEvent", [clickEvent]);
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
        avatar: files,
        first_name: 'a',
        last_name: 'b',
      }
    }
    this.userPrvd.update(userId, params).map(res => res.json()).subscribe(
      res => {
        console.log(res);
      }, err => console.error('ERROR', err)
    );
    console.log("Added files", files);
  }

  goBack() { this.tools.popPage(); }

  ionViewDidLoad() {
    // this.slideAvatar.startSliderEvents();
  }

  ionViewWillLeave() {
    // this.slideAvatar.stopSliderEvents();
  }

  logOut() {
    this.auth.logout();
    this.tools.pushPage(LogInPage);
  }

}
