import { Injectable } from '@angular/core';

import { LocalStorage } from './local-storage';

@Injectable()
export class UndercoverProvider {
  public sliderState: boolean =  false;
  constructor(
    public localStorage: LocalStorage
  ) {
    console.log('Hello Undercover Provider');
  }

  public getPerson(): any {
    return this.localStorage.get('undercover_person');
  }

  public setPerson(person: any) {
    person.active = true;
    this.localStorage.set('undercover_person', person);
  }
}
