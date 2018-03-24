var omniConcert;
var socket = io();

$(function () {


});

socket.on("concert-details", (concert) => {
  omniConcert = concert;
  updatePiece(concert)
});

socket.on("disconnect", (s) => {
  $(".controlpanel").hide()
  $("#maincontent").prepend(`<div id="connection-warning" class="alert alert-warning">Server disconnected!</div>`)
})

socket.on("reconnect", (s) => {
  $("#connection-warning").remove()
  $('.controlpanel').show()
})

socket.on("nowplaying-update", function (nowplaying) {
  omniConcert.nowplaying = nowplaying;

  updatePiece(omniConcert)

})

$("input#password").on("keyup submit", (e) => {
  if ($("input#password").val() == "rain always reminds me of you") {
    $("form").remove()
    $(".controlpanel").show()

    $("#controls a").on("click", function(event){
      event.preventDefault();
      omniConcert.nowplaying = $(event.currentTarget).data("selector")
      socket.emit("nowplaying-update", omniConcert.nowplaying)
      updatePiece(omniConcert)
    });

    $("#charity a").on("click", function(event){
      event.preventDefault();
      socket.emit("charity-display-update", $(event.currentTarget).data("charity"))
    });
}
})

function updatePiece(concert){
  /* Changes the piece currently marked as active on the control panel */

  $("a.active").removeClass("active")
  $(`#controls a[data-selector|="${concert.nowplaying}"]`).addClass("active")
}
