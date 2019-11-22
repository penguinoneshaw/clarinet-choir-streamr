$(function() {
  const socket = io();
  let omniConcert;
  let general = new TimelineLite();

  TweenLite.set('#charity', { scaleX: 0, opacity: 0 });

  socket.on('concert-details', function(concert) {
    omniConcert = concert;
    updatePiece(omniConcert, general);
  });

  socket.on('nowplaying-update', function(nowplaying) {
    omniConcert.nowplaying = nowplaying;
    updatePiece(omniConcert, general);
  });

  socket.on('charity-display-update', function(state) {
    if (state) {
      TweenLite.to('#charity', 1, { scaleX: 1, opacity: 1, ease: Sine.easeOut });
    } else {
      TweenLite.to('#charity', 1, { scaleX: 0, opacity: 0, ease: Sine.easeIn });
    }
  });
});

function updatePiece(concert, tl) {
  let currentactive = $('.active');
  if (currentactive.length != 0) {
    tl.to(currentactive, 1, {
      ease: Sine.easeInOut,
      opacity: 0,
      className: '-=active'
    })
      .set(currentactive, { clearProps: 'all', className: '+=hidden' })
      .add('fade-out-complete');
  }
  let elem;

  let state = concert.nowplaying.split('-');

  switch (state.shift()) {
    case 'state':
      tl.call(() => {
        $('#other-states').text(concert.otherStates[state.join()].stream);
      });
      elem = $('#other-states');
      break;
    case 'committee':
      tl.call(() => {
        $('#other-states').text(
          'Currently Speaking: ' + concert.committee[state.join()] + ` (${titleCase(state.join())})`
        );
      });
      elem = $('#other-states');
      break;
    case 'conductor':
      tl.call(() => {
        $('#other-states').text(`Currently Speaking: ${concert.conductor.name} (${concert.conductor.title})`);
      });
      elem = $('#other-states');
      break;
    case 'piece':
      elem = $('#nowplaying');
      let piece = concert.pieces[parseInt(state[0])];
      tl.call(updateNowPlaying, [piece]);

      break;
    default:
      return;
  }

  tl.set(
    elem,
    {
      className: '-=hidden',
      opacity: 0
    },
    'fade-out-complete'
  )
    .to(elem, 1, {
      ease: Sine.easeInOut,
      opacity: 1,
      className: '+=active'
    })
    .set(elem, { clearProps: 'all' });
}

function updateNowPlaying(piece) {
  let title = piece.subtitle ? piece.title + ' (' + piece.subtitle + ')' : piece.title;

  let credits = [];
  if (piece.composer) credits.push(piece.composer);
  if (piece.arranger) credits.push('arr. ' + piece.arranger);

  $('#nowplaying #title').text(title);
  $('#nowplaying #composer').text(credits.join(' '));
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

document.addEventListener('keypress', ev => {
  if (ev.key === 'f') {
    document.body.requestFullscreen();
  }
});
