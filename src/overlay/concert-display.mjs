export class ConcertDisplay {
  constructor(timeline) {
    this.timeline = timeline;
  }

  updatePiece(concert, nowplaying) {
    let currentactive = document.querySelector('.active');

    if (currentactive) {
      this.timeline
        .to(currentactive, {
          opacity: 0,
          className: '-=active'
        })
        .set(currentactive, { clearProps: 'all', className: '+=hidden' })
        .add('fade-out-complete');
    }
    let elem;

    let state = nowplaying.split('-');

    switch (state.shift()) {
      case 'state':
        elem = document.querySelector('#other-states');

        this.timeline.call(() => {
          elem.textContent = concert.otherStates[state.join()].stream;
        });
        break;

      case 'committee':
        elem = document.querySelector('#other-states');

        this.timeline.call(() => {
          elem.textContent = `Currently Speaking: ${concert.committee[state.join()]} (${titleCase(state.join())})`;
        });

        break;

      case 'conductor':
        elem = document.querySelector('#other-states');

        this.timeline.call(() => {
          elem.textContent = `Currently Speaking: ${concert.conductor.name} (${concert.conductor.title})`;
        });

        break;
      case 'piece': {
        const piece = concert.pieces[parseInt(state[0], 10)];
        if (piece.type == 'piece') {
          elem = document.querySelector('#nowplaying');

          const { credits, title } = updateNowPlaying(piece);
          this.timeline.call(() => {
            elem.querySelector('#title').textContent = title;
            elem.querySelector('#composer').textContent = credits;
          });
        } else {
          elem = document.querySelector('#other-states');

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
      .to(elem, {
        opacity: 1,
        className: '+=active'
      })
      .set(elem, { clearProps: 'all' });
  }
}

function updateNowPlaying(piece) {
  let title = piece.subtitle ? piece.title + ' (' + piece.subtitle + ')' : piece.title;

  let credits = [];
  if (piece.composer) credits.push(piece.composer);
  if (piece.arranger) credits.push('arr. ' + piece.arranger);

  return { title, credits: credits.join(' ') };
}

function titleCase(str) {
  var splitStr = str.toLowerCase().split(' ');
  for (var i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(' ');
}
