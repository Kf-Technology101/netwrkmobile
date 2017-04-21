export class Toggleable {
  state: any;
  hidden: boolean;

  constructor(
    state: any,
    hidden?: boolean
  ) {
    this.state = state;
    this.hidden = hidden;
  }
}
