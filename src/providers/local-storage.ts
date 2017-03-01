import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorage {

  set(key: string, value: any): any {
    let strVal;
    if (typeof value != 'string') {
      try {
        strVal = JSON.stringify(value);
      } catch (e) {
        console.error(e);
        strVal = value.toString();
      }

      if (strVal) value = strVal;
    }

    window.localStorage.setItem(key, value);
    return value;
  }

  get(key: string): any {
    let val = window.localStorage.getItem(key);
    let parsedVal;
    try {
      val ?  parsedVal = JSON.parse(val) : parsedVal = val;
    }catch (e) {
      parsedVal = val;
    }

    val = parsedVal;
    return val;
  }

  rm(key: any) {
    if (typeof key == 'object' && Array.isArray(key)) {
      for (let i = 0; i < key.length; i++) {
        window.localStorage.removeItem(key[i]);
      }
    } else {
      window.localStorage.removeItem(key);
    }
  }

}
