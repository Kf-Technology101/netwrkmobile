export class Toggleable {
  state: any;
  hidden: boolean;
  prevState: any;

  constructor(
    state: any,
    hidden?: boolean
  ) {
    this.state = state;
    this.hidden = hidden;
  }

  setState(newState: any) {
    if (this.prevState != this.state)
      this.prevState = this.state;
    if (this.state != newState)
      this.state = newState;
  }

  getState() {
    return this.state;
  }

  setPrevState() {
    if (this.prevState) {
      this.state = this.prevState;
    }
  }

  show() {
    this.hidden = false;
  }

  hide() {
    this.hidden = true;
  }
}
