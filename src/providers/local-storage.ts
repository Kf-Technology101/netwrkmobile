import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorage {

  set(key: string, value: any): any {
    let strVal: any;
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
    console.log('Set ['+key+'] -> ['+value+'] to localStorage...');
    return value;
  }

  clear():void {
    window.localStorage.clear();
  }

  get(key: string): any {
    let val = window.localStorage.getItem(key);
    let parsedVal;
    try {
      val ?  parsedVal = JSON.parse(val) : parsedVal = val;
    } catch (e) {
      parsedVal = val;
    }

    val = parsedVal;
    return val;
  }

  rm(key: any) {
    if (typeof key == 'object' && Array.isArray(key)) {
      for (let i = 0; i < key.length; i++) {
        console.log('Removing [' + key[i] + '] from localStorage...');
        window.localStorage.removeItem(key[i]);
      }
    } else {
      console.log('Removing [' + key + '] from localStorage...');
      window.localStorage.removeItem(key);
    }
  }

}
