import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'contactList'
})
@Injectable()
export class ContactListPipe implements PipeTransform {
  transform(value, args) {
    return value;
  }
}
