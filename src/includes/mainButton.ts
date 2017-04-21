export class MainButton {
  state: string;
  hidden: boolean;
  prevState: string;

  constructor(
    state: any,
    hidden: boolean
  ) {
    this.state = state;
    this.hidden = hidden;
  }

  setState(newState: string) {
    this.prevState = this.state;
    this.state = newState;
  }
  setPrevState() {
    if (this.prevState) {
      this.state = this.prevState;
    }
  }

}
