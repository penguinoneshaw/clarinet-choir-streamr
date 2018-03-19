$(function () {
  var socket = io();
  var omniConcert;

  socket.on("concert-details", function (concert){
    omniConcert = concert;
    $("#title").text(concert.concert);
    updatePiece(concert)
    list = $("ul#nowplayingselector");
    list.empty()

    concert.pieces.forEach(function (piece, index){
      li = $("<li><a href=\"#\" data-piece-number=\""+ index + "\">"+ piece.title + "</a></li>").append()

      list.append(li)
    })
  });

  socket.on("nowplaying-update", function (nowplaying) {
    omniConcert.nowplaying = nowplaying;

    updatePiece(omniConcert)

  })

  $("input#password").on("change keyup submit",function (e) {
    if ($("input#password").val() == "rain always reminds me of you") {
      $("form").hide()
      $("#controls").show()
      $("button.controller").on("click", function(event){
        event.preventDefault();
        socket.emit("nowplaying-update",$(this).data("selector"))
        omniConcert.nowplaying = $(this).data("selector")
        updatePiece(omniConcert)
      })

      $("ul#nowplayingselector a").on("click", function(event){
        event.preventDefault();
        socket.emit("nowplaying-update", parseInt($(this).data("piece-number")))
        omniConcert.nowplaying = $(this).data("piece-number")
        updatePiece(omniConcert)
      });


    }
  })
});

function updatePiece(concert){
  if (concert.nowplaying === "preroll") {
    $("#nowplaying #title").text("Showing Preroll (text, I can't control OBS)")
    $("#nowplaying #composer").text("")
  } else if (concert.nowplaying === "interval") {
      $("#nowplaying #title").text("Showing Interval")
      $("#nowplaying #composer").text("")
  } else if (Number.isInteger(concert.nowplaying)) {
    var piece = concert.pieces[concert.nowplaying]
    updateNowPlaying(piece);
  }
}

function updateNowPlaying(piece) {
  var title = piece.subtitle ? piece.title + " ("+ piece.subtitle + ")" : piece.title

  var credits = [];
  if (piece.composer) credits.push(piece.composer);
  if (piece.arranger) credits.push("arr. " + piece.arranger);

  $("#nowplaying #title").text(title);
  $("#nowplaying #composer").text(credits.join(" "))
}
