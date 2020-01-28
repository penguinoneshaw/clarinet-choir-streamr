import { ConcertDisplay, Concert, Piece, isPiece } from '../interfaces';

function updateNowPlaying(piece: Piece): { title: string; credits: string } {
  const title = piece.subtitle ? piece.title + ' (' + piece.subtitle + ')' : piece.title;

  const credits = [];
  if (piece.composer) credits.push(piece.composer);
  if (piece.arranger) credits.push('arr. ' + piece.arranger);

  return { title, credits: credits.join(' ') };
}

function titleCase(str: string): string {
  const splitStr = str.toLowerCase().split(/[ 0-9]/);
  for (let i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(' ').trim();
}

export class OverlayConcertDisplay implements ConcertDisplay {
  updateConcertInfo(concert: Concert): void {
    this.concert = concert;
  }
  private concert: Concert;
  private timeline: gsap.core.Timeline;

  constructor(timeline: gsap.core.Timeline) {
    this.timeline = timeline;
  }

  updateState(stateString: string): void {
    const currentActive = document.querySelector('.active');

    if (currentActive) {
      this.timeline
        .to(currentActive, 0.3, {
          opacity: 0,
          className: '-=active'
        })
        .set(currentActive, { clearProps: 'all', className: '+=hidden' })
        .add('fade-out-complete');
    }
    let elem: HTMLElement = document.querySelector('#other-states');

    const state = stateString.split('-');

    switch (state.shift()) {
      case 'state':
        this.timeline.call(() => {
          elem.textContent = this.concert.otherStates[state.join()].stream;
        });
        break;

      case 'committee':
        this.timeline.call(() => {
          elem.textContent = `Currently Speaking: ${this.concert.committee[state.join()]} (${titleCase(state.join())})`;
        });

        break;

      case 'conductor':
        this.timeline.call(() => {
          elem.textContent = `Currently Speaking: ${this.concert.conductor.name} (${this.concert.conductor.title})`;
        });

        break;
      case 'piece': {
        const piece = this.concert.pieces[parseInt(state[0], 10)];
        if (isPiece(piece)) {
          elem = document.querySelector('#nowplaying');

          const { credits, title } = updateNowPlaying(piece);
          this.timeline.call(() => {
            elem.querySelector('#title').textContent = title;
            elem.querySelector('#composer').textContent = credits;
          });
        } else {
          this.timeline.call(() => {
            elem.textContent = piece.stream;
          });
        }

        break;
      }
      default:
        return;
    }

    this.timeline
      .set(
        elem,
        {
          opacity: 0,
          className: '-=hidden'
        },
        'fade-out-complete'
      )
      .to(elem, 0.3, {
        opacity: 1,
        className: '+=active'
      })
      .set(elem, { clearProps: 'all' });
  }
}
