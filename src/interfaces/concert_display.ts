import { Concert } from './concert';

export interface ConcertDisplay {
  updateConcertInfo(concert: Concert): void;
  updateState(state: string): void;
}
