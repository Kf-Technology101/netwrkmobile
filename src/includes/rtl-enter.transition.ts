import { Animation, PageTransition } from 'ionic-angular';

export class ModalRTLEnterAnimation extends PageTransition {

  public init() {
    const ele = this.enteringView.pageRef().nativeElement;
    const wrapper = new Animation(this.plt, ele.querySelector('.modal-wrapper'));
    let modalW = (<HTMLElement>ele.querySelector('.modal-wrapper')).clientWidth;

    wrapper.beforeStyles({ 'transform': 'translate3d(' + modalW + 'px, 0, 0)', 'opacity': 1});
    wrapper.fromTo('opacity', 1, 1);
    wrapper.fromTo('transform', 'translate3d(' + modalW + 'px, 0, 0)', 'translate3d(0 , 0, 0)');

    this
      .element(this.enteringView.pageRef())
      .duration(500)
      .easing('cubic-bezier(.1, .7, .1, 1)')
      .add(wrapper);
  }
}
