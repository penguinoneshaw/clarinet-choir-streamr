$(function() {
  var socket = io()
  var omniConcert;
  var general = new TimelineLite();

  socket.on("concert-details", function(concert) {
    omniConcert = concert;

    $("#concert-title").text(omniConcert.concert);
    $("#conductor").text(omniConcert.conductor);
    updatePiece(omniConcert, general);

  });

  socket.on("nowplaying-update", function(nowplaying) {
    omniConcert.nowplaying = nowplaying;
    updatePiece(omniConcert, general);
  })
});

function updatePiece(concert, tl) {
  var currentactive = $(".active");
  if ( currentactive.length != 0 ){
    tl.to(currentactive, 1, {
      ease: Sine.easeInOut,
      opacity: 0,
      className: "-=active"
    }).set(currentactive, {clearProps: "all", className: "+=hidden"}).add("fade-out-complete");
  }
  var elem;
  console.log(concert.nowplaying)
  var state = concert.nowplaying.split("-")

  switch (state.shift()) {
    case "state":
      tl.call(() => {
        $("#other-states").text(concert.otherStates[state.join()].stream)
      })
      elem = $("#other-states")
      break;
    case "committee":
      tl.call(() => {
        $("#other-states").text("Currently Speaking: " +  concert.committee[state.join()] + ` (${titleCase(state.join())})`)
      })
      elem = $("#other-states")
      break;
    case "piece":
      elem = $("#nowplaying");
      var piece = concert.pieces[parseInt(state[0])];
      updateNowPlaying(piece)

      break;
    default:
      return;
  }

  tl.set(elem, {
    className: "-=hidden",
    opacity: 0
  }, "fade-out-complete").to(elem, 1, {
    ease: Sine.easeInOut,
    opacity: 1,
    className: "+=active",
  }).set(elem, {clearProps: "all"});
};

function updateNowPlaying(piece) {
  var title = piece.subtitle ? piece.title + " (" + piece.subtitle + ")" : piece.title

  var credits = [];
  if (piece.composer) credits.push(piece.composer);
  if (piece.arranger) credits.push("arr. " + piece.arranger);

  $("#nowplaying #title").text(title);
  $("#nowplaying #composer").text(credits.join(" "))
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
