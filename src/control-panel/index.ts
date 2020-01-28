import { ConcertState } from '../shared/concert_state';
import io from 'socket.io-client';
import 'formdata-polyfill';
import { ControlPanelConcertDisplay } from './concert-display';
import '../styles/index.scss';

const _socket = io();
const concert = new ConcertState(new ControlPanelConcertDisplay());

_socket.on('concert-details', concertObject => {
  concert.concert = concertObject;
});

_socket.on('nowplaying-update', update => {
  concert.status = update;
});

document.querySelectorAll('.controls a').forEach(el =>
  el.addEventListener('click', ev => {
    ev.preventDefault();
    concert.status = (ev.currentTarget as HTMLAnchorElement).dataset['selector'] || 'state-blank';
    _socket.emit('nowplaying-update', concert.status);
  })
);

document.querySelector('form#videoLink').addEventListener('submit', evt => {
  evt.preventDefault();
  const formData = new FormData(evt.target as HTMLFormElement);
  _socket.emit('change-video-link', formData.get('facebook_video_url'));
});
