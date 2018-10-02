import { Pipe, PipeTransform } from '@angular/core';
/*
 * Convert unicode to emoji
 * * Usage:
 *   value | exponentialStrength
 * Example:
 *   {{ emojiCode | emojiFilter }}
*/
@Pipe({ name: 'emojiConvert' })

export class EmojiFilter implements PipeTransform {
  transform(value, args) {
    return String.fromCodePoint(value);
  }
}
