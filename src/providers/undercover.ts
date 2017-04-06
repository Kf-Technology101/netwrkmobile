import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class UndercoverProvider {
  private person: any;

  constructor(public http: Http) {
    console.log('Hello Undercover Provider');
  }

  public getPerson(): any {
    return this.person;
  }

  public setPerson(person: any) {
    this.person = person;
  }

}
