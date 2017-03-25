import { Component, ElementRef, ViewChild, Renderer } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-profile-setting',
  templateUrl: 'profile-setting.html'
})
export class ProfileSettingPage {
  userName: string;
  hiddenMainBtn: boolean;

  /**
   * Native upload button (hidden)
   */
  @ViewChild("input")
  private nativeInputBtn: ElementRef;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private renderer: Renderer
  ) {}

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
    console.log("Added files", files);
    // this.btnCallback(files);
  }

  goBack() {
    let navOptions = {
      animate: true,
      animation: 'ios-transition',
      direction: 'back'
    }
 
    this.hiddenMainBtn = true;
    this.navCtrl.pop(navOptions);
  }

  ionViewDidEnter() { this.hiddenMainBtn = false; }

}
