import { ConcertDisplay, Concert } from '../interfaces';

export class ConcertState {
  _status: string;
  _concert: Concert;
  concertDisplay: ConcertDisplay;

  constructor(concertDisplay: ConcertDisplay) {
    this.concertDisplay = concertDisplay;
    this._concert = undefined;
    this.status = 'state-blank';
  }
  set status(status) {
    this._status = status;
    this.concertDisplay.updateState(status);
  }
  get status(): string {
    return this._status;
  }
  set concert(concert) {
    this._concert = concert;
    this.concertDisplay.updateConcertInfo(this._concert);
  }
  get concert(): Concert {
    return this._concert;
  }
}
