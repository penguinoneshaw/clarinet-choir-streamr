import fbvideoUnit from '../../views/partials/fbvideo.pug';
import { Concert, ConcertDisplay } from '../interfaces';

const fbVideoUnitElement = ({ fbvideo }): ChildNode => {
  const videoUnitTemplate = document.createElement('template');
  videoUnitTemplate.innerHTML = fbvideoUnit({ fbvideo });
  return videoUnitTemplate.content.firstChild;
};

export class ControlPanelConcertDisplay implements ConcertDisplay {
  updateState(status: string): void {
    document.querySelectorAll('.controls a.active').forEach(element => element.classList.remove('active'));
    document.querySelector(`.controls a[data-selector|="${status}"]`).classList.add('active');
  }

  updateConcertInfo(concert: Concert): void {
    this.insertVideo(concert);
  }

  private insertVideo(concert: { fbvideo: string }): void {
    const setup = document.querySelector('#setup');
    const video = setup.querySelector('.video');

    if (video && concert.fbvideo) {
      video.parentNode.replaceChild(fbVideoUnitElement(concert), video);
    } else if (concert.fbvideo) {
      setup.appendChild(fbVideoUnitElement(concert));
    } else if (video) {
      video.remove();
    }
  }
}
