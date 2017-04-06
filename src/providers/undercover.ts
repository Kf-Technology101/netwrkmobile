import { Injectable } from '@angular/core';

import { LocalStorage } from './local-storage';

@Injectable()
export class UndercoverProvider {
  private person: any;

  constructor(
    public localStorage: LocalStorage
  ) {
    console.log('Hello Undercover Provider');
    this.person = this.localStorage.get('undercover_person');
  }

  public getPerson(): any {
    return this.person;
  }

  public setPerson(person: any) {
    this.person = this.localStorage.set('undercover_person', person);
  }

}
