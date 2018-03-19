$(function() {
  var socket = io()
  var omniConcert;

  socket.on("concert-details", function(concert) {
    omniConcert = concert;

    $("#concert-title").text(omniConcert.concert);
    $("#conductor").text(omniConcert.conductor);
    updatePiece(omniConcert);

  });

  socket.on("nowplaying-update", function(nowplaying) {
    omniConcert.nowplaying = nowplaying;
    updatePiece(omniConcert);
  })
});

function updatePiece(concert) {
  var tl = new TimelineLite();

  var currentactive = $(".active");
  var elem;

  tl.to(currentactive, 1, {
    ease: Sine.easeInOut,
    opacity: 0,
    className: "-=active",
    onComplete: function(){
      tl.set(elem, {opacity: "auto"})
    }
  });

  tl.set(currentactive, {className: "+=hidden"});

  if (concert.nowplaying === "preroll") {
    elem = $("#preroll");
  } else if (concert.nowplaying === "interval") {
    elem = $("#interval");
  } else if (Number.isInteger(concert.nowplaying)) {
    var piece = concert.pieces[concert.nowplaying];
    tl.call(updateNowPlaying, [piece]);
    elem = $("#nowplaying");
  };

  tl.set(elem, {
    className: "-=hidden",
    opacity: 0
  });

  tl.to(elem, 1, {
    ease: Sine.easeInOut,
    opacity: 1,
    className: "+=active"
  });
  tl.play()
};

function updateNowPlaying(piece) {
  var title = piece.subtitle ? piece.title + " (" + piece.subtitle + ")" : piece.title

  var credits = [];
  if (piece.composer) credits.push(piece.composer);
  if (piece.arranger) credits.push("arr. " + piece.arranger);

  $("#nowplaying #title").text(title);
  $("#nowplaying #composer").text(credits.join(" "))
}
