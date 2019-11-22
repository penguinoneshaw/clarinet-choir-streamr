import { Concert } from './concert';
import io from 'socket.io-client';
import 'formdata-polyfill';
export class ConcertDisplay {
  static showCurrentStatus(status) {
    document.querySelectorAll('#controls a.active').forEach(element => element.classList.remove('active'));
    document.querySelector(`#controls a[data-selector|="${status}"]`).classList.add('active');
  }
}

const _socket = io();
const concert = new Concert(ConcertDisplay);

_socket.on('concert-details', concert_object => {
  concert.concert = concert_object;
});

_socket.on('nowplaying-update', update => {
  concert.status = update;
});

document.querySelectorAll('#controls a').forEach(el =>
  el.addEventListener('click', ev => {
    ev.preventDefault();
    concert.status = ev.currentTarget.dataset['selector'] || 'state-blank';
    _socket.emit('nowplaying-update', concert.status);
  })
);

document.querySelector('form#videoLink').addEventListener('submit', evt => {
  evt.preventDefault();
  const formData = new FormData(evt.target);
  _socket.emit('change-video-link', formData.get('facebook_video_url'));
});
