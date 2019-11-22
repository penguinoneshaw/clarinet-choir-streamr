export class Concert {
  constructor(ConcertDisplay) {
    this.ConcertDisplay = ConcertDisplay;
    this.concert = undefined;
    this.status = 'state-blank';
  }
  set status(status) {
    this._status = status;
    this.ConcertDisplay.showCurrentStatus(status);
  }
  get status() {
    return this._status;
  }
}
