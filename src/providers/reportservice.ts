import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { Api } from './api';
import { Tools } from './tools';
import { Chat } from './chat';

@Injectable()
export class ReportService {

  private userReasons:Array<any> = [
    'Spam',
    'Username',
    'Profile picture',
    'Profile description',
    'Inappropriate content'
  ];

  private messageReasons:Array<any> = [
    'Inappropriate content'
  ];

  private supportAddress:string = 'support@netwrkapp.com';

  constructor(
    public api: Api,
    public alertCtrl: AlertController,
    public tools: Tools,
    public chatPrvd: Chat
  ) {}

  public message(messageId:number):void {
    this.displayAlert('message', messageId, this.messageReasons);
  }

  public user(userId:number):void {
    this.displayAlert('user', userId, this.userReasons);
  }

  private displayAlert(reportType:string, id:number, reasons:Array<any>):any {
    let alert = this.alertCtrl.create({
      subTitle: 'Please explain why you want to report this ' + reportType
    });
    for (let i in reasons)
      alert.addInput({
        type: 'checkbox',
        value: reasons[i].toLowerCase(),
        label: reasons[i]
      });
    alert.addButton({
      text: 'Cancel'
    });
    alert.addButton({
      text: 'Send',
      cssClass: 'active',
      handler: (data) => {
        this.tools.showLoader();
        console.log('[REPORT] data:', data);
        if (data && data.length > 0) {
          this.sendReport(reportType, id, data).subscribe(res => {
            console.log('[REPORT] sent:', res);
            if (res.message == 'ok') {
              this.tools.showToast(reportType + ' successfully reported');
            }
            if (res.message == 'del' && reportType == 'message') {
              for (let i in this.chatPrvd.postMessages) {
                if (this.chatPrvd.postMessages[i].id == id) {
                  this.chatPrvd.postMessages.splice(i, 1);
                  break;
                }
              }
            }
            this.tools.hideLoader();
            alert.dismiss();
          }, err => {
            console.error(err);
            this.tools.hideLoader();
            this.tools.showToast('Error sending report');
          });
        } else {
          this.tools.hideLoader();
          this.tools.showToast('You need to check something before sending');
        }
        return false;
      }
    });

    alert.present().then(res => {
      let alertBtnGroup = <HTMLElement>document.querySelector('.alert-button-group');
      alertBtnGroup.setAttribute('style', 'border-top: 1px solid #ddd');
      let checkContainer = <HTMLElement>document.querySelector('.alert-checkbox-group');
      let contactBlock = <HTMLElement>document.createElement('p');
      let emailLink = <HTMLElement>document.createElement('a');
      emailLink.setAttribute('href', 'mailto:' + this.supportAddress
      + '?subject=Report ' + reportType + ' #' + id);
      emailLink.innerHTML = this.supportAddress;
      contactBlock.innerHTML = 'Something else? Contact us ';
      contactBlock.classList.add('address-link');
      contactBlock.appendChild(emailLink);
      checkContainer.classList.add('contact-block');
      checkContainer.parentNode.insertBefore(contactBlock, checkContainer.nextSibling);
    });
  }

  private sendReport(reportType:string, reportId:number, reasons:Array<string>):any {
    let mess = this.api.post('reports/' + reportType, {
      id: reportId,
      reasons: reasons
    }).share();
    let messMap = mess.map(res => res.json());
    return messMap;
  }

  public blockUser(targetId:any) {
    let seq = this.api.post('blacklist', { target_id: targetId }).share();
    let messMap = seq.map(res => res.json());
    return messMap;
  }
}
