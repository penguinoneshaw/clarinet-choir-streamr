var omniConcert;
var socket = io();
var timeline = new TimelineMax();

$(function() {
  timeline.pause()
  timeline.to($(".description"), 0.3, {
    height: 0
  })


  socket.on("concert-details", (concert) => {
    omniConcert = concert;
    updatePiece(concert)
  });

  socket.on("nowplaying-update", function(nowplaying) {
    omniConcert.nowplaying = nowplaying;
    updatePiece(omniConcert)
  })

  function updatePiece(concert) {
    /* Changes the piece currently marked as active on the control panel */
    var cur = $(`.piece[data-piece*="${concert.nowplaying}"]`)

    timeline.to($(".piece.active"), 0.5, {
      className: "-=active"
    }).to($(".description"), 0.3, {
      height: 0
    }, "-=0.3").to(cur , 1, {
      onComplete: function () {
        details = this.target.children(".description")

        timeline.set(details, {height:"auto"})
        timeline.from(details, 1, {height:0, ease: Sine.easeOut})
      },
      ease: Elastic.easeOut,
      className: "+=active"
    })
  }
});
