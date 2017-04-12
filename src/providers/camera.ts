import { Injectable } from '@angular/core';

@Injectable()
export class Camera {
  public takenImage: string;

  constructor() {
    console.log('Hello Camera Provider');
  }

}
