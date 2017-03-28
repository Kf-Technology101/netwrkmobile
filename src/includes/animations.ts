import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/core';

export const animSpeed: any = {
  fadeIn: 800,
  fadeOut: 800
};

export const toggleInputsFade:any = trigger('inputState', [
  state('shown', style({
    transform: 'scale(1)',
    opacity: '1'
  })),
  state('hidden', style({
    transform: 'scale(0.8)',
    opacity: '0'
  })),
  transition('* => shown', animate(animSpeed.fadeIn + 'ms ease-in')),
  transition('shown => hidden', animate(animSpeed.fadeOut + 'ms ease-out'))
]);
