import { Injectable } from '@angular/core';

// Providers
import { LocalStorage } from './local-storage';
import { Auth } from './auth';
import { User } from './user';
import { Tools } from './tools';



@Injectable()
export class UndercoverProvider {
  public sliderState: boolean =  false;

  constructor(
    public localStorage: LocalStorage,
    public auth: Auth,
    public user: User,
    public tools: Tools
  ) {
    console.log('Hello Undercover Provider');
  }

  public getPerson(): any {
    let person = this.localStorage.get('undercover_person');
    let result = person && person.name && person.description && person.imageUrl
      ? person : null;
    return result;
  }

  public setActivePerson(status: boolean): any {
    let person = this.getPerson();
    person ? person.active = status : person = { active: status };
    return this.localStorage.set('undercover_person', person);
  }

  public setPerson(person: any): any {
    return new Promise((resolve, reject) => {
      console.log(person)
      let updateObj: any = {
        role_name: person.name,
        role_description: person.description,
        role_image_url: person.imageUrl,
        active: null,
      }

      console.log(updateObj);
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

  public getCharacterPerson(UndercoverCharacterPage: any, NetworkFindPage: any): any {
    let person = this.getPerson()
    let result = person ? NetworkFindPage : UndercoverCharacterPage;
    return result;
  }
}
