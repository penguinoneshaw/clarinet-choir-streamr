var fs = require('fs');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'))

app.set('view engine', 'pug')
app.set('views', './views')

var concert_file = process.argv[2]

concert = JSON.parse(fs.readFileSync(concert_file, "utf8"));
console.log("This is the file for: " +  concert.concert + " being held at " + concert.venue + ".")
concert.nowplaying = "state-preroll";

var show_charity_notice = false;


app.get('/control-panel', function(req, res){
  res.render("control-panel", concert);
});

app.get('/overlay', function(req, res){
  res.render("overlay", concert)
});

app.get('/', (req, res) => {
  res.render("index", concert)
})

io.on('connection', function(socket){
  console.log("A page connected")

  socket.emit('concert-details', concert);
  socket.emit('charity-display-update', show_charity_notice)

  socket.on('nowplaying-update', function (nowPlaying) {
    socket.broadcast.emit('nowplaying-update', nowPlaying)
    concert.nowplaying = nowPlaying;
  });

  socket.on('charity-display-update', (newState) => {
    if (show_charity_notice != newState){
      show_charity_notice = newState;
      socket.broadcast.emit('charity-display-update', show_charity_notice)
    }
  });


  socket.on('disconnect', function(){
    console.log('page disconnected');
  });
});

io.on("reconnect", (socket) => {
  socket.emit('concert-details', concert)
})


http.listen(3000, function(){
  console.log('listening on *:3000');
});
