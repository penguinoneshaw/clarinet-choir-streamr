import io from 'socket.io-client';
import gsap from 'gsap';
import { ConcertState } from '../shared/concert_state';
import { OverlayConcertDisplay } from './concert-display';
import logo from '../images/logo.svg';
import '../styles/overlay.scss';
import { Concert } from '../interfaces';

document.querySelector('#logo').innerHTML = logo;

const socket = io();
const general = gsap.timeline({ defaults: { duration: 0.5, ease: 'sine.inOut' } });
const concert = new ConcertState(new OverlayConcertDisplay(general));

socket.on('concert-details', (_concert: Concert) => {
  concert.concert = _concert;
});

socket.on('nowplaying-update', (nowPlaying: string) => {
  concert.status = nowPlaying;
});

document.addEventListener('keypress', ev => {
  if (ev.key === 'f') {
    document.body.requestFullscreen();
  }
});
