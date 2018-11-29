var omniConcert;
const socket = io();

$(function () {

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

  function update_interface_after_signin() {
    $("form").remove()
    $(".controlpanel").show()

    $("#controls a").on("click", function (event) {
      event.preventDefault();
      omniConcert.nowplaying = $(event.currentTarget).data("selector")
      socket.emit("nowplaying-update", omniConcert.nowplaying)
      updatePiece(omniConcert)
    });
  }
  if (document.cookie.split(';').filter((item) => item.includes('signed-in=BlowHarderTongueQuickerFingerFaster')).length) {
    console.log("DONE")
    update_interface_after_signin();
  } else {
    $("input#password").on("keyup submit", (e) => {
      if ($("input#password").val() == "from strength to strength") {
        document.cookie = "signed-in=BlowHarderTongueQuickerFingerFaster;max-age=3600";
        update_interface_after_signin();
      }
    })
  }

});

function updatePiece(concert) {
  /* Changes the piece currently marked as active on the control panel */

  $("a.active").removeClass("active")
  $(`#controls a[data-selector|="${concert.nowplaying}"]`).addClass("active")
}