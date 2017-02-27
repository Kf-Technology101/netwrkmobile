import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Api } from './api';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

/*
  Generated class for the User provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class User {
  _user: any;

  constructor(public http: Http, public api: Api) {
    console.log('Hello User Provider');
  }

  login(accountInfo: any) {
    let seq = this.api.post('login', accountInfo).share();

    seq
      .map(res => res.json())
      .subscribe(res => {
        // If the API returned a successful response, mark the user as logged in
        if(res.status == 'success') {
          this._loggedIn(res);
        } else {

        }
      }, err => {
        console.error('ERROR', err);
      });

    return seq;
  }

  /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  signup(accountInfo: any) {
    let user = {
      user: accountInfo,
    }

    console.log(user);

    let seq = this.api.post('registrations', user).share();

    seq
      .map(res => res.json())
      .subscribe(res => {
        console.log(res);

        // If the API returned a successful response, mark the user as logged in
        if(res.status == 'success') {
          this._loggedIn(res);
        }
      }, err => {
        console.error('ERROR', err);
      });

    return seq;
  }

  forgot(accountInfo: any) {
    // let seq = this.api.post('signup', accountInfo).share();

    // seq
    //   .map(res => res.json())
    //   .subscribe(res => {
    //     // If the API returned a successful response, mark the user as logged in
    //     if(res.status == 'success') {
    //       this._loggedIn(res);
    //     }
    //   }, err => {
    //     console.error('ERROR', err);
    //   });

    // return seq;
  }

  /**
   * Log the user out, which forgets the session
   */
  logout() {
    this._user = null;
  }

  /**
   * Process a login/signup response to store user data
   */
  _loggedIn(resp) {
    this._user = resp.user;
  }

}
