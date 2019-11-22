import io from 'socket.io-client';
import gsap from 'gsap';
import { Concert } from './concert';
import { ConcertDisplay } from './concert-display';
import logo from '../images/logo.svg';

console.log(logo);
document.querySelector('#logo').innerHTML = logo;

const socket = io();
const general = gsap.timeline({ defaults: { duration: 0.5, ease: 'sine.inOut' } });
const concert = new Concert(new ConcertDisplay(general));

socket.on('concert-details', function(_concert) {
  concert.concert = _concert;
});

socket.on('nowplaying-update', function(nowplaying) {
  concert.status = nowplaying;
});

document.addEventListener('keypress', ev => {
  if (ev.key === 'f') {
    document.body.requestFullscreen();
  }
});
