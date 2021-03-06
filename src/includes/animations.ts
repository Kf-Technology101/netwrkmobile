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
    right: '0px'
  })),
  state('default', style({
    transform: 'rotate(0deg)'
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
    bottom: '68px'
  })),

  state('hidden', style({
    transform: 'scale(0)',
    bottom: '30px'
  })),
  state('centered', style({
    bottom: 0,
    top: 0
  })),

  state('moved-n-scaled', style({
    transform: 'scale(0.381)',
    bottom: document.documentElement.clientHeight/2 - 20 + 'px'
  })),

  state('minimisedForCamera', style({
    transform: 'scale(0.381)',
    bottom: '-11px'
  })),

  state('above_append', style({
    transform: 'scale(0.381)',
    bottom: '178px'
  })),

  transition('* => minimised', animate(10 + 'ms ease-in')),
  transition('minimised => normal', animate(10 + 'ms ease-in')),
  transition('* => normal', animate(10 + 'ms ease-in')),
  transition('* => hidden', animate(10 + 'ms ease-out')),
  transition('* => moved-n-scaled', animate(10 + 'ms ease-in')),
  transition('moved-n-scaled => normal', animate(10 + 'ms ease-in')),
  transition('* => minimisedForCamera', animate(10 + 'ms ease-in')),
  transition('* => above_append', animate(10 + 'ms ease-in'))
]);

export const toggleGallery: any = trigger('containerState', [
  state('on', style({
    height: document.documentElement.clientHeight/2 + 'px'
  })),
  state('off', style({
    height: '0px'
  })),

  state('on_append', style({
    height: '205px'
  })),
  transition('* => *', animate(chatAnim/2 + 'ms ease-in'))
]);

export const toggleFade: any = trigger('fadeState', [
  state('fadeIn', style({
    opacity: '1'
  })),
  state('fadeOut', style({
    opacity: '0'
  })),
  state('fadeInfast', style({
    opacity: '1'
  })),
  state('fadeOutfast', style({
    opacity: '0'
  })),

  state('fadeInVeryFast', style({
    opacity: '1'
  })),
  transition('* => fadeIn', animate(animSpeed.fadeIn + 'ms ease-in')),
  transition('* => fadeOut', animate(animSpeed.fadeIn + 'ms ease-in')),
  transition('* => fadeOutfast', animate(animSpeed.fadeIn/2 + 'ms ease-in')),
  transition('* => fadeInfast', animate(animSpeed.fadeIn/2 + 'ms ease-in')),
  transition('* => fadeInVeryFast', animate(200 + 'ms ease-out'))
]);

export const cameraUIanimation: any = trigger('cameraUIstate', [
  state('photoButtonFadeIn', style({
    transform: 'scale(1)',
    opacity: '1',
    bottom: '68px'
  })),
  state('photoButtonFadeOut', style({
    opacity: '0',
    bottom: '158px',
    transform: 'scale(0.9)'
  })),

  state('tooltipFadeOut', style({
    opacity: '0',
    transform: 'scaleX(0.85)'
  })),
  state('tooltipFadeIn', style({
    opacity: '1',
    transform: 'scaleX(1)'
  })),

  transition('* => *', animate(animSpeed.fadeIn/2 + 'ms ease-out'))
]);

export const slideToggle: any = trigger('slideState', [
  state('slideUp', style({
    height: '0px'
  })),
  state('slideDown', style({
    height: 'auto'
  })),

  transition('* => *', animate(chatAnim/2 + 'ms ease-out'))
]);

export const toggleUcSlider: any = trigger('sliderState', [
  state('slideUp', style({
    top: '-40px'
  })),
  state('slideDown', style({
    top: '0px'
  })),
  transition('* => *', animate(chatAnim/2 + 'ms ease-out'))
]);
