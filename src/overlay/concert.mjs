export class Concert {
  constructor(concertDisplay) {
    this.concert = undefined;
    this.status = 'state-blank';
    this.concertDisplay = concertDisplay;
  }
  set status(status) {
    this._status = status;
    if (this.concertDisplay) {
      this.concertDisplay.updatePiece(this.concert, this._status);
    }
  }
  get status() {
    return this._status;
  }
}
