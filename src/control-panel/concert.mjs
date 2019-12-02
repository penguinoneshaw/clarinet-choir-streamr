export class Concert {
  constructor(ConcertDisplay) {
    this.ConcertDisplay = ConcertDisplay;
    this._concert = undefined;
    this.status = 'state-blank';
  }
  set status(status) {
    this._status = status;
    this.ConcertDisplay.showCurrentStatus(status);
  }
  get status() {
    return this._status;
  }
  set concert(concert) {
    this._concert = concert;
    this.ConcertDisplay.updateConcertInfo(this._concert);
  }
  get concert() {
    return this._concert;
  }
}
