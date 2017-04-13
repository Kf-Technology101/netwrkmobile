import { Injectable } from '@angular/core';

// Providers
import { LocalStorage } from './local-storage';
import { Auth } from './auth';
import { User } from './user';
import { Tools } from './tools';
import { Api } from './api';
import { Gps } from './gps';

@Injectable()
export class UndercoverProvider {
  public sliderState: boolean =  false;

  constructor(
    public localStorage: LocalStorage,
    public auth: Auth,
    public user: User,
    public tools: Tools,
    public api: Api,
    public gps: Gps
  ) {
    console.log('Hello Undercover Provider');
  }

  public getPerson(): any {
    return this.localStorage.get('undercover_person');
  }

  public setActivePerson(status: boolean): any {
    let person = this.getPerson();
    person ? person.active = status : person = { active: status };
    return this.localStorage.set('undercover_person', person);
  }

  public setPerson(person: any): any {
    console.log(person)
    let updateObj: any = {
      role_name: person.name,
      role_description: person.description,
      role_image_url: person.imageUrl,
      active: null,
    }

    return new Promise((resolve, reject) => {
      this.tools.showLoader();
      this.user.update(
        this.auth.getAuthData().id,
        { user: updateObj }
      ).map(res => res.json()).subscribe(res => {
        this.tools.hideLoader();
        person.active = true;
        this.localStorage.set('undercover_person', person);
        resolve(res);
      }, err => {
        this.tools.hideLoader();
        this.tools.showToast(JSON.stringify(err));
        reject(err);
      });
    });
  }

  public sendMessage(data: any): any {
    let seq = this.api.post('messages', {
      image: data.image,
      text: data.text,
      user_id: data.user_id,
      lat: this.gps.coords.lat,
      lng: this.gps.coords.lng,
      undercover: true,
    }).share();

    return seq;
  }
}
