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

export const chatAnim: any = 600;

// Simple fadeIn/fadeOut in animSpeed ms
export const toggleInputsFade:any = trigger('inputState', [
  state('shown', style({
    transform: 'scale(1)',
    opacity: '1'
  })),
  state('hidden', style({
    transform: 'scale(0.8)',
    opacity: '0'
  })),

  state('btnShown', style({
    transform: 'scale(1)',
    opacity: '1'
  })),
  state('btnHidden', style({
    transform: 'scale(0.8)',
    opacity: '0'
  })),
  transition('* => shown', animate(animSpeed.fadeIn + 'ms ease-in')),
  transition('shown => hidden', animate(animSpeed.fadeOut + 'ms ease-out')),
  transition('btnHidden => btnShown', animate(chatAnim + 'ms ease-in')),
  transition('btnShown => btnHidden', animate(chatAnim/2 + 'ms ease-out'))
]);

// Rotation and movement of the 'plus-button' in the chat input
export const rotateChatPlus: any = trigger('rotState', [
  state('spined', style({
    transform: 'rotate(405deg)',
    right: 0
  })),
  state('default', style({
    transform: 'rotate(0deg)',
  })),
  transition('* => spined', animate(chatAnim - 150 + 'ms ease-in')),
  transition('spined => default', animate(chatAnim - 150 + 'ms ease-in'))
]);

// Toggle chat options buttons
export const toggleChatOptionsBg: any = trigger('bgState', [
  state('stretched', style({
    width: '100%'
  })),
  state('compressed', style({
    width: '0%'
  })),
  transition('* => stretched', animate(chatAnim - 200 + 'ms ease-in')),
  transition('stretched => compressed', animate(chatAnim - 200 + 'ms ease-in'))
]);

// Main button scaling
export const scaleMainBtn: any = trigger('mainBtnState', [
  state('minimised', style({
    transform: 'scale(0.381)',
    bottom: '30px'
  })),
  state('normal', style({
    transform: 'scale(1)',
    bottom: '70px'
  })),

  state('hidden', style({
    transform: 'scale(0)',
    bottom: '30px'
  })),

  state('moved-n-scaled', style({
    bottom: 'calc(50% - 25px)',
    transform: 'scale(0.381)'
  })),
  transition('normal => minimised', animate(chatAnim/2 + 'ms ease-in')),
  transition('minimised => normal', animate(chatAnim/2 + 'ms ease-in')),
  transition('* => hidden', animate(chatAnim/3 + 'ms ease-out')),
  transition('* => moved-n-scaled', animate(chatAnim/2 + 'ms ease-in')),
  transition('moved-n-scaled => normal', animate(chatAnim/2 + 'ms ease-in'))
]);

export const toggleGallery: any = trigger('galleryState', [
  state('on', style({
    top: '50%',
    height: '50%'
  })),
  state('off', style({
    top: '100%',
    height: 0
  })),
  transition('* => *', animate(chatAnim/2 + 'ms ease-in'))
]);
