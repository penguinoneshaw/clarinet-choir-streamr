import fbvideoUnit from '../../views/partials/fbvideo.pug';

const fbVideoUnitElement = ({ fbvideo }) => {
  const videoUnitTemplate = document.createElement('template');
  videoUnitTemplate.innerHTML = fbvideoUnit({ fbvideo });
  return videoUnitTemplate.content.firstChild;
};

export class ConcertDisplay {
  static showCurrentStatus(status) {
    document.querySelectorAll('.controls a.active').forEach(element => element.classList.remove('active'));
    document.querySelector(`.controls a[data-selector|="${status}"]`).classList.add('active');
  }

  static updateConcertInfo(concert) {
    this.insertVideo(concert);
  }

  static insertVideo(concert) {
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
