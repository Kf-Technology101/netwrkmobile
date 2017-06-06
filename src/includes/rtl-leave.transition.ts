import { Animation, PageTransition } from 'ionic-angular';

export class ModalRTLLeaveAnimation extends PageTransition {

  public init() {
    const ele = this.leavingView.pageRef().nativeElement;
    const wrapper = new Animation(this.plt, ele.querySelector('.modal-wrapper'));
    const contentWrapper = new Animation(this.plt, ele.querySelector('.wrapper'));
    let modalW = (<HTMLElement>ele.querySelector('.modal-wrapper')).clientWidth;

    wrapper.beforeStyles({ 'transform': 'translate3d(' + modalW + 'px, 0, 0)'});
    wrapper.fromTo('opacity', 1, 1);
    wrapper.fromTo('transform', 'translate3d(0, 0, 0)', 'translate3d(' + modalW + 'px, 0, 0)');
    contentWrapper.fromTo('opacity', 1, 0);

    this
      .element(this.leavingView.pageRef())
      .duration(500)
      .easing('cubic-bezier(.1, .7, .1, 1)')
      .add(contentWrapper)
      .add(wrapper);
  }
}
