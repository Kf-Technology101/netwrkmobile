import { Injectable } from '@angular/core';

// Providers
import { LocalStorage } from './local-storage';
import { Auth } from './auth';
import { User } from './user';
import { Tools } from './tools';



@Injectable()
export class UndercoverProvider {
  public sliderState: boolean =  false;
  public isUndercover: boolean;
  public profileType: string = 'undercover';

  constructor(
    public localStorage: LocalStorage,
    public auth: Auth,
    public user: User,
    public tools: Tools
  ) {
    console.log('Hello Undercover Provider');
  }

  public setUndercover(status: boolean): boolean {
    this.isUndercover = status;
    return this.isUndercover;
  }

  public setPerson(person: any): any {
    return new Promise((resolve, reject) => {
      let updateObj: any = {
        role_name: person.name,
        role_description: person.description,
        role_image_url: person.imageUrl,
      }

      this.tools.showLoader();
      this.user.update(
        this.auth.getAuthData().id,
        { user: updateObj },
        this.auth.getAuthType()
      ).map(res => res.json()).subscribe(res => {
        this.tools.hideLoader();
        resolve(res);
      }, err => {
        this.tools.hideLoader();
        this.tools.showToast(JSON.stringify(err));
        reject(err);
      });
    });
  }

  public getCharacterPerson(UCPage: any, NFPage: any, ChatPage?: any): any {
    let authData = this.auth.getAuthData();
    if (authData && authData.role_name
      && authData.role_description && authData.role_image_url) {
      // if (ChatPage && this.localStorage.get('chat_zip_code')) {
      //   return ChatPage;
      // } else {
        return NFPage;
      // }
    } else {
      return UCPage;
    }
  }
}
