import { Component } from '@angular/core';
import {
  NavController,
  NavParams,
  Platform,
  AlertController,
  App
} from 'ionic-angular';

// Pages
import { ChatPage } from '../chat/chat';

// Providers
import { Auth } from '../../providers/auth';
import { User } from '../../providers/user';
import { ContactsProvider } from '../../providers/contacts';
import { Tools } from '../../providers/tools';
import { NetworkProvider } from '../../providers/networkservice';
import { Gps } from '../../providers/gps';
import { Chat } from '../../providers/chat';

import { Facebook } from '@ionic-native/facebook';
import { FeedbackService } from "../../providers/feedback.service";

@Component({
  selector: 'page-network-contact-list',
  templateUrl: 'network-contact-list.html'
})
export class NetworkContactListPage {
  contacts: Array<any> = [];
  selectAll: boolean = false;

  public listType: string;
  private selectErrorString: string;
  private selectMinErrorString: string;
  private selectMinSMSErrorString: string;
  private accessed: boolean = false;
  private message: string;
  private fromArea: boolean = false;
  private selectBtnStr: string = '';

  private showShareDialog:boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public auth: Auth,
    public userPrvd: User,
    public contactsPrvd: ContactsProvider,
    public tools: Tools,
    public networkPrvd: NetworkProvider,
    public gpsPrvd: Gps,
    public chatPrvd: Chat,
    public facebook: Facebook,
    private alertCtrl: AlertController,
    public app: App,
    public feedbackService: FeedbackService
  ) {
    this.showShareDialog = this.navParams.get('show_share_dialog');
    this.listType = this.navParams.get('type');
    this.accessed = this.navParams.get('accessed');
    this.message = this.navParams.get('message');
    this.fromArea = this.navParams.get('from_area');
    console.log(this.listType);

    this.contactsPrvd.getContacts(this.listType).then(data => {
      console.log(data);
      this.contacts = data;
      if (this.contacts.length > 0 ||
         (this.contacts[this.listType] &&
          this.contacts[this.listType].length > 0)) {
        this.setErrorMessages(this.contacts);
        this.doSelectAll();
      } else {
        this.tools.showToast('Contacts not available');
      }
    }, err => {
      console.log(err);
      this.tools.showToast('Contacts not available');
    });
  }

  private parseContactsObject(contacts:Array<any>):Array<any> {
    console.log('contacts:', contacts);
    let parsedContacts:Array<any> = [];
    for (let i = 0; i < contacts.length; i++) {
      parsedContacts.push(
      {
        name: contacts[i]['_objectInstance'].displayName,
        email: contacts[i]['_objectInstance'].emails[0].value
      });
    }
    console.log('parsed contacts:', parsedContacts);
    return parsedContacts;
  }

  private sendInvitesToEmails():Promise<any> {
    return new Promise((resolve, reject) => {
      let contactsToParse:Array<any> = [];
      for (let c = 0; c < this.contacts.length; c++) {
        if (this.contacts[c].checked) contactsToParse.push(this.contacts[c]);
      }
      if (contactsToParse.length > 0) {
        let parsedContacts:Array<any> = this.parseContactsObject(contactsToParse);
        this.contactsPrvd.sendInvitations(parsedContacts).map(res => res.json())
        .subscribe(res => resolve(), err => reject(err));
      } else {
        resolve();
      }
    });
  }

  private initAreaTransition():Promise<any> {
    return new Promise((resolve, reject) => {
      this.sendInvitesToEmails().then(res => {
        this.app.getRootNav().setRoot(ChatPage, {
          action: 'area'
        });
        resolve();
      }, err => {
        this.tools.hideLoader();
        this.tools.showToast('Something went wrong');
        reject();
      });
    });
  }

  private goToArea():Promise<any> {
    return new Promise ((resolve, reject) => {
      this.tools.showLoader();
      this.gpsPrvd.createNetwrk(this.chatPrvd.localStorage.get('chat_zip_code'))
      .subscribe(res => {
        console.log('createNetwrk res:', res);
        this.initAreaTransition().then(res => resolve(), err => reject());
      }, err => {
        this.gpsPrvd
        .addUserToNetwork(this.chatPrvd.localStorage.get('chat_zip_code'))
        .subscribe(res => {
          this.initAreaTransition().then(res => resolve(), err => reject());
        });
        console.error('goToArea err:', err);
      });
    });
  }

  private showShareQuestion(forced?:boolean):any {
    if (this.showShareDialog || forced) {
      let alert = this.alertCtrl.create({
        enableBackdropDismiss: false,
        title: '',
        subTitle: 'Share this app with your friends on facebook too?',
        buttons: [{
            text: 'Skip',
            role: 'cancel',
            handler: () => {
              if (forced && this.contacts) {
                for (let c = 0; c < this.contacts.length; c++) {
                  this.contacts[c].checked = false;
                }
              }
              this.goToArea().then(res => {
                this.tools.hideLoader();
                alert.dismiss();
              }, err => alert.dismiss());
              return false;
            }
          }, {
            cssClass: 'active',
            text: 'Sure!',
            handler: () => {
                this.goToArea().then(res => {
                    this.tools.hideLoader();
                    alert.dismiss();
                }, err => alert.dismiss());

              console.log('runing handler for [Sure!]');
              this.feedbackService.autoPostToFacebook({
                message: 'Become a part of local life! Local people join together in a netwrk to share and choose the best content. Download it to connect to local life wherever you are!',
                url: 'http://18.188.223.201:3000'
              }).then(res => {
                this.tools.showToast('App successfully shared');
                this.goToArea().then(res => {
                  this.tools.hideLoader();
                  alert.dismiss();
                }, err => alert.dismiss());
              }, err => {
                this.tools.showToast('Something went wrong :(');
                this.tools.hideLoader();
                alert.dismiss();
              });
              return false;
            }
          }
        ]
      });
      alert.present();
    } else {
      this.goHome();
    }
  }

  private setErrorMessages(contacts: Array<any>) {
    let count: number = 0;
    if (contacts.length > count) {
      this.selectMinErrorString = `You need to select ${count} or more contacts`
      this.selectErrorString = `Please, select ${count} or more contacts to continue`;
    } else {
      this.selectMinErrorString = 'You need to select all contacts';
      this.selectErrorString = 'Please, select all contacts to continue';
    }
    this.selectMinSMSErrorString = 'Please, select minimum one contact';
  }

  private shareViaFacebook():Promise<any> {
    return new Promise((resolve, reject) => {
      let shareUrl = 'http://18.188.223.201:3000';
      let shareImage = shareUrl + '/assets/logo-88088611a0d6230481f2a5e9aabf7dee19b26eb5b8a24d0576000c6c33ccc867.png';

      let shareParams:any = {
        method: 'share',
        caption: 'Netwrk',
        description: 'Some test description',
        picture: shareImage,
        share_native: true
      };
      this.facebook.showDialog(shareParams).then(res => {
        console.log('shareViaFacebook res:', res);
        resolve('ok');
      }).catch(err => reject(err));
    });
  }

  doSelectAll() {
    this.toggleSelectAll(this.selectAll);

    for (let c in this.contacts) {
      this.contacts[c].checked = this.selectAll;
    }
    this.checkContactsCount();
  }

  doChange(contact: any) {
    let hasUnchanged: boolean = false;
    for (let c in this.contacts) {
      if (!this.contacts[c].checked) {
        hasUnchanged = true;
      }
    }
    this.toggleSelectAll(hasUnchanged);
    this.checkContactsCount();
  }

  private toggleSelectAll(condition: boolean) {
    this.selectAll = !condition;
  }

  private checkContactsCount() {
    let count = 0;
    for (let c = 0; c < this.contacts.length; c++) {
      if (this.contacts[c].checked) count++;
    }
    this.accessed = (count > 0);
    if (this.fromArea) this.accessed = true;
    this.selectBtnStr = this.selectAll ? 'Unselect all' : 'Select all';
  }

  goHome() {
    this.tools.showLoader();
    var checkedContacts: Array<any> = [];

    for (let c in this.contacts) {
      if (this.contacts[c].checked) {
        let checkedObj = {
          name: this.contacts[c].name.formatted || '',
          email: null,
          phone: null
        }
        if (this.listType == 'emails') {
          checkedObj.email = this.contacts[c].emails[0].value || '';
        } else if (this.listType == 'phones') {
          checkedObj.phone = this.contacts[c].phoneNumbers[0].value || '';
        }

        checkedContacts.push(checkedObj);
      }
    }

    if (checkedContacts.length > 0) {
      if (this.listType == 'emails') {
        this.tools.hideLoader();
        this.tools.showToast(this.selectMinErrorString);
        return;
      }

      if (this.listType == 'phones' && !this.message) {
        this.message = 'I connected to my area on this cool app called netwrk, where you can hang anything anywhere "insert". Check it out';
      }

      console.log('this.message', this.message);
      if (this.message) {
        this.contactsPrvd.sendSMS(checkedContacts, this.message)
        .subscribe(res => {
          this.tools.hideLoader();
          this.tools.popPage();
        }, err => this.tools.hideLoader());
      } else {
        this.contactsPrvd.sendInvitations(checkedContacts)
          .map(res => res.json()).subscribe(res => {
            if (this.listType == 'emails')
              this.contactsPrvd.sendContacts(this.contacts)

            let inviteCode = this.chatPrvd.localStorage.get('chat_zip_code');
            let inviteCodes = this.networkPrvd.getInviteZipAccess();
            this.tools.hideLoader();

            if (inviteCodes.indexOf(inviteCode) === -1) inviteCodes.push(inviteCode);

            this.networkPrvd.saveInviteZipAccess(inviteCodes);
            this.networkPrvd.saveInviteAccess(true);
            this.tools.popPage();
          },
          err => this.tools.hideLoader());
      }
    } else {
      if (this.listType == 'emails') {
        this.tools.showToast(this.selectErrorString);
      } else {
        this.tools.showToast('Can\'t load contacts');
      }
      this.tools.hideLoader();
    }
  }

  public toggleSelection():void {
    for (let c in this.contacts) {
      this.contacts[c].checked = !this.selectAll;
    }
    this.toggleSelectAll(this.selectAll);
    this.checkContactsCount();
  }

  goBack() { this.tools.popPage(); }

}
